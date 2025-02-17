import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

const ForgotPassword = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      //const token = 'Bearer ' + localStorage.getItem('studentToken');
      const apiEndpoint = role === 'faculty' 
      ? `http://localhost:8085/api/${role}/forgot-password`
      : `http://localhost:8085/api/${role}s/forgot-password`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //Authorization: token,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        localStorage.setItem("resetEmail", email);
        setTimeout(() => {
          navigate(`/reset-password/${role}`);
        }, 2000);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="card p-4 shadow-lg" style={{ width: "400px", borderRadius: "10px", backgroundColor: "#F2F5F9" }}>
        <h2 className="text-center mb-4" style={{ color: "#166534" }}>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
            />
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <button
            type="submit"
            className="btn w-100"
            disabled={loading}
            style={{ backgroundColor: "#E25C48", color: "white", fontWeight: "bold" }}
          >
            {loading ? "Sending Reset Link..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;


