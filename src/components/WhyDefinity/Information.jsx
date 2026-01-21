import { Box, Container, Grid, Typography, Paper } from "@mui/material";

import infoCardPic from "../../assets/img2.png";

function Information() {
  return (
    <Box>
      <Grid container spacing={5} justifyContent="center" alignItems="center">
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
            <Typography variant="h3" color="secondary.main" mb={3} fontWeight="bold">
              The Crest Solution
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" color="text.primary" mb={2} sx={{ listStyleType: "disc" }}>
                THECREST token was born with the vision and premise of being part of and being a fundamental player in the new era of Blockchain technology; making room by combining two important agents such as "raw materials" and "Blockchain Technology" to break into the heart of all countries and standardize a value at the regional level for a currency of use daily global reach.
              </Typography>

              <Typography component="li" variant="body1" color="text.primary" sx={{ listStyleType: "disc" }}>
                For years the Referral Marketing Industry had unsuccessfully tried to be part of the crypto market, giving rise to pyramid schemes, fraud, ponzi scams, dubious businesses such as Madoff, EverGrande in 2021 and therefore the loss of credibility in the real estate sector but now with THECREST the wait is over, the perfect fusion between the raw materials model and all kinds of assets and a Crypto Ecosystem, giving rise to a THECREST Token in the market, with guaranteed adoption and usability.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} alignSelf="center">
          <Box
            component="img"
            src={infoCardPic}
            alt=""
            width="100%"
            sx={{
              borderRadius: "24px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Information;
