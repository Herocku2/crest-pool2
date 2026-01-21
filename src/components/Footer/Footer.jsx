import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import fb from "./assets/fb.png";
import inst from "./assets/inst.png";
import tw from "./assets/tw.png";
import you from "./assets/you.png";
import medium from "./assets/medium.png";
import telegramImg from "./assets/telegram.png";

import footerLogo from "../Swap/assets/logo.png";

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 6,
      }}
    >
      <Container maxWidth="xl">
        <Grid container justifyContent="space-between" spacing={5}>
          <Grid item md={6} xs={12}>
            <Box
              sx={{
                display: "flex",
              }}
            >
              <Box mr={1}>
                <img src={footerLogo} alt="" width="50px" />
              </Box>
              <Box>
                <Typography variant="h5" color="text.primary" fontWeight="bold">
                  The Crest Swap
                </Typography>
                <Box
                  fontSize="14px"
                  color="text.secondary"
                  my={2}
                  sx={{
                    width: "80%",
                  }}
                >
                  We are always here for constant support so don't hesitate to
                  reach out if you have any questions or problems!
                </Box>
                <Stack direction="row" flexWrap="wrap" spacing={1} mt={4}>
                  <a
                    href="https://www.facebook.com/tctecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={fb} alt="" width="35px" height="35px" />
                  </a>

                  <a
                    href="https://twitter.com/tctecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={tw} alt="" width="35px" height="35px" />
                  </a>
                  <a
                    href="https://www.instagram.com/tctecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={inst} alt="" width="35px" height="35px" />
                  </a>
                  <a
                    href="https://www.youtube.com/@tctecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={you} alt="" width="35px" height="35px" />
                  </a>
                  <a
                    href="https://t.me/TCTecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={telegramImg} alt="" width="35px" height="35px" />
                  </a>
                  <a
                    href="https://medium.com/@tctecosystem"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={medium} alt="" width="35px" height="35px" />
                  </a>
                </Stack>
              </Box>
            </Box>
          </Grid>
          <Grid item md={3} xs={12}>
            <Box ml={{ xs: 7, md: 0 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  color: "text.primary",
                }}
              >
                LEGAL
              </Typography>
              <Box fontSize="14px" color="text.secondary" mb={1}>
                Income Disclaimer
              </Box>
              <Box fontSize="14px" color="text.secondary" mb={1}>
                Terms & Services
              </Box>
              <Box fontSize="14px" color="text.secondary" mb={1}>
                Smart Contract
              </Box>
            </Box>
          </Grid>
          <Grid item md={3} xs={12} align="center">
            <Box>
              <Button
                variant="contained"
                color="secondary"
                disableRipple={true}
                sx={{
                  textAlign: "center",
                  px: 4,
                  py: 1.5,
                  borderRadius: "16px",
                  textTransform: "capitalize",
                  fontSize: { xs: "14px", md: "16px" },
                  fontWeight: "bold",
                  boxShadow: "0px 4px 0px 0px #5e37ad", // Darker purple shadow
                  transition: "all 0.1s ease",
                  "&:hover": {
                    transform: "translateY(2px)",
                    boxShadow: "0px 2px 0px 0px #5e37ad",
                  },
                  zIndex: 1,
                }}
                LinkComponent="a"
                href="http://memberplus.thecrest.io/"
                target="_blank"
              >
                JOIN THE CREST +
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box
        color="text.disabled"
        sx={{
          textAlign: "center",
          fontSize: "12px",
          mt: 3,
          py: 2,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        Copyright © 2023 The Crest. All Rights Reserved.
      </Box>
    </Box>
  );
};

export default Footer;
