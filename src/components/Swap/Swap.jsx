import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Container } from '@mui/system'
import { useWeb3Modal } from '@web3modal/react'
import { useAccount, useSigner } from 'wagmi'
import {
  gasEstimationForAll,
  gasEstimationPayable,
  ToastNotify,
  useUsdtContract,
  useBuySellContract,
  useTokenContract,
  useLocalSellDeskContract,
  usePancakeRouterContract,
  usePancakeQuoterContract,
  getCommas,
} from '../../ConnectivityAss/hooks'
import { formatUnits, parseUnits } from '@ethersproject/units'
import Loading from '../../LoadingSvg'
import { buySellAddress, localSellDeskAddress, pancakeRouterAddress, tokenAddres, usdtAddress } from '../../ConnectivityAss/environment'
import Transactions from '../transactions/Transactions'
import { LoadingButton } from '@mui/lab'
import { KeyboardArrowDown as KeyboardArrowDownIcon, Refresh as RefreshIcon, Reply as ReplyIcon } from '@mui/icons-material'

export const Swap = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { open: connectFn } = useWeb3Modal()
  let { data: signer } = useSigner()
  let buySellContract = useBuySellContract(signer)
  let localSellDeskContract = useLocalSellDeskContract(signer)
  let pancakeRouterContract = usePancakeRouterContract(signer)
  let pancakeQuoterContract = usePancakeQuoterContract(signer)
  let usdtContract = useUsdtContract(signer)
  let tokenContract = useTokenContract(signer)
  const [buyPosition, setbuyPosition] = useState(true)
  const [fromAmount, setfromAmount] = useState('')
  const [toAmount, settoAmount] = useState('')
  const [loading, setloading] = useState(false)
  const { address, isConnected } = useAccount()
  const [tctPrice, setTctPrice] = useState('0')
  const [usdtBalance, setUsdtBalance] = useState('0')
  const [bnbBalance, setBnbBalance] = useState('0')
  const [tctBalance, setTctBalance] = useState('0')
  const [usdtDecimalCache, setUsdtDecimalCache] = useState(null)
  const [tokenDecimalCache, setTokenDecimalCache] = useState(null)

  const open = Boolean(anchorEl)
  const [selectToken, setselectToken] = useState('USDT')
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  })
  const [poolReserves, setpoolReserves] = useState({
    bnbBalance: 0,
    busdBalance: 0,
    tctBalance: 0,
  })
  const [manualPrice, setManualPrice] = useState('0')
  const [dailyCap, setDailyCap] = useState('0')
  const [usedToday, setUsedToday] = useState('0')
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  let init = async () => {
    try {
      const promises = [
        signer ? signer.getBalance() : Promise.resolve(0),
        tokenContract.balanceOf(address || buySellAddress),
      ];
      
      const isLocalSellDeskValid = localSellDeskAddress && localSellDeskAddress !== '0x0000000000000000000000000000000000000000';
      
      if (isLocalSellDeskValid) {
        promises.push(localSellDeskContract.manualPriceE18());
        promises.push(localSellDeskContract.dailyCapUSDT());
        promises.push(localSellDeskContract.usedTodayUSDT());
      } else {
        promises.push(Promise.resolve(parseUnits('0', 18)));
        promises.push(Promise.resolve(parseUnits('0', 18)));
        promises.push(Promise.resolve(parseUnits('0', 18)));
      }

      let [bnbBalance, tctBalance, manualPriceE18, dailyCapUSDT, usedTodayUSDT] = await Promise.all(promises);
      
      setpoolReserves({
        bnbBalance: formatUnits(bnbBalance),
        busdBalance: '0', 
        tctBalance: formatUnits(tctBalance, 12), 
      })

      setManualPrice(formatUnits(manualPriceE18, 18))
      setDailyCap(formatUnits(dailyCapUSDT, 18))
      setUsedToday(formatUnits(usedTodayUSDT, 18))

    } catch (error) {
      console.log("Init Error (contracts might not be deployed yet):", error)
    }
  }

  const orderHandler = async () => {
    try {
      if (!address) return
      
      if (!fromAmount || fromAmount === 0 || isNaN(fromAmount)) {
        setAlertState({
          open: true,
          message: 'Please enter a valid amount.',
          severity: 'error',
        })
        return
      }

      setloading(true)

      const usdtDecimal = await usdtContract.decimals()
      const tokenDecimal = await tokenContract.decimals()
      
      if (buyPosition) {
        // --- BUY LOGIC (USDT -> TCT via PancakeSwap V3 Router) ---
        // selectToken should be 'USDT' for standard Buy TCT
        if (selectToken === 'USDT') {
             const amountIn = parseUnits(fromAmount.toString(), usdtDecimal)
             const usdtBalance = await usdtContract.balanceOf(address)
             
             if (usdtBalance.lt(amountIn)) {
                setAlertState({ open: true, message: 'Insufficient USDT balance', severity: 'error' })
                setloading(false)
                return
             }

             const allowance = await usdtContract.allowance(address, pancakeRouterAddress)
             if (allowance.lt(amountIn)) {
                let approveTx = await usdtContract.approve(pancakeRouterAddress, amountIn) // or MaxUint256
                await approveTx.wait()
             }

             // Execute ExactInputSingle
             // Params: tokenIn, tokenOut, fee, recipient, deadline, amountIn, amountOutMinimum, sqrtPriceLimitX96
             // TCT Address is tokenAddres
             // Pool Fee: usually 500 (0.05%), 2500 (0.25%), 10000 (1%) - Check your pool fee!
             // Assuming 500 for stable-ish or 2500. Let's assume 2500 (0.25%) or pass as param?
             // User didn't specify fee tier. Standard V3 is often 2500 or 10000 for volatile pairs.
             const feeTier = 2500; 

             const params = {
                tokenIn: usdtAddress,
                tokenOut: tokenAddres,
                fee: feeTier,
                recipient: address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 mins
                amountIn: amountIn,
                amountOutMinimum: 0, // SLIPPAGE PROTECTION NEEDED IN REAL APP
                sqrtPriceLimitX96: 0
             }

             let buyTx = await pancakeRouterContract.exactInputSingle(params)
             await buyTx.wait()
        } else {
             // Buy with BNB not implemented in this prompt scope via V3, keeping simple
             setAlertState({ open: true, message: 'BNB Buy not implemented in this demo', severity: 'warning' })
        }

      } else {
        // --- SELL LOGIC (TCT -> USDT via LocalSellDesk) ---
        // selectToken should be 'TCT' (implied by !buyPosition layout usually showing TCT as input? 
        // Actually layout shows "From" amount. If !buyPosition (Sell), From is TCT.
        
        const amountIn = parseUnits(fromAmount.toString(), tokenDecimal)
        const tctBalance = await tokenContract.balanceOf(address)

        if (tctBalance.lt(amountIn)) {
            setAlertState({ open: true, message: 'Insufficient TCT balance', severity: 'error' })
            setloading(false)
            return
        }

        const allowance = await tokenContract.allowance(address, localSellDeskAddress)
        if (allowance.lt(amountIn)) {
            let approveTx = await tokenContract.approve(localSellDeskAddress, amountIn)
            await approveTx.wait()
        }

        // Sell TCT
        // sellTCT(amount, minUSDTOut)
        // We need a quote first to set minUSDTOut (slippage)
        const quote = await localSellDeskContract.quoteUSDT(amountIn)
        const minOut = quote.mul(95).div(100) // 5% slippage tolerance for example

        let sellTx = await localSellDeskContract.sellTCT(amountIn, minOut)
        await sellTx.wait()
      }

      setloading(false)
      setAlertState({
        open: true,
        message: 'Transaction Successful',
        severity: 'success',
      })
      init() // refresh limits
      fetchBalances() // refresh balances

    } catch (error) {
      console.log('Error', error)
      setloading(false)
      setAlertState({
        open: true,
        message: error?.reason || error?.message || 'Transaction Failed',
        severity: 'error',
      })
    }
  }

  let doCalculations = async () => {
    try {
      if (!fromAmount) return

      // Check if LocalSellDesk address is valid
      const isLocalSellDeskValid = localSellDeskAddress && localSellDeskAddress !== '0x0000000000000000000000000000000000000000'

      // For display only "To" amount
      if (buyPosition) {
         // Buying TCT with USDT (Pancake V3)
         
         const usdtDecimal = await usdtContract.decimals()
         const tokenDecimal = await tokenContract.decimals()
         
         // Rough estimate using manual price (even though it's for selling, it gives an idea)
         // Real app should use V3 Quoter.
         const amountIn = parseUnits(fromAmount.toString(), usdtDecimal)
         
         if (isLocalSellDeskValid) {
            const price = await localSellDeskContract.manualPriceE18() // USDT per TCT (1e18)
            
            if (price.gt(0)) {
                // (amountIn * 1e18) / price
                const estimatedTCT = amountIn.mul(parseUnits('1', 18)).div(price)
                settoAmount(formatUnits(estimatedTCT, tokenDecimal))
            } else {
                settoAmount('0')
            }
         } else {
             settoAmount('0')
         }

      } else {
         // Selling TCT (LocalSellDesk)
         if (!isLocalSellDeskValid) {
             settoAmount('0')
             return
         }

         const tokenDecimal = await tokenContract.decimals()
         const amountIn = parseUnits(fromAmount.toString(), tokenDecimal)
         const quote = await localSellDeskContract.quoteUSDT(amountIn)
         const usdtDecimal = await usdtContract.decimals()
         settoAmount(formatUnits(quote, usdtDecimal))
      }

    } catch (error) {
      console.error('Error in doCalculations:', error)
    }
  }
  const calculateTctPrice = async () => {
    try {
      // Fetch price from PancakeSwap V3 Quoter
      // Pool Address: 0x4bC40440E313CDDd60b473A02Cb839469FeFbd3f (Fee 2500)
      const amountIn = parseUnits('1', 18)
      const params = {
        tokenIn: tokenAddres,
        tokenOut: usdtAddress,
        amountIn: amountIn,
        fee: 2500,
        sqrtPriceLimitX96: 0
      }
      
      let quote
      try {
        quote = await pancakeQuoterContract.callStatic.quoteExactInputSingle(params)
      } catch (e) {
        console.warn("Quote with fee 2500 failed, trying 10000...")
        const params10000 = { ...params, fee: 10000 }
        try {
          quote = await pancakeQuoterContract.callStatic.quoteExactInputSingle(params10000)
        } catch (e2) {
           console.error("Quote failed for both fees", e2)
           // Fallback to manual price if V3 fails
           if (localSellDeskAddress && localSellDeskAddress !== '0x0000000000000000000000000000000000000000') {
               const priceE18 = await localSellDeskContract.manualPriceE18()
               const price = parseFloat(formatUnits(priceE18, 18))
               setTctPrice(price.toFixed(4))
               return
           }
           setTctPrice('0.00')
           return
        }
      }
      
      const amountOut = quote[0] || quote
      const usdtDecimal = await usdtContract.decimals() // Usually 18 for BSC-USD? Wait, USDT on BSC is 18 decimals?
      // Check USDT decimals. BSC-USD is 18.
      const price = parseFloat(formatUnits(amountOut, usdtDecimal))
      const formattedTctPrice = price.toFixed(4)
      setTctPrice(formattedTctPrice)

    } catch (error) {
      console.error('Error calculating TCT price:', error)
      setTctPrice('0.00')
    }
  }

  useEffect(() => {
    if (pancakeQuoterContract && tokenAddres && usdtAddress) {
        calculateTctPrice()
        const interval = setInterval(calculateTctPrice, 15000) // Update every 15s
        return () => clearInterval(interval)
    }
  }, [pancakeQuoterContract, tokenAddres, usdtAddress])
  const fetchBalances = async () => {
    if (address && signer) {
      try {
        const [usdtBal, tctBal] = await Promise.all([
          usdtContract.balanceOf(address),
          tokenContract.balanceOf(address),
        ])
        const bnbBal = await signer.getBalance()

        setUsdtBalance(formatUnits(usdtBal, await usdtContract.decimals()))
        setTctBalance(formatUnits(tctBal, await tokenContract.decimals()))
        setBnbBalance(formatUnits(bnbBal))
      } catch (error) {
        console.error('Error fetching balances:', error)
      }
    } else {
      setUsdtBalance('0')
      setBnbBalance('0')
      setTctBalance('0')
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [address,signer])
  useEffect(() => {
    calculateTctPrice()
  }, [])
  useEffect(() => {
    init()
  }, [])
  useEffect(() => {
    if (fromAmount) {
      doCalculations()
    } else {
      settoAmount('')
    }
  }, [fromAmount, buyPosition, selectToken])

  return (
    <Container sx={{ py: 10, pt: 13 }} maxWidth='xl'>
      <ToastNotify alertState={alertState} setAlertState={setAlertState} />
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        rowSpacing={2}
        columnSpacing={2}
      >
        {/* <Grid item xs={12} sm={12} md={3} alignSelf="center">
          <Typography
            textAlign="center"
            variant="h1"
            color="#2745EA"
            sx={{ fontSize: "54px" }}
          >
            THE CREST SWAP
          </Typography>
        </Grid> */}

        <Grid item xs={12} sm={12} md={5}>
          <Box
            sx={{
              background: (theme) => theme.palette.background.paper,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '24px',
              p: 3,
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems="center" mb={2}>
              <Typography variant='h5' fontWeight={700}>
                Swap
              </Typography>
              <IconButton sx={{ color: 'text.secondary' }}>
                 <RefreshIcon />
              </IconButton>
            </Box>
            
            {/* Buy/Sell Toggle - Styled like Pancake Tabs */}
            <Box
              sx={{
                background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#eff4f5',
                borderRadius: '16px',
                p: '4px',
                mb: 3,
                display: 'flex'
              }}
            >
                <Button
                  fullWidth
                  variant={buyPosition ? 'contained' : 'text'}
                  color={buyPosition ? 'primary' : 'inherit'}
                  sx={{
                    borderRadius: '12px',
                    color: buyPosition ? 'white' : 'text.secondary',
                    boxShadow: buyPosition ? 1 : 0,
                    transition: 'all 0.3s'
                  }}
                  onClick={() => setbuyPosition(true)}
                >
                  Buy
                </Button>
                <Button
                  fullWidth
                  variant={!buyPosition ? 'contained' : 'text'}
                  color={!buyPosition ? 'primary' : 'inherit'} // Use primary for sell too, or secondary if preferred
                  sx={{
                    borderRadius: '12px',
                    color: !buyPosition ? 'white' : 'text.secondary',
                    boxShadow: !buyPosition ? 1 : 0,
                    transition: 'all 0.3s'
                  }}
                  onClick={() => setbuyPosition(false)}
                >
                  Sell
                </Button>
            </Box>
            
            <Box
              sx={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '24px',
                p: 2,
                mb: 1,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(31, 199, 212, 0.3)'
                }
              }}
            >
            <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='caption' sx={{ letterSpacing: '1px', fontWeight: 700, color: 'text.secondary' }}>
                  FROM
                </Typography>
                <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {!address
                    ? `Balance: 0`
                    : buyPosition
                    ? selectToken === 'BNB'
                      ? `Balance: ${bnbBalance} BNB`
                      : `Balance: ${usdtBalance} USDT`
                    : `Balance: ${tctBalance} TCT`}
                </Typography>
            </Box>

            <Stack
              direction='row'
              alignItems='center'
              spacing={2}
            >
              <Menu
                id='basic-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose()
                    setselectToken('BNB')
                  }}
                >
                    <Box px={1} fontWeight={700}>BNB</Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setselectToken('USDT')
                    handleClose()
                  }}
                >
                    <Box px={1} fontWeight={700}>USDT</Box>
                </MenuItem>
              </Menu>
              <Box sx={{ flexGrow: 1 }}>
                <InputBase
                  placeholder="0.0"
                  type='number'
                  sx={{
                    color: 'text.primary',
                    fontWeight: 800,
                    fontSize: '28px',
                    width: '100%',
                    '& input': { p: 0 }
                  }}
                  value={fromAmount}
                  onChange={(e) => setfromAmount(e.target.value)}
                />
              </Box>
              
              <Button 
                onClick={buyPosition ? handleClick : null}
                variant="contained"
                color={buyPosition ? "primary" : "secondary"}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    fontWeight: 800,
                    minWidth: '140px'
                }}
              >
                {buyPosition ? selectToken : 'TCT'}
              </Button>
            </Stack>
            </Box>

            <Box display="flex" justifyContent="center" my={-2} sx={{ position: 'relative', zIndex: 2 }}>
              <IconButton 
                onClick={() => setbuyPosition(!buyPosition)}
                sx={{ 
                    background: (theme) => theme.palette.background.default,
                    border: '4px solid',
                    borderColor: (theme) => theme.palette.background.paper,
                    width: '40px',
                    height: '40px',
                    '&:hover': {
                        background: (theme) => theme.palette.primary.main,
                        '& svg': { color: 'white' }
                    }
                }}
              >
                 <RefreshIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
              </IconButton>
            </Box>

            <Box
              sx={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '24px',
                p: 2,
                mb: 1,
                mt: 2,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(31, 199, 212, 0.3)'
                }
              }}
            >
            <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='caption' sx={{ letterSpacing: '1px', fontWeight: 700, color: 'text.secondary' }}>
                  TO
                </Typography>
                <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {!address
                    ? `Balance: 0`
                    : buyPosition
                    ? `Balance: ${tctBalance} TCT`
                    : selectToken === 'BNB'
                    ? `Balance: ${bnbBalance} BNB`
                    : `Balance: ${usdtBalance} USDT`}
                </Typography>
            </Box>
            
            <Stack
              direction='row'
              alignItems='center'
              spacing={2}
            >
              <Box sx={{ flexGrow: 1 }}>
                <InputBase
                  placeholder="0.0"
                  type='number'
                  readOnly
                  sx={{
                    color: 'text.primary',
                    fontWeight: 800,
                    fontSize: '28px',
                    width: '100%',
                    '& input': { p: 0 }
                  }}
                  value={toAmount}
                />
                {loading && (
                    <Typography variant="caption" color="primary">
                        Calculating...
                    </Typography>
                )}
              </Box>

                <Button
                  onClick={buyPosition ? null : handleClick}
                  variant="contained"
                  color={!buyPosition ? "primary" : "secondary"}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    fontWeight: 800,
                    minWidth: '140px'
                  }}
                  endIcon={
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <KeyboardArrowDownIcon sx={{ color: 'white', fontSize: '20px' }} />
                    </Box>
                  }
                >
                  {buyPosition ? 'TCT' : selectToken}
                </Button>
              </Stack>
            </Box>

            <Box
              display='flex'
              alignItems='center'
              justifyContent='center'
              my={3}
            >
              <LoadingButton
                variant='contained'
                fullWidth
                size="large"
                sx={{
                  borderRadius: '24px',
                  fontSize: '20px',
                  fontWeight: '800',
                  py: 2,
                  background: 'linear-gradient(90deg, #1FC7D4 0%, #7645D9 100%)',
                  boxShadow: '0px 0px 20px rgba(31, 199, 212, 0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                     transform: 'scale(1.02)',
                     boxShadow: '0px 0px 30px rgba(118, 69, 217, 0.6)',
                  }
                }}
                loading={loading}
                disabled={loading}
                onClick={() => {
          if (isConnected && address) {
            orderHandler()
          } else {
            console.log("Opening Web3Modal connection...")
            connectFn()
          }
        }}
      >
        {isConnected && address
          ? loading
            ? 'Processing...'
            : 'SWAP'
          : 'CONNECT WALLET'}
      </LoadingButton>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={12} md={5}>
          <Box display='flex' justifyContent='center' mb={2}>
            <Typography variant='h5' color='primary' fontWeight={700}>
              TCT PRICE:{' '}
              {tctPrice === 'Error'
                ? 'Error'
                : tctPrice === '0'
                ? 'Loading...'
                : `${tctPrice} USDT`}
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0px 20px 40px rgba(0,0,0,0.2)',
              borderRadius: '32px',
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Container maxWidth='sm'>
              <Box mb={2}>
                  <Typography
                    textAlign='center'
                    variant='h6'
                    color='text.primary'
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                  >
                    Sell Desk Info
                  </Typography>
              </Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  Manual Price
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {manualPrice} USDT/TCT
                </Typography>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  Daily Cap
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {getCommas(dailyCap)} USDT
                </Typography>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ my: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  Used Today
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {getCommas(usedToday)} USDT
                </Typography>
              </Stack>
               <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ my: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  Available
                </Typography>
                <Typography variant='body1' fontWeight='700' color='secondary.main'>
                    {getCommas(parseFloat(dailyCap) - parseFloat(usedToday))} USDT
                </Typography>
              </Stack>
            </Container>
          </Box>
          <a href={'http://tctplus.net'} style={{ textDecoration: 'none' }}>
            <Box
              display='flex'
              justifyContent='center'
              alignItems='center'
              mt={3}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  borderRadius: '24px',
                  fontSize: '18px',
                  fontWeight: '800',
                  py: 2,
                  background: 'linear-gradient(90deg, #7645D9 0%, #452a7a 100%)',
                  boxShadow: '0px 0px 20px rgba(118, 69, 217, 0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                     transform: 'scale(1.02)',
                     boxShadow: '0px 0px 30px rgba(118, 69, 217, 0.7)',
                  }
                }}
              >
                BUY USDT
              </Button>
            </Box>
          </a>
        </Grid>
        {/* <Grid item xs={12} sm={12} md={4} alignSelf="center">
          <Box textAlign="center">
            <img src={tctEco} alt="" width="200px" />
          </Box>
        </Grid> */}
      </Grid>
    </Container>
  )
}
