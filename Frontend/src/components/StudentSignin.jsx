// import { useState } from 'react';
// import {
//   Box,
//   Button,
//   TextField,
//   styled,
//   Typography,
//   CircularProgress,
//   Grid,
//   useMediaQuery,
// } from '@mui/material';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Container = styled(Box)`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   min-height: 100vh;
//   padding: 20px;
// `;

// const LoginForm = styled(Box)`
//   background: #f2f5f9;
//   padding: 30px 40px;
//   border-radius: 8px;
//   max-width: 400px;
//   width: 100%;
//   text-align: center;
// `;

// const StyledButton = styled(Button)`
//   text-transform: none;
//   background: #f1603d;
//   color: #fff;
//   height: 48px;
//   border-radius: 4px;
//   margin-top: 20px;
// `;

// const StudentSignin = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
//   const [otpStep, setOtpStep] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({ email: '', password: '', otp: '' });

//   const validateForm = () => {
//     let valid = true;
//     let errorMessages = { email: '', password: '', otp: '' };

//     if (!formData.email) {
//       errorMessages.email = 'Email is required';
//       valid = false;
//     }
//     if (!formData.password) {
//       errorMessages.password = 'Password is required';
//       valid = false;
//     }
//     if (otpStep && !formData.otp) {
//       errorMessages.otp = 'OTP is required';
//       valid = false;
//     }

//     setErrors(errorMessages);
//     return valid;
//   };

//   const handleStudentLogin = async () => {
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:8085/api/students/signin', {
//         email: formData.email,
//         password: formData.password,
//       });
  
//       // Log the response to inspect its content
//       console.log('Login response:', response.data);
  
//       // Check if OTP is required
//       if (response.data.message.includes("OTP sent please verify")) {
//         setOtpStep(true);  // Show OTP input form
//       } else {
//         // No OTP needed, proceed to dashboard
//         localStorage.setItem('token', response.data.token);
//         navigate('/student-dashboard');
//       }
//     } catch (error) {
//       console.error('Login failed:', error.response?.data || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
  
//   const handleStudentVerifyOtp = async () => {
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:8085/api/students/verify-otp', {
//         email: formData.email,
//         otp: formData.otp,
//       });
  
//       // Check if OTP verification is successful
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         navigate('/student-dashboard');
//       } else {
//         // Handle invalid OTP (if any)
//         alert('Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('OTP verification failed:', error.response?.data || error.message);
//       alert('OTP verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
  
//   return (
//     <Container>
//       <LoginForm>
//         <Typography variant="h5" color="#2c7068" fontWeight="bold" mb={2}>
//           Student Sign In
//         </Typography>
//         {!otpStep ? (
//           <>
//             <TextField
//               fullWidth
//               variant="outlined"
//               label="Enter email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               error={!!errors.email}
//               helperText={errors.email}
//               sx={{ mb: 2 }}
//             />
//             <TextField
//               fullWidth
//               variant="outlined"
//               label="Password"
//               type="password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               error={!!errors.password}
//               helperText={errors.password}
//               sx={{ mb: 2 }}
//             />
//             <StyledButton fullWidth onClick={handleStudentLogin} disabled={loading}>
//               {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
//             </StyledButton>
//           </>
//         ) : (
//           <>
//             <TextField
//               fullWidth
//               variant="outlined"
//               label="Enter OTP"
//               value={formData.otp}
//               onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
//               error={!!errors.otp}
//               helperText={errors.otp}
//               sx={{ mb: 2 }}
//             />
//             <StyledButton fullWidth onClick={handleStudentVerifyOtp} disabled={loading}>
//               {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
//             </StyledButton>
//           </>
//         )}
//       </LoginForm>
//     </Container>
//   );
// };

// export default StudentSignin;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentSignin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8085/api/students/signin", formData);

      console.log("Login response:", response.data);

      if (response.data.message.includes("Student not verified yet")) {
        alert("OTP sent. Please verify.");
        navigate("/verify-otp");
      } else if (response.data.token) {
        localStorage.setItem("studentToken", response.data.token); // Store token
        alert("Login successful!");
        navigate("/student-dashboard"); // Redirect to dashboard
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Student Sign-In</h2>
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
};

export default StudentSignin;
