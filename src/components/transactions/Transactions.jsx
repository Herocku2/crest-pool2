import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
// import TablePagination from '@mui/material/TablePagination';
import TableRow from "@mui/material/TableRow";

import { Send as SendIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Stack,
  Typography,
  InputBase,
  Link
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
            color="text.primary"
          >
            MULTI SIGNATURE
          </Typography>
          <Divider
            sx={{
              borderColor: "text.secondary",
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
                  bgcolor: "background.paper",
                  borderRadius: "24px",
                  p: "30px",
                  boxShadow: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="700"
                  fontSize={{ xs: "20px", sm: "36px" }}
                  textAlign="center"
                  color="text.primary"
                >
                  Initiate Transaction
                </Typography>
                <Box sx={{ mb: "20px" }}>
                  <CustomizedMenus
                    selectedToken={selectedToken}
                    setselectedToken={setselectedToken}
                  />
                </Box>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "secondary.main",
                  borderRadius: "16px",
                  bgcolor: "background.default",
                  width: "100%",
                  px: 2,
                  py: 1
                }}>
                  <InputBase
                    placeholder={`Amount in ${selectedToken?.name}`}
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => settokenAmount(e.target.value)}
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      fontSize: "20px",
                      width: "100%",
                    }}
                  />
                </Box>
                <Box mt={3} width="100%">
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: "16px",
                      py: 1.5,
                      fontSize: "18px",
                      fontWeight: "bold",
                      boxShadow: "0px 4px 0px 0px #0e96a1",
                      "&:hover": {
                        boxShadow: "0px 2px 0px 0px #0e96a1",
                        transform: "translateY(2px)"
                      }
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
                      bgcolor: "background.paper",
                      borderRadius: "24px",
                      p: "30px",
                      boxShadow: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="700"
                      fontSize={{ xs: "20px", sm: "36px" }}
                      textAlign="center"
                      color="text.primary"
                    >
                      Add or Remove Admin
                    </Typography>
                    <Box sx={{ 
                      border: "1px solid",
                      borderColor: "secondary.main",
                      borderRadius: "16px",
                      bgcolor: "background.default",
                      width: "100%",
                      px: 2,
                      py: 1
                    }}>
                      <InputBase
                        placeholder="Bep20 wallet Address"
                        type="text"
                        sx={{
                          color: "text.primary",
                          fontWeight: "bold",
                          fontSize: "20px",
                          width: "100%",
                        }}
                        value={adminAddress}
                        onChange={(e) => setadminAddress(e.target.value)}
                      />
                    </Box>
                    <Box mt={3} width="100%">
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: "16px",
                          py: 1.5,
                          fontSize: "18px",
                          fontWeight: "bold",
                          boxShadow: "0px 4px 0px 0px #0e96a1",
                          "&:hover": {
                            boxShadow: "0px 2px 0px 0px #0e96a1",
                            transform: "translateY(2px)"
                          }
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
            backgroundColor: "background.paper",
            margin: "auto 0",
            borderRadius: "24px",
            boxShadow: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
          }}
          align="center"
        >
          <TableContainer sx={{ maxHeight: "700px", maxWidth: "100%" }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      sx={{
                        color: "secondary.main",
                        backgroundColor: "background.paper",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        fontSize: "16px",
                        fontFamily: "Open Sans",
                        fontWeight: "700",
                        textTransform: "uppercase"
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
                      colSpan={7}
                      sx={{
                        color: "text.primary",
                        fontSize: "14px",
                        fontFamily: "Open Sans",
                        fontWeight: "400",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <CircularProgress size={100} sx={{ color: "primary.main" }} />
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
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <a
                              href={`https://bscscan.com/address/${to}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: "none" }}
                            >
                              <Box component="span" sx={{ color: "primary.main" }}>
                                {to.slice(0, 6) + "..." + to.slice(-4)}
                              </Box>
                            </a>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {amount}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {Token}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            {moment.unix(time).format("lll")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Stack alignItems="center">
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                fontSize="14px"
                                textAlign="center"
                              >
                                Approves {approveCount}
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
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Stack alignItems="center">
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                fontSize="14px"
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
                            sx={{
                              color: "text.primary",
                              fontSize: "14px",
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Stack alignItems="center">
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                fontSize="14px"
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
                color: "text.primary",
                fontSize: "14px",
                fontFamily: "Open Sans",
              },
              ".MuiPaginationItem-previousNext": { backgroundColor: "primary.main" },
              ".Mui-selected": {
                backgroundColor: "secondary.main",
                color: "white"
              }
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}