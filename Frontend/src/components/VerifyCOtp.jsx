import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyCOtp = () => {
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyOtp = async () => {
    if (!formData.email || !formData.otp) {
      alert("Please enter both email and OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8085/api/coordinators/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      console.log("OTP verification response:", response.data);

      if (response.data.includes("Coordinator verified successfully")) {
        alert("OTP verified! Please login.");
        navigate("/");
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="card p-4 shadow-lg" style={{ width: "400px", borderRadius: "10px", backgroundColor: "#F2F5F9" }}>
        <h2 className="text-center mb-4" style={{ color: "#166534" }}>Verify OTP</h2>
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>OTP</label>
          <input
            type="text"
            className="form-control"
            name="otp"
            placeholder="Enter OTP"
            value={formData.otp}
            onChange={handleChange}
            style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
          />
        </div>
        <button
          className="btn w-100"
          onClick={handleVerifyOtp}
          disabled={loading}
          style={{ backgroundColor: "#E25C48", color: "white", fontWeight: "bold" }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyCOtp;

