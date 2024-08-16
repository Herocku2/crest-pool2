import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Stack } from "@mui/material";
import preLaunchImg from "./prelaunch.png";
import StyledButton from "./components/Button/Button";

export default function ZoomDialog({ zoomOpen, setzoomOpen }) {
  const handleClose = () => {
    setzoomOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth={"md"}
        open={zoomOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "black",
            boxShadow: "0px 0px 3px 3px blue",
          },
        }}
      >
        <DialogTitle variant="h2" textAlign="center">
          TCT Prelaunch Meeting
        </DialogTitle>
        <DialogContent>
          <Box height="70vh">
            <img src={preLaunchImg} alt="" width="100%" height="100%" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack alignItems="center" width="100%">
            <a
              href="https://us06web.zoom.us/j/84960431551?pwd=Q01vdFVaNnJKa2hyTExWYmJ1dlpWdz09"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <StyledButton>Participate</StyledButton>
            </a>
          </Stack>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
