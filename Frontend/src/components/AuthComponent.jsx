import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Container } from "@mui/material";

const AuthComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userKey, setUserKey] = useState(localStorage.getItem("userKey") || "");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8085/api/students/signin", { email, password });
      if (response.data.requiresOtp) {
        setIsOtpSent(true);
      } else {
        localStorage.setItem("token", response.data.token);
        setUserKey(response.data.userKey);
      }
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const response = await axios.post("http://localhost:8085/api/students/verify-otp", { email, otp });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userKey", response.data.userKey);
      setUserKey(response.data.userKey);
      setIsOtpSent(false);
    } catch (error) {
      console.error("OTP Verification Error", error);
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: 50 }}>
      <Typography variant="h5">Student Login</Typography>
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {isOtpSent ? (
        <>
          <TextField
            label="Enter OTP"
            fullWidth
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleOtpVerify}>
            Verify OTP
          </Button>
        </>
      ) : (
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      )}
    </Container>
  );
};

export default AuthComponent;
