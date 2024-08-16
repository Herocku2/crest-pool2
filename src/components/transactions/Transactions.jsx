import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
// import TablePagination from '@mui/material/TablePagination';
import TableRow from "@mui/material/TableRow";

import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import CustomizedMenus from "./customizedMenu";
import ApproveBtn from "./ApproveBtn";
import RejectBtn from "./RejectBtn";
import ExecuteBtn from "./ExecuteBtn";
import { useState } from "react";
import { tokenAddres, usdtAddress } from "../../ConnectivityAss/environment";
import { isValidAddress } from "ethereum-address";
import {
  gasEstimationForAll,
  ToastNotify,
  useBuySellContract,
} from "../../ConnectivityAss/hooks";
import { LoadingButton } from "@mui/lab";
import { useAccount, useSigner } from "wagmi";
import { parseUnits } from "@ethersproject/units";
import { isAddress } from "ethers/lib/utils";
import { useEffect } from "react";
import { formatUnits } from "@ethersproject/units/lib";
import moment from "moment/moment";

const columns = [
  { id: "UserAddress", label: "User Address", minWidth: 170 },
  { id: "Amount", label: "Amount", minWidth: 100 },
  {
    id: "TokenName",
    label: "Token Name",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "TransactionTime",
    label: "Transaction Time",
    // label: 'Size\u00a0(km\u00b2)',
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "Approve",
    label: "Approve",
    minWidth: 170,
    align: "right",
    format: (value) => value.toFixed(2),
  },
  {
    id: "Reject",
    label: "Reject",
    minWidth: 170,
    align: "right",
    format: (value) => value.toFixed(2),
  },
  {
    id: "Execute",
    label: "Execute",
    minWidth: 170,
    align: "right",
    format: (value) => value.toFixed(2),
  },
];

function createData(
  UserAddress,
  Amount,
  TokenName,
  TransactionTime,
  Approve,
  Reject,
  Execute
) {
  return {
    UserAddress,
    Amount,
    TokenName,
    TransactionTime,
    Approve,
    Reject,
    Execute,
  };
}

export default function Transactions({ adminsArray, contractAdmin }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tokenAmount, settokenAmount] = useState("");
  let { data: signer } = useSigner();
  const { address } = useAccount();
  let buySellContract = useBuySellContract(signer);
  const [adminAddress, setadminAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, settotalTransactions] = useState(0);

  const [selectedToken, setselectedToken] = useState({
    name: "BNB",
    token: "0x0000000000000000000000000000000000000000",
  });
  const [loading, setloading] = useState({
    initiatTxFn: false,
    addOrRemoveFn: false,
    fetchingTxData: false,
  });
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  let getTransactionsData = async () => {
    try {
      setloading({ fetchingTxData: true });
      let count = await buySellContract.transactionCount();
      let startIndex = 0;
      let endIndex = count;
      if (count > rowsPerPage) {
        startIndex = count - page * rowsPerPage;
        endIndex = startIndex + rowsPerPage;
        if (startIndex < 0) {
          endIndex = endIndex + startIndex;
          startIndex = 0;
        }
      }
      let newTransactions = [];
      for (let i = endIndex - 1; i >= startIndex && i >= 0; i--) {
        let {
          Token,
          amount,
          to,
          time,
          isExecuted,
          isApproved,
          isRejected,
          approveCount,
          rejectCount,
        } = await buySellContract.transactions(i);
        Token =
          Token.toLowerCase() === tokenAddres.toLowerCase()
            ? "CREST"
            : Token.toLowerCase() === usdtAddress.toLowerCase()
            ? "USDT"
            : "BNB";

        let tokenDecimal = Token === "CREST" ? 12 : 18;
        newTransactions.push({
          Token,
          amount: +formatUnits(amount, tokenDecimal),
          to,
          time: +time,
          isExecuted,
          isApproved,
          isRejected,
          approveCount: +approveCount,
          rejectCount: +rejectCount,
          countIndex: i,
        });
      }
      setTransactions(newTransactions);
      settotalTransactions(count);
      setloading({ fetchingTxData: false });
    } catch (error) {
      console.log(error);
      setloading({ fetchingTxData: false });
    }
  };

  useEffect(() => {
    getTransactionsData();
  }, []);

  let initiateTransactionHandler = async () => {
    try {
      if (!tokenAmount || tokenAmount === 0 || isNaN(tokenAmount)) {
        setAlertState({
          open: true,
          message: "Please enter a valid token amount.",
          severity: "error",
        });
      } else {
        setloading({ initiatTxFn: true });
        let tokenDecimal = selectedToken.name === "CREST" ? 12 : 18;
        let initiatTxFn = buySellContract.estimateGas.initiateTransaction;
        let initiateTxParams = [
          address,
          parseUnits(tokenAmount.toString(), tokenDecimal),
          selectedToken.token,
        ];
        let initiateTx = await buySellContract.initiateTransaction(
          ...initiateTxParams,
          {
            gasLimit: gasEstimationForAll(
              address,
              initiatTxFn,
              initiateTxParams
            ),
          }
        );
        await initiateTx.wait();
      }
      setAlertState({
        open: true,
        message: "Transaction Successful",
        severity: "success",
      });
      getTransactionsData();
      setloading({ initiatTxFn: false });
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
      setloading({ initiatTxFn: false });
    }
  };
  let changeAdminHandler = async () => {
    try {
      let isValid = isAddress(adminAddress);
      if (!adminAddress || !isValid) {
        setAlertState({
          open: true,
          message: "Please enter a valid bep20 admin wallet address.",
          severity: "error",
        });
      } else {
        setloading({ addOrRemoveFn: true });
        if (adminsArray?.includes(adminAddress.toLowerCase())) {
          let fn = buySellContract.estimateGas.removeAdmin;
          let params = [adminAddress];
          let tx = await buySellContract.removeAdmin(...params, {
            gasLimit: gasEstimationForAll(address, fn, params),
          });
          await tx.wait();
        } else {
          let fn = buySellContract.estimateGas.addAdmin;
          let params = [adminAddress];
          let tx = await buySellContract.addAdmin(...params, {
            gasLimit: gasEstimationForAll(address, fn, params),
          });
          await tx.wait();
        }
      }
      setAlertState({
        open: true,
        message: "Transaction Successful",
        severity: "success",
      });
      setloading({ addOrRemoveFn: false });
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
      setloading({ addOrRemoveFn: false });
    }
  };
  return (
    <Container maxWidth="xl">
      <ToastNotify alertState={alertState} setAlertState={setAlertState} />
      <Box pt={15}>
        <Typography
          variant="h5"
          fontWeight="700"
          fontSize={{ xs: "20px", sm: "36px" }}
          textAlign="center"
        >
          MULTI SIGNATURE
        </Typography>
        <Divider
          sx={{
            borderColor: "white",
            borderWidth: "1px",
            width: { xs: "auto", sm: "40%" },
            mx: "auto",
            my: 2,
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ mb: "40px" }}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          columnSpacing={5}
          rowSpacing={3}
        >
          <Grid item xs={12} sm={6}>
            <Stack
              alignItems="center"
              sx={{
                border: "2px solid #fff",
                borderRadius: "20px",
                py: "30px",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="700"
                fontSize={{ xs: "20px", sm: "36px" }}
                textAlign="center"
              >
                Initiate Transaction
              </Typography>
              <Box sx={{ mb: "20px" }}>
                <CustomizedMenus
                  selectedToken={selectedToken}
                  setselectedToken={setselectedToken}
                />
              </Box>
              <Box sx={{ border: "2px solid rgba(255, 255, 255, 0.11)" }}>
                <input
                  placeholder={`Amount in ${selectedToken?.name}`}
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => settokenAmount(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    padding: "10px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                    width: "100%",
                  }}
                />
              </Box>
              <Box mt={3}>
                <LoadingButton
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    fontSize: "18px",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(90deg, #2745EA 2.94%, #CF7BF4 100%)",
                    color: "#ffffff",
                  }}
                  fullWidth
                  loadingPosition="end"
                  loading={loading.initiatTxFn}
                  disabled={loading.initiatTxFn}
                  endIcon={<SendIcon />}
                  onClick={initiateTransactionHandler}
                >
                  {loading.initiatTxFn ? "Processing" : "Initiate Transaction"}
                </LoadingButton>
              </Box>
            </Stack>
          </Grid>
          {contractAdmin &&
            contractAdmin.toLowerCase() === address.toLowerCase() && (
              <Grid item xs={12} sm={6}>
                <Stack
                  alignItems="center"
                  sx={{
                    border: "2px solid #fff",
                    borderRadius: "20px",
                    py: "30px",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    fontSize={{ xs: "20px", sm: "36px" }}
                    textAlign="center"
                  >
                    Add or Remove Admin
                  </Typography>
                  <Box sx={{ border: "2px solid rgba(255, 255, 255, 0.11)" }}>
                    <input
                      placeholder="Bep20 wallet Address"
                      type="text"
                      style={{
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        padding: "10px",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "20px",
                        width: "100%",
                      }}
                      value={adminAddress}
                      onChange={(e) => setadminAddress(e.target.value)}
                    />
                  </Box>
                  <Box mt={3}>
                    <LoadingButton
                      variant="outlined"
                      sx={{
                        borderRadius: "10px",
                        py: 1,
                        fontSize: "18px",
                        fontWeight: "bold",
                        background:
                          "linear-gradient(90deg, #2745EA 2.94%, #CF7BF4 100%)",
                        color: "#ffffff",
                      }}
                      fullWidth
                      loadingPosition="end"
                      loading={loading.addOrRemoveFn}
                      disabled={loading.addOrRemoveFn}
                      endIcon={<SendIcon />}
                      onClick={changeAdminHandler}
                    >
                      {adminsArray?.includes(adminAddress.toLowerCase())
                        ? loading.addOrRemoveFn
                          ? "Processing"
                          : "Remove Admin"
                        : loading.addOrRemoveFn
                        ? "Processing"
                        : "Add Admin"}
                    </LoadingButton>
                  </Box>
                </Stack>
              </Grid>
            )}
        </Grid>
      </Container>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          backgroundColor: "transparent",
          margin: "auto 0",
          boxShadow: "none",
        }}
        align="center"
      >
        <TableContainer sx={{ maxHeight: "700px", maxWidth: "100%" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead sx={{ backgroundColor: "#2745EA" }}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      backgroundColor: "#2745EA",
                      borderBottom: "1px solid #171F66",
                      fontSize: "16px",
                      fontFamily: "Open Sans",
                      fontWeight: "700",
                    }}
                    key={column.id}
                    //   align={column.align}
                    align="center"
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.fetchingTxData ? (
                <TableRow hover role="checkbox" tabIndex={-1}>
                  <TableCell
                    align="center"
                    //    align={column.align}
                    colSpan={7}
                    sx={{
                      color: "#ffffff",
                      fontSize: "12px",
                      fontFamily: "Open Sans",
                      backgroundColor: "rgba(32, 42, 128, 0.79)",
                      fontWeight: "400",
                      border: "1px solid #171F66",
                    }}
                  >
                    <CircularProgress size={100} sx={{ color: "white" }} />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map(
                  (
                    {
                      Token,
                      amount,
                      to,
                      time,
                      isExecuted,
                      isApproved,
                      isRejected,
                      approveCount,
                      rejectCount,
                      countIndex,
                    },
                    index
                  ) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          <a
                            href={`https://bscscan.com/address/${to}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "white" }}
                          >
                            {to.slice(0, 4) + "..." + to.slice(0, 4)}
                          </a>
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          {amount}
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          {Token}
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          {moment.unix(time).format("lll")}
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          <Stack alignItems="center">
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              fontSize="12px"
                              textAlign="center"
                            >
                              Approval {approveCount}
                            </Typography>
                            <ApproveBtn
                              countIndex={countIndex}
                              time={time}
                              getTransactionsData={getTransactionsData}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          <Stack alignItems="center">
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              fontSize="12px"
                              textAlign="center"
                            >
                              Rejects {rejectCount}
                            </Typography>
                            <RejectBtn
                              countIndex={countIndex}
                              time={time}
                              getTransactionsData={getTransactionsData}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="center"
                          //    align={column.align}
                          sx={{
                            color: "#ffffff",
                            fontSize: "12px",
                            fontFamily: "Open Sans",
                            backgroundColor: "#4e42fc",
                            fontWeight: "400",
                            border: "1px solid #171F66",
                          }}
                        >
                          <Stack alignItems="center">
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              fontSize="12px"
                              textAlign="center"
                            >
                              {time > +moment().format("X")
                                ? "Pending"
                                : isApproved
                                ? "Approved"
                                : isRejected
                                ? "Rejected"
                                : isExecuted
                                ? "Executed"
                                : "No Result"}
                            </Typography>
                            <ExecuteBtn
                              countIndex={countIndex}
                              time={time}
                              getTransactionsData={getTransactionsData}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}

        <Box sx={{ display: "flex", justifyContent: "center" }} my={5}>
          <Pagination
            count={Math.ceil(+totalTransactions / rowsPerPage)}
            rowsPerPageOptions={[10]}
            rowsPerPage={rowsPerPage}
            onChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            boundaryCount={5}
            page={page}
            sx={{
              ".MuiPaginationItem-text": {
                color: "#ffffff",
                fontSize: "12px",
                fontFamily: "Open Sans",
              },
              ".MuiPaginationItem-previousNext": { backgroundColor: "#F1620A" },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
