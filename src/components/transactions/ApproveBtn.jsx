import { Button } from "@mui/material";
import { useAccount, useSigner } from "wagmi";
import {
  gasEstimationForAll,
  ToastNotify,
  useBuySellContract,
} from "../../ConnectivityAss/hooks";
import SendIcon from "@mui/icons-material/Send";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import moment from "moment";
export default function ApproveBtn({ countIndex, time, getTransactionsData }) {
  const [loading, setloading] = useState(false);
  let { data: signer } = useSigner();
  const { address } = useAccount();
  let buySellContract = useBuySellContract(signer);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  let approveHandler = async () => {
    try {
      setloading(true);
      let initiatTxFn = buySellContract.estimateGas.approveOrRejectTransaction;
      let initiateTxParams = [countIndex.toString(), true];
      let initiateTx = await buySellContract.approveOrRejectTransaction(
        ...initiateTxParams,
        {
          gasLimit: gasEstimationForAll(address, initiatTxFn, initiateTxParams),
        }
      );
      await initiateTx.wait();

      setAlertState({
        open: true,
        message: "Transaction Successful",
        severity: "success",
      });
      getTransactionsData();
      setloading(false);
    } catch (error) {
      console.log("Error", error);
      if (error?.data?.message) {
        setAlertState({
          open: true,
          message: error?.data?.message,
          severity: "error",
        });
      } else if (error?.reason) {
        setAlertState({
          open: true,
          message: error?.reason,
          severity: "error",
        });
      } else {
        setAlertState({
          open: true,
          message: error?.message,
          severity: "error",
        });
      }
      setloading(false);
    }
  };
  return (
    <>
      <ToastNotify alertState={alertState} setAlertState={setAlertState} />
      <LoadingButton
        sx={{
          fontWeight: 400,
          textTransform: "capitalize",
          backgroundColor: "#171F66",
          "&:hover": {
            backgroundColor: "#171F66a1",
          },
          border: "1px solid black",
          boxShadow: "0px 4px 18px rgba(0, 0, 0, 0.25)",
          color: "#ffffff",
          fontSize: "16px",
          fontFamily: ["Russo One", "sans-serif", "sans-serif"].join(","),
          borderRadius: "47px",
          height: "39px",
        }}
        loadingPosition="end"
        fullWidth
        loading={loading}
        disabled={loading || +time < +moment().format("X")}
        endIcon={<SendIcon />}
        onClick={approveHandler}
      >
        {loading ? "Processing" : "Approve"}
      </LoadingButton>
    </>
  );
}
