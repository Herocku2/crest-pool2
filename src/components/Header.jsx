import React, { useContext, useState } from 'react'
import Container from '@mui/material/Container'
import Hidden from '@mui/material/Hidden'
import useMediaQuery from '@mui/material/useMediaQuery'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { Menu as MenuIcon } from '@mui/icons-material'
import { Paper, Box, Typography, Stack } from '@mui/material'
import clsx from 'clsx'
import { HashLink } from 'react-router-hash-link'

import logo from './Swap/assets/logo.png'
import { useAccount } from 'wagmi'

export default function Header({ fixed, adminsArray }) {
  // const { account, connect, disconnect } = useContext(AppContext);
  const { address } = useAccount()
  // let address = "0xf2d5fcb7861120726c6dc130ca4bdb13f0cf4785";
  const [state, setState] = React.useState({
    left: false,
  })

  const matches1 = useMediaQuery('(max-width:1279px)')
  const logoMatch = useMediaQuery('(min-width:500px)')

  const [expanded, setExpanded] = React.useState('false')

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const list = (anchor) => (
    <Box
      sx={{
        width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250,
        background: (theme) => theme.palette.background.paper,
        height: '100%'
      }}
      role='presentation'
    >
      <Box display='flex' justifyContent='center' my={5}>
        <HashLink to={'/'} style={{ textDecoration: 'none' }}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <img width='50px' src={logo} alt='' />
            <Typography variant='h5' color='text.primary' fontWeight="bold">
              The Crest Swap
            </Typography>
          </Stack>
        </HashLink>
      </Box>
      <List>
        <ListItem
          style={{
            justifyContent: 'center',
          }}
          onClick={toggleDrawer(anchor, false)}
          onKeyDown={toggleDrawer(anchor, false)}
        >
          <a href={'https://tctplus.com/'} style={{ textDecoration: 'none' }}>
            <Box
              fontSize='16px'
              fontWeight="600"
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              TCT+
            </Box>
          </a>
        </ListItem>

        {adminsArray && adminsArray?.includes(address?.toLowerCase()) && (
          <ListItem
            style={{
              justifyContent: 'center',
            }}
          >
            <HashLink to={'/Multi-Signer'} style={{ textDecoration: 'none' }}>
              <Box
                fontSize='17px'
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                MULTISIGNATURE
              </Box>
            </HashLink>
          </ListItem>
        )}
        <ListItem
          style={{
            justifyContent: 'center',
          }}
        >
          <HashLink
            to={'https://blockfactory.es/'}
            style={{ textDecoration: 'none' }}
          >
            <Box
              fontSize='17px'
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Blockfactory
            </Box>
          </HashLink>
        </ListItem>

        <ListItem
          style={{
            justifyContent: 'center',
          }}
          onClick={toggleDrawer(anchor, false)}
          onKeyDown={toggleDrawer(anchor, false)}
        >
          <a href={'http://crestchain.pro/'} style={{ textDecoration: 'none' }}>
            <Box
              fontSize='17px'
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Crestchain
            </Box>
          </a>
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'center',
          }}
          onClick={toggleDrawer(anchor, false)}
          onKeyDown={toggleDrawer(anchor, false)}
        >
          <a href={'https://thecrest.io/'} style={{ textDecoration: 'none' }}>
            <Box
              fontSize='17px'
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              The crest
            </Box>
          </a>
        </ListItem>
      </List>
    </Box>
  )

  const [colorChange, setColorchange] = useState(false)
  const changeNavbarColor = () => {
    if (window.scrollY >= 80) {
      setColorchange(true)
    } else {
      setColorchange(false)
    }
  }
  window.addEventListener('scroll', changeNavbarColor)

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      sx={{
        background: (theme) => colorChange ? theme.palette.background.default : fixed ? theme.palette.background.default : 'transparent',
        position: 'fixed',
        zIndex: '100',
        height: '90px',
        width: '100%'
      }}
    >
      <Container maxWidth='xl'>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            // flexBasis="20%"
            ml={{ xs: 'none', md: 8 }}
          >
            <HashLink to={'/'} style={{ textDecoration: 'none' }}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <img width='50px' src={logo} alt='' />
                <Typography variant='h5' color='text.primary' fontWeight="bold">
                  The Crest Swap
                </Typography>
              </Stack>
            </HashLink>
          </Box>
          <Box
            display='flex'
            justifyContent={matches1 ? 'end' : 'space-between'}
            alignItems='center'
          >
            <Box
              display='flex'
              justifyContent='space-around'
              alignItems='center'
            >
              <Hidden mdDown>
                <a
                  href={'https://tctplus.com/'}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    mr={3}
                    fontSize='17px'
                    zIndex='1'
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    TCT +
                  </Box>
                </a>
                <a
                  href={'https://blockfactory.es/'}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    mr={3}
                    fontSize='17px'
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    Blockfactory
                  </Box>
                </a>

                {adminsArray &&
                  adminsArray?.includes(address?.toLowerCase()) && (
                    <HashLink
                      to={'/Multi-Signer'}
                      style={{ textDecoration: 'none' }}
                    >
                      <Box
                        mr={3}
                        fontSize='17px'
                        sx={{
                          textDecoration: 'none',
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        MULTISIGNATURE
                      </Box>
                    </HashLink>
                  )}
                <a
                  href={'http://crestchain.pro/'}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    mr={3}
                    fontSize='17px'
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    Crestchain
                  </Box>
                </a>

                <a
                  href={'https://thecrest.io/'}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    mr={3}
                    fontSize='17px'
                    zIndex='1'
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    The crest
                  </Box>
                </a>
              </Hidden>
            </Box>

            <Hidden mdUp>
              {['left'].map((anchor) => (
                <React.Fragment key={anchor}>
                  <Button
                    onClick={toggleDrawer(anchor, true)}
                    style={{ zIndex: 1 }}
                  >
                    <MenuIcon
                      sx={{
                        fontSize: '38px',
                        cursor: 'pointer',
                        color: 'text.primary',
                      }}
                    ></MenuIcon>
                  </Button>
                  <Paper>
                    <SwipeableDrawer
                      PaperProps={{
                        sx: {
                          background: (theme) => `${theme.palette.background.default} !important`,
                        }
                      }}
                      anchor={anchor}
                      open={state[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                      onOpen={toggleDrawer(anchor, true)}
                    >
                      {list(anchor)}
                    </SwipeableDrawer>
                  </Paper>
                </React.Fragment>
              ))}
            </Hidden>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
