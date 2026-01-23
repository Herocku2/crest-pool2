import tokenAbi from './tokenAbi.json'
import buySellAbi from './buySellAbi.json'
import localSellDeskAbi from './localSellDeskAbi.json'
import pancakeRouterAbi from './pancakeRouterAbi.json'
import { ethers, Contract } from 'ethers'
import { usdtAddress, buySellAddress, tokenAddres, localSellDeskAddress, pancakeRouterAddress } from './environment'
import { Alert, Slide, Snackbar } from '@mui/material'
import React, { useEffect } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'

// add 10%
export function calculateGasMargin(value) {
  return +(
    (value * BigNumber.from(10000).add(BigNumber.from(1000))) /
    BigNumber.from(10000)
  ).toFixed(0)
  // return value;
}

//CalculatePayableGas
export const gasEstimationPayable = async (account, fn, data, amount) => {
  if (account) {
    const estimateGas = await fn(...data, MaxUint256).catch(() => {
      return fn(...data, { value: amount.toString() })
    })
    return calculateGasMargin(estimateGas)
  }
}
export const gasEstimationForAll = async (account, fn, data) => {
  if (!account) {
    console.error('No account provided')
    return null
  }

  try {
    const estimateGas = await fn(...data)
    return calculateGasMargin(estimateGas)
  } catch (error) {
    console.error('Error estimating gas:', error)
    return null
  }
}


let walletAddress = '0x8ba1f109551bD432803012645Ac136ddd64DBA72'

const provider = new ethers.providers.JsonRpcProvider(
  // "https://rpc.sepolia.org"
  'https://bsc-dataseed.binance.org/'
)

export const voidAccount = new ethers.VoidSigner(walletAddress, provider)
function useContract(address, ABI, signer) {
  return React.useMemo(() => {
    if (signer) {
      return new Contract(address, ABI, signer)
    } else {
      return new Contract(address, ABI, voidAccount)
    }
  }, [address, ABI, signer])
}
export let getCommas = (value) => {
  value = parseFloat(value).toFixed(2)
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export let getSliceAddress = (address) =>
  address?.slice(0, 4) + '...' + address?.slice(-4)

export function useTokenContract(signer) {
  return useContract(tokenAddres, tokenAbi, signer)
}
export function useUsdtContract(signer) {
  return useContract(usdtAddress, tokenAbi, signer)
}
export function useBuySellContract(signer) {
  return useContract(buySellAddress, buySellAbi, signer)
}
export function useLocalSellDeskContract(signer) {
  return useContract(localSellDeskAddress, localSellDeskAbi, signer)
}
export function usePancakeRouterContract(signer) {
  return useContract(pancakeRouterAddress, pancakeRouterAbi, signer)
}

function SlideTransition(props) {
  return <Slide {...props} direction='down' />
}
export function ToastNotify({ alertState, setAlertState }) {
  return (
    <Snackbar
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={alertState.open}
      autoHideDuration={3000}
      key={'bottom' + 'center'}
      sx={{ zIndex: 2000 }}
      onClose={() => setAlertState({ ...alertState, open: false })}
    >
      <Alert
        onClose={() => setAlertState({ ...alertState, open: false })}
        severity={alertState.severity}
      >
        {alertState.message}
      </Alert>
    </Snackbar>
  )
}
