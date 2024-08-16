import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
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
  const italicUSDT = <Typography sx={{ fontWeight: '700' }}>USDT</Typography>
  const [selectToken, setselectToken] = useState(italicUSDT)
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
              background: '#0B0B0B',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: '30px',
              py: 1,
              px: 4,
              borderTop: '4px solid #D39900',
              borderRight: '2px solid #634901',
              borderBottom: 'none',
              borderLeft: '2px solid #634901',
            }}
          >
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='h5' color='#ffffff'>
                The Crest Swap
              </Typography>{' '}
            </Box>
            <Box
              sx={{
                background: '#1E1E2D',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.11)',
                py: '7px',
                my: '10px',
              }}
            >
              <Stack direction='row' justifyContent='space-around'>
                <Button
                  sx={{
                    background: buyPosition ? '#D39900' : '#7B7B7B',
                    fontSize: '13px',
                    fontWeight: '700',
                    px: '35px',
                    borderRadius: '20px',
                    '&:hover': {
                      background: '#D39900',
                    },
                  }}
                  onClick={() => setbuyPosition(true)}
                  mt={2}
                >
                  Buy
                </Button>
                <Button
                  sx={{
                    background: buyPosition ? '#7B7B7B' : '#D39900',
                    fontSize: '13px',
                    fontWeight: '700',
                    px: '35px',
                    borderRadius: '20px',
                    '&:hover': {
                      background: '#D39900',
                    },
                  }}
                  onClick={() => setbuyPosition(false)}
                >
                  Sell
                </Button>
              </Stack>
            </Box>
            <Box sx={{ my: '15px' }}></Box>
            <Typography variant='body1' color='#fff' fontWeight='600'>
              From
            </Typography>
            <Stack
              sx={{
                px: '10px',
                border: '1px solid rgba(255, 255, 255, 0.11)',
                borderRadius: '30px',
                backgroundColor: '#1E1E2D',
                my: 1,
              }}
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
                    backgroundColor: 'rgba(9, 9, 11, 0.7)',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose()
                    setselectToken('BNB')
                  }}
                  sx={{
                    background: 'transparent',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      px='10px'
                      sx={{
                        fontFamily: "'Poppins'",
                        fontWeight: 400,
                        fontSize: { xs: '15px', sm: '20px' },
                        color: '#848484',
                      }}
                    >
                      BNB
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setselectToken('USDT')
                    handleClose()
                  }}
                >
                  {' '}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      px='10px'
                      sx={{
                        fontFamily: "'Poppins'",
                        fontWeight: 400,
                        fontSize: { xs: '15px', sm: '20px' },
                        color: '#848484',
                      }}
                    >
                      USDT
                    </Box>
                  </Box>
                </MenuItem>
              </Menu>
              <Box
                sx={{
                  display: 'flex',
                }}
              >
                <input
                  placeholder={
                    !address
                      ? `Balance : 0`
                      : buyPosition
                      ? selectToken === 'BNB'
                        ? `Balance: ${bnbBalance} BNB`
                        : `Balance: ${usdtBalance} USDT`
                      : `Balance: ${tctBalance} TCT`
                  }
                  type='number'
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    padding: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    width: '100%',
                  }}
                  min='0'
                  value={fromAmount}
                  onChange={(e) => setfromAmount(e.target.value)}
                />
              </Box>
              <IconButton onClick={buyPosition ? handleClick : null}>
                <Box
                  sx={{
                    background: 'transparent',
                    py: 1,
                    px: 4,
                    borderRadius: '10px',
                    display: 'flex',
                  }}
                  direction='row'
                  alignItems='center'
                  spacing={1}
                >
                  <Typography
                    variant='h3'
                    fontWeight='700'
                    fontSize='15px'
                    textAlign='center'
                    color='#848484'
                  >
                    {buyPosition ? selectToken : 'TCT'}
                  </Typography>
                  <Box>
                    <Box
                      sx={{
                        backgroundColor: '#D39900',
                        borderRadius: '50%',
                        width: '30px',
                        height: '29px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        ml: 1,
                      }}
                    >
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: '30px',
                          color: 'black', // or any color you want for the arrow
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </IconButton>
            </Stack>
            <Typography variant='body1' textAlign='center'>
              <IconButton onClick={() => setbuyPosition(!buyPosition)}>
                <Box
                  sx={{
                    backgroundColor: '#D39900',
                    borderRadius: '50%',
                    width: '30px',
                    height: '29px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <RefreshIcon
                    sx={{
                      fontSize: '20px',
                      color: 'black', // or any color you want for the arrow
                    }}
                  />
                </Box>
              </IconButton>
            </Typography>
            <Typography variant='body1' color='#fff' fontWeight='600'>
              To
            </Typography>

            <Stack
              sx={{
                px: '10px',
                border: '1px solid rgba(255, 255, 255, 0.11)',
                borderRadius: '30px',
                backgroundColor: '#1E1E2D',
                my: 1,
              }}
              direction='row'
              alignItems='center'
              spacing={0}
            >
              <Box display='flex' flexGrow={1}>
                <input
                  placeholder={
                    tctPrice === 'Error'
                      ? 'Error fetching price'
                      : tctPrice === '0'
                      ? 'Loading...'
                      : address
                      ? `Balance: ${
                          !buyPosition
                            ? selectToken === 'BNB'
                              ? `${bnbBalance} BNB`
                              : `${usdtBalance} USDT`
                            : `${tctBalance} TCT`
                        }`
                      : `Balance : 0`
                  }
                  type='number'
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    padding: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    width: '100%',
                  }}
                  value={toAmount}
                  readOnly
                />
              </Box>
              <IconButton onClick={buyPosition ? null : handleClick}>
                <Box
                  sx={{
                    background: 'transparent',
                    // py: 1,
                    px: 5,
                    borderRadius: '10px',
                    display: 'flex',
                  }}
                  direction='row'
                  spacing={2}
                >
                  <Typography
                    variant='h3'
                    fontWeight='600'
                    fontSize='15px'
                    textAlign='center'
                    color='#848484'
                  >
                    {buyPosition ? 'TCT' : selectToken}
                  </Typography>
                  <Box>
                    <Box
                      sx={{
                        backgroundColor: '#D39900',
                        borderRadius: '50%',
                        width: '30px',
                        height: '29px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        ml: 2,
                      }}
                    >
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: '30px',
                          color: 'black', // or any color you want for the arrow
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </IconButton>
            </Stack>

            <Box
              display='flex'
              alignItems='center'
              justifyContent='center'
              my={3}
            >
              <LoadingButton
                variant='outlined'
                sx={{
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: '#D39900',
                  color: '#ffffff',
                  border: '1px solid transparent',
                  '&:hover': {
                    background: '#D39900',
                    color: '#ffffff',
                    border: '1px solid transparent',
                  },
                }}
                fullWidth
                loading={loading}
                disabled={loading}
                startIcon={
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      width: '30px',
                      height: '29px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <RefreshIcon
                      sx={{
                        fontSize: '20px',
                        color: '#D39900',
                      }}
                    />
                  </Box>
                }
                endIcon={
                  <ReplyIcon
                    sx={{
                      transform: 'scaleX(-1)',
                      width: '40px',
                      height: '30px',
                    }}
                  />
                }
                onClick={address ? orderHandler : connectFn}
                loadingPosition='end'
              >
                {address
                  ? loading
                    ? 'Processing'
                    : 'convert'
                  : 'Connect Wallet'}
              </LoadingButton>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={12} md={5}>
          <Box display='flex' justifyContent='center'>
            <Typography variant='h2' color='#D39900'>
              TCT PRICE:{' '}
              {tctPrice === 'Error'
                ? 'Error fetching price'
                : tctPrice === '0'
                ? 'Loading...'
                : `${tctPrice} USDT`}
            </Typography>
          </Box>

          <Box
            sx={{
              borderBottom: '3px solid #D39900',
              borderRight: '1px solid #D39900',
              borderTop: 'none',
              borderLeft: '1px solid #D39900',
              borderRadius: '30px',
            }}
          >
            <Container maxWidth='sm'>
              <Box
                sx={{
                  borderRadius: '20px',
                  pt: 1,
                  mt: 3,
                }}
              >
                <Box sx={{ borderRadius: '20px', background: '#D39900' }}>
                  <Typography
                    mt={2}
                    textAlign='center'
                    variant='h2'
                    color='#fff'
                    sx={{ fontSize: '20px' }}
                  >
                    Pool Reserves
                  </Typography>
                </Box>
              </Box>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: '20px' }}
              >
                <Typography variant='h6' fontWeight='bold' color='#ffffff'>
                  BNB Balance
                </Typography>
                <Box
                  sx={{
                    background: '#1E1E2D',
                    border: 'transparent',
                    borderRadius: '20px',
                    px: '30px',
                  }}
                >
                  <Typography
                    variant='h6'
                    fontWeight='bold'
                    color='#ffffff'
                    fontStyle='italic'
                  >
                    {getCommas(poolReserves.bnbBalance)} BNB
                  </Typography>
                </Box>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: '20px' }}
              >
                <Typography variant='h6' fontWeight='bold' color='#ffffff'>
                  USDT Balance
                </Typography>
                <Box
                  sx={{
                    background: '#1E1E2D',
                    border: 'transparent',
                    borderRadius: '20px',
                    px: '30px',
                  }}
                >
                  <Typography
                    variant='h6'
                    fontWeight='bold'
                    color='#ffffff'
                    fontStyle='italic'
                  >
                    {getCommas(poolReserves.busdBalance)} USDT
                  </Typography>
                </Box>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ my: '20px' }}
              >
                <Typography variant='h6' fontWeight='bold' color='#ffffff'>
                  TCT Balance
                </Typography>
                <Box
                  sx={{
                    background: '#1E1E2D',
                    border: 'transparent',
                    borderRadius: '20px',
                    px: '30px',
                  }}
                >
                  <Typography
                    variant='h6'
                    fontWeight='bold'
                    color='#ffffff'
                    fontStyle='italic'
                  >
                    {getCommas(poolReserves.tctBalance)} TCT
                  </Typography>
                </Box>
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
                sx={{
                  backgroundColor: '#D39900',
                  '&:hover': {
                    backgroundColor: '#D39900',
                  },
                  px: 7,
                  py: 1,
                  borderRadius: '30px',
                  fontWeight: '700',
                  fontSize: '18px',
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
