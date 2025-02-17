// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const VerifyOtp = () => {
//   const [formData, setFormData] = useState({ email: "", otp: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleVerifyOtp = async () => {
//     if (!formData.email || !formData.otp) {
//       alert("Please enter both email and OTP.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:8085/api/students/verify-otp", {
//         email: formData.email,
//         otp: formData.otp,
//       });

//       console.log("OTP verification response:", response.data);

//       if (response.data.includes("Student verified successfully")) {
//         alert("OTP verified! Please login.");
//         navigate("/student-signin"); // Redirect to login
//       } else {
//         alert("Invalid OTP. Please try again.");
//       }
//     } catch (error) {
//       console.error("OTP verification failed:", error.response?.data || error.message);
//       alert(error.response?.data?.message || "OTP verification failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Verify OTP</h2>
//       <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
//       <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} />
//       <button onClick={handleVerifyOtp} disabled={loading}>
//         {loading ? "Verifying..." : "Verify OTP"}
//       </button>
//     </div>
//   );
// };

// export default VerifyOtp;

import React, { useState ,useEffect} from "react";
import axios from "axios";
import { useNavigate,useParams} from "react-router-dom";

const VerifyOtp = () => {
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");
  const navigate = useNavigate();
  const { role } = useParams();


  const roleEndpoints = {
    student: "http://localhost:8085/api/students/verify-otp",
    faculty: "http://localhost:8085/api/faculty/verify-otp",
    coordinator: "http://localhost:8085/api/coordinators/verify-otp"
  };

  const roleLabels = {
    student: "Student",
    faculty: "Faculty",
    coordinator: "Coordinator"
  };

  useEffect(() => {
    // Set user type from URL parameter, default to student if invalid
    if (role && Object.keys(roleEndpoints).includes(role.toLowerCase())) {
      setUserType(role.toLowerCase());
    } else {
      setUserType("student");
    }
  }, [role]);

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
      // const response = await axios.post("http://localhost:8085/api/students/verify-otp", {
      //   email: formData.email,
      //   otp: formData.otp,
      // });

      // console.log("OTP verification response:", response.data);

      // if (response.data.includes("Student verified successfully")) {
      //   alert("OTP verified! Please login.");
      //   navigate("/");
      // } else {
      //   alert("Invalid OTP. Please try again.");
      // }
      const endpoint = roleEndpoints[userType];

      const response = await axios.post(endpoint, {
        email: formData.email,
        otp: formData.otp,
      });

      console.log("OTP verification response:", response.data);

      if (response.data.includes(`${roleLabels[userType]} verified successfully`)) {
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
          style={{ backgroundColor: "#183f38", color: "white", fontWeight: "bold",borderColor: "#2ecc71" }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
