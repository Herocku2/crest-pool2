// import "./App.css";

import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer/Footer";
import { Swap } from "./components/Swap/Swap";
import Transactions from "./components/transactions/Transactions";
import { useSigner } from "wagmi";
import { useBuySellContract } from "./ConnectivityAss/hooks";
import { Navigate } from "react-router-dom/dist";
import { useState } from "react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

function App() {
  let { data: signer } = useSigner();
  const { address } = useAccount();
  // let address = "0xf2d5fcb7861120726c6dc130ca4bdb13f0cf4785";

  let buySellContract = useBuySellContract(signer);
  const [contractAdmin, setcontractAdmin] = useState("");
  const [adminsArray, setadminsArray] = useState("");
  let init = async () => {
    try {
      let [admins, contract_admin] = await Promise.all([
        buySellContract.getAdmins(),
        buySellContract.Admin(),
      ]);
      admins = admins.map((address) => address.toLowerCase());
      setadminsArray(admins);
      setcontractAdmin(contract_admin);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Routes>
        <Route
          exact
          path='/'
          element={
            <>
              <Header adminsArray={adminsArray} />
              <Swap  />
            </>
          }
        />
        <Route
          exact
          path='/Multi-Signer'
          element={
            adminsArray && adminsArray?.includes(address?.toLowerCase()) ? (
              <>
                <Header adminsArray={adminsArray} />
                <Transactions
                  adminsArray={adminsArray}
                  contractAdmin={contractAdmin}
                />
                <Footer />
              </>
            ) : (
              <Navigate to='/' />
            )
          }
        />
      </Routes>
    </>
  )
}

export default App;
