import React, { useState, useEffect } from "react";
import finLogo from "./assets/fintrack_logo.png";
import "./styles.css";

const API_BASE = "http://localhost:8586";


function App() {
  const [view, setView] = useState("login");
  const [authMode, setAuthMode] = useState("password");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000); // hide after 3 seconds

    return () => clearTimeout(timer);
  }
}, [message]);



  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  const [accountForm, setAccountForm] = useState({
    accountType: "SAVINGS",
    initialBalance: 0
  });

  const [txForm, setTxForm] = useState({
    type: "CREDIT",
    amount: 0,
    description: ""
  });

  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    description: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    description: "",
    method: "UPI"
  });
const [downloadAuth, setDownloadAuth] = useState({
  show: false,
  email: "",
  password: "",
});

  // ---------- UPI ----------
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  // ---------- CARD (real number) ----------
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardVerified, setCardVerified] = useState(false);
  const [cardHolder, setCardHolder] = useState("");

  // secure masking for card
  const [maskedCard, setMaskedCard] = useState("");
  const [maskTimeoutId, setMaskTimeoutId] = useState(null);

  // ---------- CASH ----------
  const [cashName, setCashName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // secure masking for Aadhaar
  const [maskedAadhaar, setMaskedAadhaar] = useState("");
  const [aadhaarMaskTimeout, setAadhaarMaskTimeout] = useState(null);

  // ---------- Popup ----------
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: ""
  });
  

  // ===================== EFFECTS =====================
  useEffect(() => {
    if (user) fetchAccounts(user.userId);
  }, [user]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions(selectedAccountId);
      fetchPayments(selectedAccountId);
    } else {
      setTransactions([]);
      setPayments([]);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    if (popup.show) {
      const t = setTimeout(
        () => setPopup({ show: false, type: "", message: "" }),
        2000
      );
      return () => clearTimeout(t);
    }
  }, [popup]);

  // small helper for masking last 4 digits (for history text)
  const maskLast4 = (value) => {
    if (!value) return "";
    if (value.length <= 4) return "*".repeat(value.length);
    return "*".repeat(value.length - 4) + value.slice(-4);
  };

  // ===================== HANDLERS =====================
  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleAccountChange = (e) =>
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });

  const handleTxChange = (e) =>
    setTxForm({ ...txForm, [e.target.name]: e.target.value });

  const handleTransferChange = (e) =>
    setTransferForm({ ...transferForm, [e.target.name]: e.target.value });

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });

    if (e.target.name === "method") {
      // reset UPI
      setUpiId("");
      setUpiVerified(false);

      // reset CARD
      setCardNumber("");
      setCardExpiry("");
      setCardVerified(false);
      setCardHolder("");
      setMaskedCard("");
      if (maskTimeoutId) clearTimeout(maskTimeoutId);
      setMaskTimeoutId(null);

      // reset CASH
      setCashName("");
      setAadhaar("");
      setAadhaarVerified(false);
      setMaskedAadhaar("");
      if (aadhaarMaskTimeout) clearTimeout(aadhaarMaskTimeout);
      setAadhaarMaskTimeout(null);
    }
  };

  // ---------- CARD NUMBER SECURE MASKING ----------
  const handleCardNumberChange = (value) => {
    if (!/^\d*$/.test(value)) return; // only digits

    setCardNumber(value);
    setMaskedCard(value); // show raw for 2 seconds

    if (maskTimeoutId) clearTimeout(maskTimeoutId);

    const timeoutId = setTimeout(() => {
      if (value.length === 0) {
        setMaskedCard("");
        return;
      }
      if (value.length <= 4) {
        setMaskedCard("*".repeat(value.length));
      } else {
        const last4 = value.slice(-4);
        const stars = "*".repeat(value.length - 4);
        setMaskedCard(stars + last4);
      }
    }, 2000);

    setMaskTimeoutId(timeoutId);
  };

  // ---------- AADHAAR SECURE MASKING ----------
  const handleAadhaarChange = (value) => {
    if (!/^\d*$/.test(value)) return; // only digits

    setAadhaar(value);
    setMaskedAadhaar(value); // show raw for 2 seconds

    if (aadhaarMaskTimeout) clearTimeout(aadhaarMaskTimeout);

    const timeout = setTimeout(() => {
      if (value.length === 0) {
        setMaskedAadhaar("");
      } else if (value.length <= 4) {
        setMaskedAadhaar("*".repeat(value.length));
      } else {
        const last4 = value.slice(-4);
        const stars = "*".repeat(value.length - 4);
        setMaskedAadhaar(stars + last4);
      }
    }, 2000);

    setAadhaarMaskTimeout(timeout);
  };

  // ===================== AUTH =====================
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(API_BASE + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "Registration failed");
      } else {
        setMessage("Registration successful! Please login.");
        setView("login");
      }
    } catch {
      setMessage("Error connecting to server");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "Login failed");
      } else {
        const data = await res.json();
        setUser(data);
        setView("dashboard");
        setMessage("Login successful");
      }
    } catch {
      setMessage("Error connecting to server");
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setDemoOtp("");

    try {
      const res = await fetch(API_BASE + "/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail })
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "Failed to send OTP");
      } else {
        const data = await res.json();
        setMessage("OTP Sent");
        setOtpSent(true);
        setDemoOtp(data.demoOtp || "");
      }
    } catch {
      setMessage("Server error");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(API_BASE + "/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otpCode })
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "OTP verification failed");
      } else {
        const data = await res.json();
        setUser(data);
        setView("dashboard");
        setMessage("OTP Login Successful");
      }
    } catch {
      setMessage("Server error");
    }
  };

  // ===================== FETCH DATA =====================
  const fetchAccounts = async (userId) => {
    try {
      const res = await fetch(API_BASE + "/api/accounts/user/" + userId);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0) setSelectedAccountId(String(data[0].id));
      }
    } catch {
      /* ignore */
    }
  };

  const fetchTransactions = async (id) => {
    try {
      const res = await fetch(API_BASE + "/api/transactions/account/" + id);
      if (res.ok) setTransactions(await res.json());
    } catch {/* ignore */}
  };

  const fetchPayments = async (id) => {
    try {
      const res = await fetch(API_BASE + "/api/payments/account/" + id);
      if (res.ok) setPayments(await res.json());
    } catch {/* ignore */}
  };

  // ===================== ACCOUNTS / TX / TRANSFER =====================
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        userId: user.userId,
        accountType: accountForm.accountType,
        initialBalance: Number(accountForm.initialBalance)
      };

      const res = await fetch(API_BASE + "/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) setMessage("Account create failed");
      else {
        setMessage("Account Created");
        fetchAccounts(user.userId);
      }
    } catch {
      setMessage("Server error");
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        accountId: Number(selectedAccountId),
        type: txForm.type,
        amount: Number(txForm.amount),
        description: txForm.description
      };

      const res = await fetch(API_BASE + "/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage("Transaction Success");
        fetchTransactions(selectedAccountId);
      } else {
        setMessage("Transaction Failed");
      }
    } catch {
      setMessage("Server error");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        fromAccountId: Number(transferForm.fromAccountId),
        toAccountId: Number(transferForm.toAccountId),
        amount: Number(transferForm.amount),
        description: transferForm.description
      };

      const res = await fetch(API_BASE + "/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage("Transfer Successful");
        fetchAccounts(user.userId);
        fetchTransactions(selectedAccountId);
      } else {
        setMessage("Transfer Failed");
      }
    } catch {
      setMessage("Server error");
    }
  };

  // ===================== VERIFICATION HELPERS =====================
  const verifyUpi = () => {
    const pattern = /^[\w.-]+@[\w.-]+$/;
    if (pattern.test(upiId)) {
      setUpiVerified(true);
      setPopup({ show: true, type: "success", message: "UPI Verified Successfully" });
    } else {
      setUpiVerified(false);
      setPopup({ show: true, type: "error", message: "Invalid UPI ID" });
    }
  };

  const verifyCard = () => {
    setCardVerified(false);

    if (!/^\d{16}$/.test(cardNumber)) {
      setPopup({ show: true, type: "error", message: "Card number not valid" });
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      setPopup({ show: true, type: "error", message: "Invalid expiry format (MM/YY)" });
      return;
    }
    if (cardHolder.trim().length < 3) {
      setPopup({ show: true, type: "error", message: "Enter Card Holder Name" });
      return;
    }

    setCardVerified(true);
    setPopup({ show: true, type: "success", message: "Card verified successfully" });
  };

  const verifyAadhaar = () => {
    if (!cashName.trim()) {
      setPopup({ show: true, type: "error", message: "Enter Name" });
      return;
    }
    if (!/^\d{12}$/.test(aadhaar)) {
      setPopup({ show: true, type: "error", message: "Invalid Aadhaar Number" });
      return;
    }

    setAadhaarVerified(true);
    setPopup({ show: true, type: "success", message: "Aadhaar verified successfully" });
  };

  // ===================== PAYMENT =====================
  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedAccountId) {
      setMessage("No account selected");
      return;
    }
    if (paymentForm.method === "UPI" && !upiVerified) {
      setPopup({ show: true, type: "error", message: "Please verify UPI before paying" });
      return;
    }
    if (paymentForm.method === "CARD" && !cardVerified) {
      setPopup({ show: true, type: "error", message: "Please verify Card before paying" });
      return;
    }
    if (paymentForm.method === "CASH" && !aadhaarVerified) {
      setPopup({ show: true, type: "error", message: "Please verify Aadhaar before paying" });
      return;
    }

    try {
      const extraInfo =
        paymentForm.method === "CARD" && cardHolder
          ? ` (Holder: ${cardHolder})`
          : paymentForm.method === "CASH" && cashName
          ? ` (Name: ${cashName}, Aadhaar: ${maskLast4(aadhaar)})`
          : "";

      const payload = {
        accountId: Number(selectedAccountId),
        amount: Number(paymentForm.amount),
        description: paymentForm.description + extraInfo,
        method: paymentForm.method
      };

      const res = await fetch(API_BASE + "/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setMessage("Payment Successful: " + data.status);

        // reset form and verification
        setPaymentForm({ amount: 0, description: "", method: "UPI" });

        setUpiId("");
        setUpiVerified(false);

        setCardNumber("");
        setCardExpiry("");
        setCardVerified(false);
        setCardHolder("");
        setMaskedCard("");
        if (maskTimeoutId) clearTimeout(maskTimeoutId);
        setMaskTimeoutId(null);

        setCashName("");
        setAadhaar("");
        setAadhaarVerified(false);
        setMaskedAadhaar("");
        if (aadhaarMaskTimeout) clearTimeout(aadhaarMaskTimeout);
        setAadhaarMaskTimeout(null);

        fetchPayments(selectedAccountId);
        fetchTransactions(selectedAccountId);
        fetchAccounts(user.userId);
      } else {
        setMessage("Payment Failed");
      }
    } catch {
      setMessage("Server error");
    }
  };

  // ===================== LOGOUT =====================
  const handleLogout = () => {
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setPayments([]);
    setSelectedAccountId("");
    setOtpEmail("");
    setOtpCode("");
    setOtpSent(false);
    setDemoOtp("");
    setMessage("Logged out");
    setView("login");

    setCardNumber("");
    setMaskedCard("");
    if (maskTimeoutId) clearTimeout(maskTimeoutId);
    setMaskTimeoutId(null);

    setCashName("");
    setAadhaar("");
    setAadhaarVerified(false);
    setMaskedAadhaar("");
    if (aadhaarMaskTimeout) clearTimeout(aadhaarMaskTimeout);
    setAadhaarMaskTimeout(null);
  };
  // ===================== DOWNLOAD VERIFICATION =====================
const verifyDownloadUser = async () => {
  try {
    const res = await fetch(API_BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: downloadAuth.email,
        password: downloadAuth.password,
      }),
    });

    if (!res.ok) {
      setMessage("Invalid credentials for secure download");
      return;
    }

    setMessage("Verified successfully!");
    setDownloadAuth({ show: false, email: "", password: "" });

    downloadTransactionsReceipt(); 
  } catch {
    setMessage("Server error during verification");
  }
};
const downloadTransactionsReceipt = () => {
  const data = transactions.map(t =>
    `${t.type} | ₹${t.amount} | ${t.description} | ${t.createdAt}`
  ).join("\n");

  const blob = new Blob([data], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions.txt";
  link.click();
};


  // ===================== POPUP COMPONENT =====================
  const PopupMessage = () =>
    popup.show && (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "#0f1e2e",
          padding: "12px 20px",
          borderRadius: "10px",
          color: "white",
          fontSize: "14px",
          borderLeft:
            popup.type === "success"
              ? "4px solid #0aff71"
              : "4px solid #ff3b3b",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)"
        }}
      >
        {popup.type === "success" ? "✔️ " : "❌ "}
        {popup.message}
      </div>
    );

  // ===================== UI =====================
  return (
    <div className="app">
      <PopupMessage />

      <header className="header">

  <div className="header-logo-box">

    <h1 className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <img 
    src={finLogo} 
    alt="logo" 
    style={{
      width: "38px",
      height: "38px",
      borderRadius: "8px",
    }} 
  />
  FinTrack
</h1>

  </div>

  <p className="subtitle">
    Finance Dashboard • React + Spring Boot Backend
  </p>


        {user && (
          <div className="user-info">
            <span>Welcome, {user.fullName}</span>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {message && <div className="message">{message}</div>}
        
      {!user && (
        <div className="auth-toggle">
          <button
            className={view === "login" ? "btn-primary" : "btn-secondary"}
            onClick={() => setView("login")}
          >
            Login
          </button>
          <button
            className={view === "register" ? "btn-primary" : "btn-secondary"}
            onClick={() => setView("register")}
          >
            Register
          </button>
        </div>
      )}

      <main className="content">
     {/* REGISTER */}
{!user && view === "register" && (
  <div className="card">

    {/* ADD LOGO HERE same as login */}
    <div className="auth-logo-box">
      <img src={finLogo} alt="logo" className="auth-logo" />
    </div>


    <h2>Create Account</h2>

            <form onSubmit={handleRegister} className="form">
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                />
              </label>

              <button type="submit" className="btn-primary">
                Register
              </button>
            </form>
          </div>
        )}
{/* LOGIN */}
{!user && view === "login" && (
  <div className="card">

    <div className="auth-logo-box">
      <img src={finLogo} alt="logo" className="auth-logo" />
    </div>

    <h2>Login</h2>


            <div className="tabs">
              <button
                className={authMode === "password" ? "tab active" : "tab"}
                onClick={() => setAuthMode("password")}
              >
                Password Login
              </button>
              <button
                className={authMode === "otp" ? "tab active" : "tab"}
                onClick={() => setAuthMode("otp")}
              >
                OTP Login
              </button>
            </div>

            {authMode === "password" && (
              <form onSubmit={handleLogin} className="form">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                </label>

                <button type="submit" className="btn-primary">
                  Login
                </button>
              </form>
            )}

            {authMode === "otp" && (
              <form onSubmit={otpSent ? verifyOtp : sendOtp} className="form">
                <label>
                  Email
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    required
                  />
                </label>

                {!otpSent && (
                  <button type="submit" className="btn-primary">
                    Send OTP
                  </button>
                )}

                {otpSent && (
                  <>
                    <label>
                      Enter OTP
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                      />
                    </label>

                    <button type="submit" className="btn-primary">
                      Verify OTP &amp; Login
                    </button>

                    {demoOtp && (
                      <p className="demo-otp">
                        Demo OTP: <b>{demoOtp}</b>
                      </p>
                    )}
                  </>
                )}
              </form>
            )}
          </div>
        )}

        {/* DASHBOARD */}
        {user && view === "dashboard" && (
          <div className="dashboard">
            {/* ACCOUNTS */}
            <section className="card">
              <h2>Your Accounts</h2>

              <form onSubmit={handleCreateAccount} className="form-inline">
                <select
                  name="accountType"
                  value={accountForm.accountType}
                  onChange={handleAccountChange}
                >
                  <option value="SAVINGS">SAVINGS</option>
                  <option value="CURRENT">CURRENT</option>
                  <option value="WALLET">WALLET</option>
                </select>

                <input
                  type="number"
                  name="initialBalance"
                  placeholder="Initial Balance"
                  value={accountForm.initialBalance}
                  onChange={handleAccountChange}
                />

                <button className="btn-primary" type="submit">
                  Add
                </button>
              </form>

              <div className="accounts-list">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={
                      "account-item " +
                      (String(acc.id) === String(selectedAccountId) ? "active" : "")
                    }
                    onClick={() => setSelectedAccountId(acc.id)}
                  >
                    <div className="account-header">
                      <strong>{acc.accountType}</strong>
                      <span>{acc.accountNumber}</span>
                    </div>

                    <div className="account-balance">
                      Balance: ₹ {acc.balance.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

{/* TRANSACTIONS */}
<section className="card">
  <h2>Transactions</h2>

  <button
    className="btn-primary"
    style={{ marginBottom: "12px" }}
    onClick={() => setDownloadAuth({ ...downloadAuth, show: true })}
  >
    Download All Transactions
  </button>

  {downloadAuth.show && (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Secure Verification</h3>
        <p>Please verify your identity to download transactions.</p>

        <input
          type="email"
          placeholder="Enter your Email"
          className="input"
          value={downloadAuth.email}
          onChange={(e) =>
            setDownloadAuth({ ...downloadAuth, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="input"
          value={downloadAuth.password}
          onChange={(e) =>
            setDownloadAuth({ ...downloadAuth, password: e.target.value })
          }
        />

        <div className="modal-actions">
          <button className="btn-primary" onClick={verifyDownloadUser}>
            Verify & Continue
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              setDownloadAuth({ show: false, email: "", password: "" })
            }
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}


              <form onSubmit={handleCreateTransaction} className="form-inline">
                <select
                  name="type"
                  value={txForm.type}
                  onChange={handleTxChange}
                >
                  <option value="CREDIT">CREDIT</option>
                  <option value="DEBIT">DEBIT</option>
                </select>

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={txForm.amount}
                  onChange={handleTxChange}
                />

                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={txForm.description}
                  onChange={handleTxChange}
                />

                <button className="btn-primary" type="submit">
                  Add Tx
                </button>
              </form>

              <div className="transactions-list">
                {transactions.map((tx) => (
                  <div key={tx.id} className="tx-item">
                    <div className="tx-main">
                      <span className={tx.type === "CREDIT" ? "credit" : "debit"}>
                        {tx.type}
                      </span>
                      <span className="tx-amount">₹ {tx.amount.toFixed(2)}</span>
                    </div>

                    <div className="tx-desc">{tx.description}</div>

                    <div className="tx-date">
                      {tx.createdAt.replace("T", " ").slice(0, 19)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PAYMENTS */}
            <section className="card">
              <h2>Payments</h2>

              <form onSubmit={handlePayment} className="form-inline">
                <select
                  name="method"
                  value={paymentForm.method}
                  onChange={handlePaymentChange}
                >
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                  <option value="CASH">CASH</option>
                </select>

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                />

                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={paymentForm.description}
                  onChange={handlePaymentChange}
                />

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    (paymentForm.method === "UPI" && !upiVerified) ||
                    (paymentForm.method === "CARD" && !cardVerified) ||
                    (paymentForm.method === "CASH" && !aadhaarVerified)
                  }
                  style={{
                    opacity:
                      (paymentForm.method === "UPI" && !upiVerified) ||
                      (paymentForm.method === "CARD" && !cardVerified) ||
                      (paymentForm.method === "CASH" && !aadhaarVerified)
                        ? 0.6
                        : 1,
                    cursor:
                      (paymentForm.method === "UPI" && !upiVerified) ||
                      (paymentForm.method === "CARD" && !cardVerified) ||
                      (paymentForm.method === "CASH" && !aadhaarVerified)
                        ? "not-allowed"
                        : "pointer"
                  }}
                >
                  Pay
                </button>
              </form>

              {/* UPI extra UI */}
              {paymentForm.method === "UPI" && (
                <div
                  style={{
                    marginTop: "0px",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      width: "165px",
                      borderRadius: "6px",
                      background: "#0C1427",
                      color: "white",
                      border: "1px solid #3C4A63"
                    }}
                  />

                  <button
                    type="button"
                    onClick={verifyUpi}
                    className={upiVerified ? "verify-glow" : ""}
                    style={{
                      padding: "8px 10px",
                      background: upiVerified ? "green" : "#555",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Verify
                  </button>
                </div>
              )}

              {/* CARD extra UI */}
              {paymentForm.method === "CARD" && (
                <div
                  style={{
                    marginTop: "4px",
                    marginBottom: "14px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px"
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Card Number (16 digits)"
                      maxLength={16}
                      value={maskedCard || cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        width: "180px",
                        borderRadius: "6px",
                        background: "#0C1427",
                        color: "white",
                        border: "1px solid #3C4A63"
                      }}
                    />

                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        width: "70px",
                        borderRadius: "6px",
                        background: "#0C1427",
                        color: "white",
                        border: "1px solid #3C4A63"
                      }}
                    />

                    <button
                      type="button"
                      onClick={verifyCard}
                      style={{
                        padding: "8px 10px",
                        background: cardVerified ? "green" : "#555",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      Verify
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      width: "260px",
                      borderRadius: "6px",
                      background: "#0C1427",
                      color: "white",
                      border: "1px solid #3C4A63"
                    }}
                  />

                  {cardVerified && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6ee7b7",
                        marginLeft: "4px",
                        marginTop: "4px"
                      }}
                    >
                      Card Holder: <strong>{cardHolder}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* CASH extra UI */}
              {paymentForm.method === "CASH" && (
                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={cashName}
                    onChange={(e) => setCashName(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      width: "260px",
                      borderRadius: "6px",
                      background: "#0C1427",
                      color: "white",
                      border: "1px solid #3C4A63"
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Enter Aadhaar Number (12 digits)"
                    maxLength={12}
                    value={maskedAadhaar || aadhaar}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      width: "260px",
                      borderRadius: "6px",
                      background: "#0C1427",
                      color: "white",
                      border: "1px solid #3C4A63"
                    }}
                  />

                  <button
                    type="button"
                    onClick={verifyAadhaar}
                    style={{
                      padding: "8px 12px",
                      width: "120px",
                      background: aadhaarVerified ? "green" : "#555",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      alignSelf: "flex-start"
                    }}
                  >
                    Verify
                  </button>

                  {aadhaarVerified && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6ee7b7",
                        marginTop: "4px"
                      }}
                    >
                      Aadhaar Verified
                    </div>
                  )}
                </div>
              )}

              <div className="payments-list">
                {payments.map((p) => (
                  <div key={p.id} className="payment-item">
                    <div className="payment-main">
                      <span className="payment-method">{p.method}</span>
                      <span className="payment-amount">
                        ₹ {p.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="payment-desc">{p.description}</div>

                    <div className="payment-meta">
                      <span className={"status-badge " + p.status.toLowerCase()}>
                        {p.status}
                      </span>

                      <span className="payment-date">
                        {p.createdAt.replace("T", " ").slice(0, 19)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">© 2025 FinTrack | Created by Jemin Pandav</footer>
    </div>
  );
}

export default App;
