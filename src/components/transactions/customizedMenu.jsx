import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { tokenAddres, usdtAddress } from "../../ConnectivityAss/environment";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 270,
    color: "blue",
    backgroundColor: "#4e42fc",
    // theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      color: "#fff",
      "& .MuiSvgIcon-root": {
        fontSize: 18,

        // color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function CustomizedMenus({ selectedToken, setselectedToken }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          width: "270px",
          minHeight: "45px",
          backgroundColor: "#2745EA",
          "&:hover": {
            backgroundColor: "#2745EA",
          },
          color: "#fff",
        }}
      >
        {selectedToken?.name ? selectedToken?.name : "Select Token"}
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            setselectedToken({
              name: "BNB",
              token: "0x0000000000000000000000000000000000000000",
            });
            handleClose();
          }}
          disableRipple
        >
          {/* <FileCopyIcon /> */}
          BNB
        </MenuItem>
        <Divider sx={{ color: "#000" }} />
        <MenuItem
          onClick={() => {
            setselectedToken({ name: "CREST", token: tokenAddres });
            handleClose();
          }}
          disableRipple
        >
          CREST
        </MenuItem>
        <Divider sx={{ color: "#000" }} />
        <MenuItem
          onClick={() => {
            setselectedToken({ name: "USDT", token: usdtAddress });
            handleClose();
          }}
          disableRipple
        >
          {/* <FileCopyIcon /> */}
          USDT
        </MenuItem>
        <Divider sx={{ color: "#000" }} />
      </StyledMenu>
    </div>
  );
}
