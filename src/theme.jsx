import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#1FC7D4", // Cyan
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9A6AFF", // Lighter Purple for better contrast on dark
      contrastText: "#ffffff",
    },
    background: {
      default: "#09070C", // Deep dark
      paper: "rgba(32, 29, 41, 0.6)",   // Semi-transparent for glassmorphism
    },
    text: {
      primary: "#F4EEFF",
      secondary: "#B8ADD2",
    },
    success: {
      main: "#31D0AA",
    },
    error: {
      main: "#ED4B9E",
    },
    warning: {
      main: "#FFB237",
    },
  },
  fontFamily: ["Nunito Sans", "sans-serif"].join(","),
  typography: {
    fontFamily: ["Nunito Sans", "sans-serif"].join(","),
    h1: { fontWeight: 800, color: "#F4EEFF" },
    h2: { fontWeight: 800, color: "#F4EEFF" },
    h3: { fontWeight: 700, color: "#F4EEFF" },
    h4: { fontWeight: 700, color: "#F4EEFF" },
    body1: { color: "#F4EEFF" },
    body2: { color: "#B8ADD2" },
    button: {
      textTransform: "none",
      fontWeight: 700,
      fontSize: "16px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
             transform: "translateY(-2px)",
             boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(90deg, #1FC7D4 0%, #15A0AB 100%)",
          boxShadow: "0px 4px 15px rgba(31, 199, 212, 0.4)",
          "&:hover": {
            boxShadow: "0px 6px 20px rgba(31, 199, 212, 0.6)",
          }
        },
        containedSecondary: {
          background: "linear-gradient(90deg, #7645D9 0%, #5E37AD 100%)",
          boxShadow: "0px 4px 15px rgba(118, 69, 217, 0.4)",
          "&:hover": {
             boxShadow: "0px 6px 20px rgba(118, 69, 217, 0.6)",
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "32px",
          backgroundImage: "none",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "32px",
          backgroundColor: "#201D29",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          backgroundColor: "#27262C",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
