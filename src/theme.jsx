import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
      light: "#ffffff",
      defiText: "#9f9aae",
    },
    secondary: {
      main: "#06044a",
      light: "#4c02f1",
    },
    text: {
      primary: "#231E30",
      secondary: "white",
    },
    success: {
      main: "#ffffff",
    },
  },
  fontFamily: ["Nunito Sans", "sans-serif"].join(","),
  typography: {
    // --------Theme for main landing pages--------
    h1: {
      fontSize: "54px",
      fontWeight: "700",
      fontFamily: ["Nunito Sans", "sans-serif"].join(","),
      color: "linear-gradient(90deg, #2745EA 2.94%, #CF7BF4 100%)",
    },
    h2: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#ffffff",
    },
    h3: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#ffffff",
    },
    body1: {
      fontSize: "18px",
      fontWeight: "400",
      color: "#656776",
    },
    ////////////////////////////////////////////
    // --------Theme for dashBoard pages--------
    h4: {
      fontSize: "21px",
      fontWeight: "700",
      color: "white",
    },
    h5: {
      fontSize: "27px",
      fontWeight: "700",
      color: "white",
    },
    body2: {
      fontSize: "16px",
      color: "white",
    },

    subtitle1: {
      fontSize: "12px",
      color: "white",
    },
    subtitle2: {
      fontSize: "14px",
      color: "white",
    },
  },
  // direction: "rtl",
});

// theme.overrides = {
//   MuiCssBaseline: {
//     "@global": {
//       body: {
//         fontFamily: "Roboto",
//         backgroundColor: "#000000",
//         color: "#ffffff",
//       },
//     },
//   },
// };

theme = responsiveFontSizes(theme);

export default theme;
