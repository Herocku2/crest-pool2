import { Box, Button, Container, Grid, Typography } from "@mui/material";

import Information from "./Information";
import StyledButton from "../Button/Button";

import cradPic from "../../assets/img1.png";
import { HashLink } from "react-router-hash-link";

function WhyDefinity() {
  return (
    <Box my={10}>
      <Container maxWidth="xl">
        <Box textAlign="center" mb={7}>
          <Typography variant="h2" mb={2} fontWeight={400}>
            Why The Crest Token?
          </Typography>
          <Typography variant="h2">
            The problem and fraud with cryptos, tokens, icos, idos, etc.
          </Typography>
        </Box>

        <Box>
          <Grid
            container
            rowSpacing={3}
            columnSpacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} md={6} alignSelf="center">
              <Box>
                <img src={cradPic} alt="" width="100%" />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <ul>
                  <li>
                    Although a huge revolution has arrived in the world of
                    cryptocurrencies and tokens, it is also true that the use of
                    cybercrime has prospered without limits and has affected one
                    of the best industries, Network Marketing, and tokenization
                    businesses have returned. where the creators only seek
                    personal performance and abandon their own community.
                  </li>
                  <li>
                    Also the use of bad practices and misleading information to
                    offer cryptocurrency or token projects where packages of
                    worthless coins are sold that do not prosper in the market
                    and multiple businesses, exchanges and bankrupt
                    cryptocurrencies.
                  </li>
                  <li>
                    For this reason, the market has become more demanding when
                    it comes to offering a sustainable project and this is where
                    we come in with a solid and real product where SAFETY AND
                    REAL SUPPORT is given.
                  </li>
                </ul>
              </Typography>

              <Box mt={7} textAlign={{ xs: "center", md: "left" }}>
                <HashLink to="/joinacademy" style={{ textDecoration: "none" }}>
                  <StyledButton>Begin Your Journey!</StyledButton>
                </HashLink>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box mt={20} mb={5}>
          <Information />
        </Box>
      </Container>
    </Box>
  );
}

export default WhyDefinity;
