import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import backgroundImage from "../assets/background-image.jpg";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showBalance, setShowBalance] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(
      contractAddress,
      atmABI,
      signer
    );

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
      setDepositAmount("");
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      setWithdrawAmount("");
    }
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
    if (!showBalance) {
      getBalance();
    }
  };

  const toggleAccount = () => {
    setShowAccount(!showAccount);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    return (
      <div className="atm-container">
        <div>
          <button
            style={{ width: "200px", marginBottom: "10px", fontSize: "25px" }}
            onClick={toggleAccount}
          >
            {showAccount ? "Hide Account" : "Show Account"}
          </button>
          {showAccount && (
            <div>
              <p>Your Account: {account}</p>
            </div>
          )}
        </div>
        <div>
          <button
            style={{ width: "200px", marginBottom: "10px", fontSize: "25px" }}
            onClick={toggleBalance}
          >
            {showBalance ? "Hide Balance" : "Show Balance"}
          </button>
          {showBalance && (
            <div>
              <p>Your Balance: {balance}</p>
            </div>
          )}
        </div>
        <div>
          <button
            style={{ width: "200px", marginBottom: "10px", fontSize: "25px" }}
            onClick={deposit}
          >
            Deposit ETH
          </button>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount"
            style={{ width: "180px" }}
          />
        </div>
        <div>
          <button
            style={{ width: "200px", marginBottom: "10px", fontSize: "25px" }}
            onClick={withdraw}
          >
            Withdraw ETH
          </button>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            style={{ width: "180px" }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#D8BFD8", // Set the desired background color
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
      }}
    >
      <header>
        <h1 style={{ fontSize: "55px" }}>The Ether ATM</h1>
      </header>
      {initUser()}
    </main>
  );
}