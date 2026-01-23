// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * LocalSellDesk (TCT -> USDT)
 * - Users SELL TCT here (your "local swap sell side")
 * - Users BUY on PancakeSwap (frontend uses Pancake v3 router)
 *
 * Key protections:
 * - Daily cap in USDT (limits how much leaves treasury per day)
 * - Max per transaction in USDT
 * - Admin sets a "manual price" (USDT per 1 TCT) in 1e18
 * - Contract checks manual price is within maxDeviationBps of Pancake v3 spot price (slot0)
 *
 * IMPORTANT:
 * - This does NOT "fix" the market price on Pancake. It provides a controlled exit desk.
 */

interface IERC20 {
    function decimals() external view returns (uint8);
    function balanceOf(address a) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IPancakeV3PoolLike {
    function token0() external view returns (address);
    function token1() external view returns (address);

    // UniswapV3-style slot0 for Pancake v3
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );
}

contract LocalSellDesk {
    address public owner;

    IERC20 public immutable TCT;
    IERC20 public immutable USDT;
    IPancakeV3PoolLike public immutable pool;

    // Manual price: USDT per 1 TCT, scaled to 1e18
    uint256 public manualPriceE18;

    // Allowed deviation between manual price and pool spot price
    // e.g. 500 = 5%
    uint256 public maxDeviationBps = 500;

    // Limits
    uint256 public dailyCapUSDT;    // in USDT decimals
    uint256 public maxPerTxUSDT;    // in USDT decimals

    // Daily usage tracking
    uint256 public todayKey;        // day number
    uint256 public usedTodayUSDT;   // in USDT decimals

    bool public sellPaused;

    event OwnerChanged(address indexed newOwner);
    event ManualPriceUpdated(uint256 priceE18);
    event LimitsUpdated(uint256 dailyCapUSDT, uint256 maxPerTxUSDT);
    event MaxDeviationUpdated(uint256 bps);
    event SellPaused(bool paused);

    event FundedUSDT(address indexed from, uint256 amount);
    event Sold(address indexed user, uint256 tctIn, uint256 usdtOut);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        address _tct,
        address _usdt,
        address _pool,
        uint256 _manualPriceE18,
        uint256 _dailyCapUSDT,
        uint256 _maxPerTxUSDT
    ) {
        require(_tct != address(0) && _usdt != address(0) && _pool != address(0), "zero");
        owner = msg.sender;

        TCT = IERC20(_tct);
        USDT = IERC20(_usdt);
        pool = IPancakeV3PoolLike(_pool);

        manualPriceE18 = _manualPriceE18;
        dailyCapUSDT = _dailyCapUSDT;
        maxPerTxUSDT = _maxPerTxUSDT;

        _rollDayIfNeeded();
    }

    // -------------------------
    // Admin
    // -------------------------
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
        emit OwnerChanged(newOwner);
    }

    function setManualPriceE18(uint256 priceE18) external onlyOwner {
        require(priceE18 > 0, "price=0");
        manualPriceE18 = priceE18;
        emit ManualPriceUpdated(priceE18);
    }

    function setLimits(uint256 _dailyCapUSDT, uint256 _maxPerTxUSDT) external onlyOwner {
        dailyCapUSDT = _dailyCapUSDT;
        maxPerTxUSDT = _maxPerTxUSDT;
        emit LimitsUpdated(_dailyCapUSDT, _maxPerTxUSDT);
    }

    function setMaxDeviationBps(uint256 bps) external onlyOwner {
        require(bps <= 2000, "too high"); // safety: max 20%
        maxDeviationBps = bps;
        emit MaxDeviationUpdated(bps);
    }

    function pauseSell(bool paused) external onlyOwner {
        sellPaused = paused;
        emit SellPaused(paused);
    }

    // Deposit USDT treasury (owner or anyone can fund)
    function fundUSDT(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(USDT.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        emit FundedUSDT(msg.sender, amount);
    }

    // Owner withdrawals (treasury management)
    function withdrawUSDT(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero");
        require(USDT.transfer(to, amount), "transfer failed");
    }

    function withdrawTCT(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero");
        require(TCT.transfer(to, amount), "transfer failed");
    }

    // -------------------------
    // User: Sell TCT -> get USDT
    // -------------------------
    function quoteUSDT(uint256 tctAmount) public view returns (uint256 usdtOut) {
        // Convert TCT amount to 1e18 "token units" then multiply by manual price
        uint8 tctDec = TCT.decimals();
        uint8 usdtDec = USDT.decimals();

        // tctAmount (tctDec) -> 1e18
        uint256 tctE18 = tctAmount * (10 ** (18 - tctDec));

        // usdtE18 = tctE18 * priceE18 / 1e18
        uint256 usdtE18 = (tctE18 * manualPriceE18) / 1e18;

        // usdtE18 -> usdtDec
        usdtOut = usdtE18 / (10 ** (18 - usdtDec));
    }

    function sellTCT(uint256 tctAmount, uint256 minUSDTOut) external returns (uint256 usdtOut) {
        require(!sellPaused, "sell paused");
        require(tctAmount > 0, "amount=0");

        _rollDayIfNeeded();

        // 1) Verify manual price is close to Pancake spot
        uint256 spotE18 = getPoolSpotPriceE18_USDTperTCT();
        _requireWithinDeviation(manualPriceE18, spotE18, maxDeviationBps);

        // 2) Quote
        usdtOut = quoteUSDT(tctAmount);
        require(usdtOut >= minUSDTOut, "slippage");
        require(usdtOut <= maxPerTxUSDT, "per-tx cap");
        require(usedTodayUSDT + usdtOut <= dailyCapUSDT, "daily cap");

        // 3) Check treasury balance
        require(USDT.balanceOf(address(this)) >= usdtOut, "no usdt");

        // 4) Take TCT, pay USDT
        require(TCT.transferFrom(msg.sender, address(this), tctAmount), "tct transferFrom failed");
        require(USDT.transfer(msg.sender, usdtOut), "usdt transfer failed");

        usedTodayUSDT += usdtOut;

        emit Sold(msg.sender, tctAmount, usdtOut);
    }

    // -------------------------
    // Price reading from Pancake v3 pool (spot via slot0)
    // Returns USDT per 1 TCT in 1e18
    // -------------------------
    function getPoolSpotPriceE18_USDTperTCT() public view returns (uint256 priceE18) {
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();

        // price token1/token0 = (sqrtPriceX96^2) / 2^192
        // We need USDT per TCT, but depends on which is token0/token1
        address token0 = pool.token0();
        address token1 = pool.token1();

        uint256 ratioX192 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96); // Q192-ish
        // ratio = ratioX192 / 2^192

        // Convert to 1e18 price:
        // If token0=TCT and token1=USDT, then price = USDT/TCT = ratio
        // If token0=USDT and token1=TCT, then price = USDT/TCT = 1/ratio
        uint8 tctDec = TCT.decimals();
        uint8 usdtDec = USDT.decimals();

        if (token0 == address(TCT) && token1 == address(USDT)) {
            // price = token1/token0
            // priceE18 = ratio * 10^(18 + tctDec - usdtDec)
            // ratio = ratioX192 / 2^192
            priceE18 = _mulDiv(ratioX192, 10 ** (18 + tctDec - usdtDec), 2 ** 192);
        } else if (token0 == address(USDT) && token1 == address(TCT)) {
            // price = token0/token1 = 1 / (token1/token0)
            // token1/token0 = ratio => token0/token1 = 1/ratio
            // priceE18 = (2^192 / ratioX192) * 10^(18 + tctDec - usdtDec)
            // Use mulDiv for inversion: (2^192 * scale) / ratioX192
            uint256 scale = 10 ** (18 + tctDec - usdtDec);
            priceE18 = _mulDiv(2 ** 192, scale, ratioX192);
        } else {
            revert("pool tokens mismatch");
        }
    }

    // -------------------------
    // Helpers
    // -------------------------
    function _rollDayIfNeeded() internal {
        uint256 dayNum = block.timestamp / 1 days;
        if (dayNum != todayKey) {
            todayKey = dayNum;
            usedTodayUSDT = 0;
        }
    }

    function _requireWithinDeviation(uint256 a, uint256 b, uint256 bps) internal pure {
        // require |a-b|/b <= bps/10000
        if (a == b) return;
        uint256 diff = a > b ? (a - b) : (b - a);
        // diff * 10000 <= b * bps
        require(diff * 10000 <= b * bps, "price deviation");
    }

    function _mulDiv(uint256 x, uint256 y, uint256 d) internal pure returns (uint256) {
        // minimal mulDiv (no full 512-bit). Works for moderate sizes typical here.
        // For very large values you can swap to OpenZeppelin Math.mulDiv.
        require(d != 0, "div0");
        return (x * y) / d;
    }
}
