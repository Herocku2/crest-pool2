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
    borderRadius: 16,
    marginTop: theme.spacing(1),
    minWidth: 270,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
    border: "1px solid",
    borderColor: theme.palette.divider,
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      color: theme.palette.text.primary,
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      }
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
          backgroundColor: "background.paper",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "secondary.main",
          "&:hover": {
            backgroundColor: "background.paper",
            borderColor: "primary.main",
          },
          color: "text.primary",
          fontWeight: "bold",
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
        <Divider />
        <MenuItem
          onClick={() => {
            setselectedToken({ name: "CREST", token: tokenAddres });
            handleClose();
          }}
          disableRipple
        >
          CREST
        </MenuItem>
        <Divider />
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
        <Divider />
      </StyledMenu>
    </div>
  );
}
