import { Box, Container, Grid, Typography } from "@mui/material";

import infoCardPic from "../../assets/img2.png";

function Information() {
  return (
    <Box>
      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h3">The Crest Solution</Typography>
          <ul>
            <li>
              THECREST token was born with the vision and premise of being part of and being a fundamental player in the new era of Blockchain technology; making room by combining two important agents such as "raw materials" and "Blockchain Technology" to break into the heart of all countries and standardize a value at the regional level for a currency of use daily global reach.
            </li>

            <li>
              For years the Referral Marketing Industry had unsuccessfully tried to be part of the crypto market, giving rise to pyramid schemes, fraud, ponzi scams, dubious businesses such as Madoff, EverGrande in 2021 and therefore the loss of credibility in the real estate sector but now with THECREST the wait is over, the perfect fusion between the raw materials model and all kinds of assets and a Crypto Ecosystem, giving rise to a THECREST Token in the market, with guaranteed adoption and usability.
            </li>

          </ul>
        </Grid>
        <Grid item xs={12} md={6} alignSelf="center">
          <img src={infoCardPic} alt="" width="100%" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Information;
