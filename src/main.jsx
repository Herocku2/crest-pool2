import React from "react";
import { Buffer } from "buffer";
window.Buffer = Buffer;
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { BrowserRouter } from "react-router-dom";
import { EthereumClient } from "@web3modal/ethereum";
import { WagmiConfig } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import { chains, wagmiClient, projectId } from "./wagmi";

const ethereumClient = new EthereumClient(wagmiClient, chains);
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <ToastContainer
      style={{ zIndex: 100000000000 }}
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <WagmiConfig client={wagmiClient}>
          <App />
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </BrowserRouter>
    </ThemeProvider>
  </>
);
