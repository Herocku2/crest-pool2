import { Box, Container, Grid, Typography, Paper } from "@mui/material";

import Information from "./Information";
import StyledButton from "../Button/Button";

import cradPic from "../../assets/img1.png";
import { HashLink } from "react-router-hash-link";

function WhyDefinity() {
  return (
    <Box my={10}>
      <Container maxWidth="xl">
        <Box textAlign="center" mb={7}>
          <Typography variant="h2" mb={2} fontWeight="bold" color="secondary.main">
            Why The Crest Token?
          </Typography>
          <Typography variant="h4" color="text.primary">
            The problem and fraud with cryptos, tokens, icos, idos, etc.
          </Typography>
        </Box>

        <Box>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} md={6} alignSelf="center">
              <Box
                component="img"
                src={cradPic}
                alt=""
                width="100%"
                sx={{
                  borderRadius: "24px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "24px",
                  backgroundColor: "background.paper",
                  boxShadow: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
                }}
              >
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="body1" color="text.primary" mb={2} sx={{ listStyleType: "disc" }}>
                    Although a huge revolution has arrived in the world of
                    cryptocurrencies and tokens, it is also true that the use of
                    cybercrime has prospered without limits and has affected one
                    of the best industries, Network Marketing, and tokenization
                    businesses have returned. where the creators only seek
                    personal performance and abandon their own community.
                  </Typography>
                  <Typography component="li" variant="body1" color="text.primary" mb={2} sx={{ listStyleType: "disc" }}>
                    Also the use of bad practices and misleading information to
                    offer cryptocurrency or token projects where packages of
                    worthless coins are sold that do not prosper in the market
                    and multiple businesses, exchanges and bankrupt
                    cryptocurrencies.
                  </Typography>
                  <Typography component="li" variant="body1" color="text.primary" sx={{ listStyleType: "disc" }}>
                    For this reason, the market has become more demanding when
                    it comes to offering a sustainable project and this is where
                    we come in with a solid and real product where SAFETY AND
                    REAL SUPPORT is given.
                  </Typography>
                </Box>

                <Box mt={4} textAlign={{ xs: "center", md: "left" }}>
                  <HashLink to="/joinacademy" style={{ textDecoration: "none" }}>
                    <StyledButton>Begin Your Journey!</StyledButton>
                  </HashLink>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box mt={10} mb={5}>
          <Information />
        </Box>
      </Container>
    </Box>
  );
}

export default WhyDefinity;
