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
  getCommas,
} from '../../ConnectivityAss/hooks'
import { formatUnits, parseUnits } from '@ethersproject/units'
import Loading from '../../LoadingSvg'
import { buySellAddress } from '../../ConnectivityAss/environment'
import Transactions from '../transactions/Transactions'
import { LoadingButton } from '@mui/lab'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReplyIcon from '@mui/icons-material/Reply'

export const Swap = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { open: connectFn } = useWeb3Modal()
  let { data: signer } = useSigner()
  let buySellContract = useBuySellContract(signer)
  let usdtContract = useUsdtContract(signer)
  let tokenContract = useTokenContract(signer)
  const [buyPosition, setbuyPosition] = useState(true)
  const [fromAmount, setfromAmount] = useState('')
  const [toAmount, settoAmount] = useState('')
  const [loading, setloading] = useState(false)
  const { address } = useAccount()
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
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  let init = async () => {
    try {
      let [bnbBalance, busdBalance, tctBalance] = await Promise.all([
        buySellContract.contractBalancebnb(),
        buySellContract.contractBalancebusd(),
        tokenContract.balanceOf(buySellAddress),
      ])
      setpoolReserves({
        bnbBalance: formatUnits(bnbBalance),
        busdBalance: formatUnits(busdBalance),
        tctBalance: formatUnits(tctBalance, 12),
      })
    } catch (error) {
      console.log(error)
    }
  }

  const orderHandler = async () => {
    try {
      if (buyPosition && selectToken === 'USDT') {
        const usdtBalance = await usdtContract.balanceOf(address)
        if (usdtBalance.lt(parseUnits(fromAmount.toString(), usdtDecimal))) {
          console.error('Insufficient USDT balance')
          setAlertState({
            open: true,
            message: 'Insufficient USDT balance',
            severity: 'error',
          })
          return
        }
      }
      if (!fromAmount || fromAmount === 0 || isNaN(fromAmount)) {
        setAlertState({
          open: true,
          message: 'Please enter a valid amount.',
          severity: 'error',
        })
      } else {
        setloading(true)
        let [
          usdtDecimal,
          tokenDecimal,
          usdtBalance,
          tokenBalance,
          usdtAllowance,
          tokenAllowance,
        ] = await Promise.all([
          usdtContract.decimals(),
          tokenContract.decimals(),
          usdtContract.balanceOf(address),
          tokenContract.balanceOf(address),
          usdtContract.allowance(address, buySellAddress),
          tokenContract.allowance(address, buySellAddress),
        ])

        if (buyPosition) {
          if (selectToken === 'BNB') {
            let buyBnbFn = buySellContract.estimateGas.buyTokenbnb
            let buyBnbParams = []
            let buyBnbTx = await buySellContract.buyTokenbnb(...buyBnbParams, {
              gasLimit: gasEstimationPayable(
                address,
                buyBnbFn,
                buyBnbParams,
                parseUnits(fromAmount.toString())
              ),
            })
            await buyBnbTx.wait()
          } else {
            if (fromAmount > +formatUnits(usdtAllowance, usdtDecimal)) {
              let usdtApproveFn = usdtContract.estimateGas.approve
              let usdtApproveParams = [buySellAddress, usdtBalance]
              let usdtApproveTx = await usdtContract.approve(
                ...usdtApproveParams,
                {
                  gasLimit: gasEstimationForAll(
                    address,
                    usdtApproveParams,
                    usdtApproveFn
                  ),
                }
              )
              await usdtApproveTx.wait()
            }
            let usdtBuyFn = buySellContract.estimateGas.buyTokenbusd
            let usdtBuyParams = [parseUnits(fromAmount.toString(), usdtDecimal)]
            let usdtBuyTx = await buySellContract.buyTokenbusd(
              ...usdtBuyParams,
              {
                gasLimit: gasEstimationForAll(
                  address,
                  usdtBuyFn,
                  usdtBuyParams
                ),
              }
            )
            await usdtBuyTx.wait()
          }
        } else {
          if (fromAmount > +formatUnits(tokenAllowance, tokenDecimal)) {
            let tokenApproveFn = tokenContract.estimateGas.approve
            let tokenApproveParams = [buySellAddress, tokenBalance]
            let tokenApproveTx = await tokenContract.approve(
              ...tokenApproveParams,
              {
                gasLimit: gasEstimationForAll(
                  address,
                  tokenApproveFn,
                  tokenApproveParams
                ),
              }
            )
            await tokenApproveTx.wait()
          }
          if (selectToken === 'BNB') {
            let tokenSellBnbFn = buySellContract.estimateGas.sellTokenbnb
            let tokenSellBnbParams = [
              parseUnits(fromAmount.toString(), tokenDecimal),
            ]
            let tokenSellBnbTx = await buySellContract.sellTokenbnb(
              ...tokenSellBnbParams,
              {
                gasLimit: gasEstimationForAll(
                  address,
                  tokenSellBnbFn,
                  tokenSellBnbParams
                ),
              }
            )
            await tokenSellBnbTx.wait()
          } else {
            let tokenSellusdtFn = buySellContract.estimateGas.sellTokenbusd
            let tokenSellusdtParams = [
              parseUnits(fromAmount.toString(), tokenDecimal),
            ]
            let tokenSellusdtTx = await buySellContract.sellTokenbusd(
              ...tokenSellusdtParams,
              {
                gasLimit: gasEstimationForAll(
                  address,
                  tokenSellusdtFn,
                  tokenSellusdtParams
                ),
              }
            )
            await tokenSellusdtTx.wait()
          }
        }
        setloading(false)
        setAlertState({
          open: true,
          message: 'Transaction Successful',
          severity: 'success',
        })
      }
    } catch (error) {
      console.log('Error', error)
      if (error?.data?.message) {
        setAlertState({
          open: true,
          message: error?.data?.message,
          severity: 'error',
        })
      } else if (error?.reason) {
        setAlertState({
          open: true,
          message: error?.reason,
          severity: 'error',
        })
      } else {
        setAlertState({
          open: true,
          message: error?.message,
          severity: 'error',
        })
      }
      setloading(false)
    }
  }
  let doCalculations = async () => {
    try {
      setloading(true)
      const [usdtDecimal, tokenDecimal] = await Promise.all([
        usdtContract.decimals(),
        tokenContract.decimals(),
      ])
      let [bnbToToken, usdtToToken, tokenToBnb, tokenTousdt] =
        await Promise.all([
          buySellContract.bnbToToken(parseUnits(fromAmount.toString())),
          buySellContract.busdToToken(
            parseUnits(fromAmount.toString(), usdtDecimal)
          ),
          buySellContract.tokenToBnb(
            parseUnits(fromAmount.toString(), tokenDecimal)
          ),
          buySellContract.tokenToBusd(
            parseUnits(fromAmount.toString(), tokenDecimal)
          ),
        ])
      if (buyPosition) {
        if (selectToken === 'BNB') {
          settoAmount(formatUnits(bnbToToken, tokenDecimal))
        } else {
          settoAmount(formatUnits(usdtToToken, tokenDecimal))
        }
      } else {
        if (selectToken === 'BNB') {
          settoAmount(formatUnits(tokenToBnb))
        } else {
          settoAmount(formatUnits(tokenTousdt, usdtDecimal))
        }
      }
      setloading(false)
    } catch (error) {
      setloading(false)
      console.error('Error in doCalculations:', error)
    }
  }
  const calculateTctPrice = async () => {
    try {
      const [usdtDecimal, tokenDecimal] = await Promise.all([
        usdtContract.decimals(),
        tokenContract.decimals(),
      ])
      const oneTokenAmount = parseUnits('1', tokenDecimal)
      const oneTctToUsdt = await buySellContract.tokenToBusd(oneTokenAmount)
      const price = Number(formatUnits(oneTctToUsdt, usdtDecimal))
      const formattedTctPrice = price.toFixed(2)

      setTctPrice(formattedTctPrice)
    } catch (error) {
      console.error('Error calculating TCT price:', error)
      setTctPrice('Error')
    }
  }
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
                onClick={address ? orderHandler : connectFn}
              >
                {address
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
                    Pool Reserves
                  </Typography>
              </Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  BNB Balance
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {getCommas(poolReserves.bnbBalance)} BNB
                </Typography>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  USDT Balance
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {getCommas(poolReserves.busdBalance)} USDT
                </Typography>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ my: 2 }}
              >
                <Typography variant='body1' fontWeight='600' color='text.secondary'>
                  TCT Balance
                </Typography>
                <Typography variant='body1' fontWeight='700' color='text.primary'>
                    {getCommas(poolReserves.tctBalance)} TCT
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
