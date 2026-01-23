export const buySellAddress = '0x3600bDc58C1854580545D8e72b1a831C596DbdF9'//mainnet
// export const buySellAddress = '0xB24322100F51196272502BA10DA1bDE657323e74' //testnet

export const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";//mainnet
// export const usdtAddress = '0x7b2C7394559e0Fc8E94923A67D81520CfdC0D43a' //testnet
export const tokenAddres = '0x2D8931C368fE34D3d039Ab454aFc131342A339B5'//mainnet
// export const tokenAddres = '0x827aA6de83D4d37d888d1351c82b24991fE50dc2' //testnet

export const localSellDeskAddress = '0x0000000000000000000000000000000000000000'; // REPLACE WITH DEPLOYED CONTRACT ADDRESS
export const pancakeRouterAddress = '0x13f4EA83D8Bd408061109B58d30642cb367781c9'; // PancakeSwap V3 Router BSC Mainnet


export const url =
  process.env.NODE_ENV === "production"
    ? "https://thecrest.io/"
    : // ?
      //   "https://test.thecrest.io/"
      // : "https://defi-fire.herokuapp.com/";
      "http://localhost:4000/";

export let LinkTxOpen = "https://testnet.bscscan.com/tx/";
