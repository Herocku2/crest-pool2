import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "16px",
  textTransform: "capitalize",
  fontWeight: "bold",
  boxShadow: `0px 4px 0px 0px ${theme.palette.primary.dark}`,
  transition: "all 0.1s ease",
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  padding: "10px 24px",
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    boxShadow: `0px 2px 0px 0px ${theme.palette.primary.dark}`,
    transform: "translateY(2px)",
  },
  "&:active": {
    boxShadow: "none",
    transform: "translateY(4px)",
  },
}));

export default StyledButton;
