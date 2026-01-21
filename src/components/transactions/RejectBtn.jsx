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
export default function RejectBtn({ countIndex, time, getTransactionsData }) {
  const [loading, setloading] = useState(false);
  let { data: signer } = useSigner();
  const { address } = useAccount();
  let buySellContract = useBuySellContract(signer);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  let rejectHandler = async () => {
    try {
      setloading(true);
      let fn = buySellContract.estimateGas.approveOrRejectTransaction;
      let params = [countIndex.toString(), false];
      let tx = await buySellContract.approveOrRejectTransaction(...params, {
        gasLimit: gasEstimationForAll(address, fn, params),
      });
      await tx.wait();

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
        variant="contained"
        color="error"
        fullWidth
        loadingPosition="end"
        loading={loading}
        disabled={loading || +time < +moment().format("X")}
        endIcon={<SendIcon />}
        onClick={rejectHandler}
        sx={{
          fontSize: "16px",
          height: "40px",
          borderRadius: "16px",
          boxShadow: "0px 2px 0px 0px #bd2d75", // Darker pink shadow
          "&:hover": {
            boxShadow: "0px 1px 0px 0px #bd2d75",
            transform: "translateY(1px)",
          },
        }}
      >
        {loading ? "Processing" : "Reject"}
      </LoadingButton>
    </>
  );
}
