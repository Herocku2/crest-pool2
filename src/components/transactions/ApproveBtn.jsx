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
        variant="contained"
        color="primary"
        fullWidth
        loading={loading}
        loadingPosition="end"
        disabled={loading || +time < +moment().format("X")}
        endIcon={<SendIcon />}
        onClick={approveHandler}
        sx={{
          fontSize: "16px",
          height: "40px",
          borderRadius: "16px",
          boxShadow: "0px 2px 0px 0px #0e96a1",
          "&:hover": {
            boxShadow: "0px 1px 0px 0px #0e96a1",
            transform: "translateY(1px)",
          },
        }}
      >
        {loading ? "Processing" : "Approve"}
      </LoadingButton>
    </>
  );
}
