
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ResetPassword = () => {
//    const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     otp: '',
//     newPassword: '',
//     confirmPassword: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const validateForm = () => {
//     if (formData.newPassword.length < 8) {
//       setError('Password must be at least 8 characters long');
//       return false;
//     }
//     if (formData.newPassword !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     setMessage('');
//     setError('');

//     try {
//       const token = 'Bearer ' + localStorage.getItem('studentToken');
//       console.log("token",token);
//       const response = await fetch('http://localhost:8085/api/students/reset-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token
//         },
//         body: JSON.stringify({
//           otp: formData.otp,
//           newPassword: formData.newPassword
//         }),
//       });

//       const data = await response.text();

//       if (response.ok) {
//         setMessage('Password reset successful! You can now login with your new password.');
//         setFormData({
//           otp: '',
//           newPassword: '',
//           confirmPassword: ''
//         });
//         navigate('/');
//       } else {
//         setError(data || 'Failed to reset password');
//       }
//     } catch (err) {
//       setError('An error occurred. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
//       <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
//         <div>
//           <h2 className="text-center text-2xl font-bold text-gray-900">
//             Reset Password
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
//               Enter OTP
//             </label>
//             <input
//               id="otp"
//               name="otp"
//               type="text"
//               value={formData.otp}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter OTP from email"
//             />
//           </div>

//           <div>
//             <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
//               New Password
//             </label>
//             <input
//               id="newPassword"
//               name="newPassword"
//               type={showPassword ? "text" : "password"}
//               value={formData.newPassword}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter new password"
//             />
//           </div>

//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//               Confirm Password
//             </label>
//             <input
//               id="confirmPassword"
//               name="confirmPassword"
//               type={showPassword ? "text" : "password"}
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Confirm new password"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               id="show-password"
//               type="checkbox"
//               checked={showPassword}
//               onChange={() => setShowPassword(!showPassword)}
//               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//             />
//             <label htmlFor="show-password" className="ml-2 block text-sm text-gray-900">
//               Show password
//             </label>
//           </div>

//           {message && (
//             <div className="p-4 rounded-md bg-green-50 text-green-800">
//               {message}
//             </div>
//           )}

//           {error && (
//             <div className="p-4 rounded-md bg-red-50 text-red-800">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? 'Resetting Password...' : 'Reset Password'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
   const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // const token = 'Bearer ' + localStorage.getItem('studentToken');
      // console.log("token",token);
      console.log('Attempting password reset:', {
        email: localStorage.getItem('resetEmail'),
        role: role
      });
      const apiEndpoint = role === 'faculty' 
      ? `http://localhost:8085/api/${role}/reset-password`
      : `http://localhost:8085/api/${role}s/reset-password`;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //Authorization: token,
        },
        body: JSON.stringify({
          email: localStorage.getItem('resetEmail'),
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.text();

      if (response.ok) {
        setMessage('Password reset successful! You can now log in with your new password.');
        setFormData({ otp: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="card p-4 shadow-lg" style={{ width: "400px", borderRadius: "10px", backgroundColor: "#F2F5F9" }}>
        <h2 className="text-center mb-4" style={{ color: "#166534" }}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="otp" className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>Enter OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter OTP from email"
              style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter new password"
              style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: "bold", color: "#166534" }}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Confirm new password"
              style={{ backgroundColor: "#E3F2FD", borderColor: "#B0BEC5" }}
            />
          </div>

          <div className="mb-3 d-flex align-items-center">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="form-check-input"
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="show-password" className="form-check-label" style={{ color: "#166534" }}>Show password</label>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <button
            type="submit"
            className="btn w-100"
            disabled={loading}
            style={{ backgroundColor: "#E25C48", color: "white", fontWeight: "bold" }}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
