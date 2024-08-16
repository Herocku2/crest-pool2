import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import fb from "./assets/fb.png";
import inst from "./assets/inst.png";
import tw from "./assets/tw.png";
import you from "./assets/you.png";
import medium from "./assets/medium.png";
import telegramImg from "./assets/telegram.png";

import bgfooter from "./assets/bg-footer.jpg";
import footerLogo from "../Swap/assets/logo.png";

const Footer = () => {
  return (
    <Box
      sx={{
        background: `url(${bgfooter})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
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
                <img src={footerLogo} alt="" width="140px" />
              </Box>
              <Box>
                <Typography variant="h3" color="#fff">
                  The Crest Swap
                </Typography>
                <Box
                  fontSize="14px"
                  color="primary.defiText"
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
                variant="h3"
                sx={{
                  mb: 2,
                  color: "white",
                }}
              >
                LEGAL
              </Typography>
              <Box fontSize="14px" color="primary.defiText">
                Income Disclaimer
              </Box>
              <Box fontSize="14px" color="primary.defiText">
                Terms & Services
              </Box>
              <Box fontSize="14px" color="primary.defiText">
                Smart Contract
              </Box>
            </Box>
          </Grid>
          <Grid item md={3} xs={12} align="center">
            <Box>
              <Button
                disableRipple={true}
                sx={{
                  textAlign: "center",
                  px: 6,
                  py: 2,
                  borderRadius: "18px",
                  textTransform: "capitalize",
                  fontSize: { xs: "14px", md: "18px" },
                  transition: ".2s linear",
                  textDecoration: "none",
                  background:
                    "linear-gradient(90deg, #2745EA 2.94%, #CF7BF4 100%)",
                  color: "#fff",
                  boxShadow:
                    "0 2px 1px rgba(3,3,3,.10196078431372549),0 3px 5px rgba(3,3,3,.10196078431372549)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #CF7BF4 2.94%, #2745EA 100%)",
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
        color="primary.light"
        sx={{
          textAlign: "center",
          fontSize: "12px",
          mt: 3,
          py: 1,
          background: "#150e18",
        }}
      >
        Copyright © 2023 The Crest. All Rights Reserved.
      </Box>
    </Box>
  );
};

export default Footer;
