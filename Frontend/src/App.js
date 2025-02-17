import './App.css';
import Login from './components/account/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Coordinator from './components/Coordinator'; 
import Student from './components/Student';
import SuccessPage from './components/success/SuccessPage';
import StudentSignin from './components/StudentSignin';
import VerifyOtp from './components/VerifyOtp';
import Dashboard from './components/Dashboard';
import VerifyFacultyOtp from './components/VerifyFacultyOtp';
import { CssBaseline, Container } from "@mui/material";
import Attendance from './pages/Attendance';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import "bootstrap/dist/css/bootstrap.min.css";
import VerifyCOtp from './components/VerifyCOtp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Layout from './components/Layout';
import FacultyDashboard from './components/FacultyDashboard';


const App = () => (
 
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/verifyfaculty-otp" element={<VerifyFacultyOtp />} />
      <Route path="/cverify-otp" element={<VerifyCOtp />} />
      <Route path="/coordinator" element={<Layout />} />
      {/* <Route path="/student-dashboard" element={<Dashboard />} /> */}
      <Route path="/Faculty" element={<FacultyDashboard />} />
      <Route path="/success" element={<SuccessPage />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> */}
       <Route path="/forgot-password/:role" element={<ForgotPassword />}/>
      <Route path="/reset-password/:role" element={<ResetPassword />}/>

      {/* <Route path="/sidebar" element={<Sidebar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/attendance" element={<Attendance />} /> */}
    
          <Route path="/student-dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/verify-otp/:role" element={<VerifyOtp />} />
    </Routes>
  </Router>
);

export default App;


