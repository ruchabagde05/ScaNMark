import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  styled,
  Typography,
  CircularProgress,

  
  Grid,
  useMediaQuery,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert as MuiAlert,
} from '@mui/material';
import studentIcon from '../../images/student.png';
import facultyIcon from '../../images/faculty.png';
import coordinatorIcon from '../../images/coordinator.png';
import qrImage from '../../images/qr-illustration.jpeg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 12px;
    padding: 10px;
  }
`;

const DialogHeader = styled(DialogTitle)`
  text-align: center;
  color: #2c6556;
  font-weight: bold;
`;

// ... (keep existing styled components)
const Container = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80vh;
  gap: 10px;
  padding: 20px;
  margin-top: 35px;
  flex-wrap: wrap;
`;

const LeftSection = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Title = styled(Typography)`
  font-size: 36px;
  font-weight: bold;
  color: #2c6556;
  margin-bottom: 20px;
  span {
    color: #1b1e1d;
  }
`;

const Image = styled('img')({
  width: '90%',
  maxWidth: '400px',
});

const RightSection = styled(Box)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginForm = styled(Box)`
  background: #f2f5f9;
  padding: 30px 40px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
`;

const RoleSelection = styled(Box)`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

const RoleButton = styled(Button)`
  text-transform: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${(props) => (props.selected ? '#bdd3d2' : '#f2f5f9')};
  color: ${(props) => (props.selected ? '#fff' : '#000')};
  border: 1px solid ${(props) => (props.selected ? '#f2f5f9' : '#f2f5f9')};
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background: #bdd3d2;
    color: #fff;
  }
`;

const RoleIcon = styled('img')({
  width: 40,
  height: 40,
});

const StyledButton = styled(Button)`
  text-transform: none;
  background:rgb(29, 41, 39);
  color: #fff;
  height: 48px;
  border-radius: 4px;
  margin-top: 20px;
  margin-bottom:10px;
`;

const LinkText = styled(Typography)`
  color:rgb(25, 78, 157);
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
  cursor: pointer;
`;

const SignText = styled(Typography)`
  color: #2c7068;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`;

const Login = () => {
  // ... (keep existing state variables)
   const navigate = useNavigate();
  const [account, toggleAccount] = useState('login');
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
    prn: '',
  });
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    // prn: '',
    email: '',
    password: '',
    name: '',
    otp: '',
  });
  const isMobile = useMediaQuery('(max-width:600px)');

  const toggleSignUp = () => {
    toggleAccount(account === 'signup' ? 'login' : 'signup');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    toggleAccount('login');
  };

  // Add new state for alerts
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Enhanced validation function
  const validateForm = () => {
    let valid = true;
    let errorMessages = { email: '', password: '', name: '', otp: '' };

    // Name validation (for signup)
    if (account === 'signup' && !formData.name) {
      errorMessages.name = 'Name is required';
      valid = false;
    } else if (account === 'signup' && formData.name.length < 3) {
      errorMessages.name = 'Name must be at least 3 characters';
      valid = false;
    }

    // Email validation
    if (!formData.email) {
      errorMessages.email = 'Email is required';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errorMessages.email = 'Invalid email format';
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      errorMessages.password = 'Password is required';
      valid = false;
    } 

    // OTP validation
    if (otpStep && !formData.otp) {
      errorMessages.otp = 'OTP is required';
      valid = false;
    } else if (otpStep && !/^\d{6}$/.test(formData.otp)) {
      errorMessages.otp = 'OTP must be 6 digits';
      valid = false;
    }

    setErrors(errorMessages);
    return valid;
  };

  // Enhanced handlers with better alerts
  const handleStudentLogin = async () => {
    if (!validateForm()) {
      showSnackbar('Please correct the errors in the form', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8085/api/students/signin", formData,
        { headers: { "Content-Type": "application/json" }}
      );

      if (response.data.message.includes("Student not verified yet")) {
        showConfirmDialog(
          'Verification Required',
          'An OTP has been sent to your email. Would you like to verify now?',
          () => navigate("/verify-otp/student")
        );
      } else if (response.data.token) {
        localStorage.setItem("studentToken", response.data.token);
        showSnackbar('Welcome back! Login successful', 'success');
        setTimeout(() => navigate("/student-dashboard"), 1500);
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for alerts
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  };

  // Update other handlers similarly...

const handleFacultyLogin = async () => {
      if (!validateForm()) {
      showSnackbar('Please correct the errors in the form', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8085/api/faculty/signin", formData);

      console.log("Login response:", response.data);

      if (response.data.message.includes("Faculty not verified yet")) {
        showConfirmDialog(
          'Verification Required',
          'An OTP has been sent to your email. Would you like to verify now?',
          () => navigate("/verify-otp/faculty")
        );
      } else if (response.data.token) {
        localStorage.setItem("studentToken", response.data.token); // Store token
         showSnackbar('Welcome back! Login successful', 'success');
        setTimeout(() => navigate("/Faculty"), 1500);
      } 
	//else {
       // alert("Invalid credentials. Please try again.");
      //}
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };


const handleLogin = async () => {
    if (!validateForm()) {
      showSnackbar('Please correct the errors in the form', 'error');
      return;
    }
    setLoading(true);
    try {
      const loginData =
        // selectedRole === 'student'
        //   ? { prn: formData.prn, password: formData.password }: 
          { email: formData.email, password: formData.password, role: selectedRole };

      const endpoint = "http://localhost:8085/api/coordinators/signin";
      const response = await axios.post(endpoint, loginData);
      localStorage.setItem("studentToken", response.data.token);
      console.log('Login successful:', response.data);
      navigate(`/${selectedRole}`);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

const handleSignup = async () => {
    if (!validateForm()) {
      showSnackbar('Please correct the errors in the form', 'error');
      return;
    }
 setLoading(true);
    try {
      const response = await axios.post('http://localhost:8085/api/coordinators/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      console.log('Signup successful:', response.data);
      const coordinatorId = response.data.id;
      if (coordinatorId) {
        setFormData({ ...formData, coordinatorId });
        setOtpStep(true);
      } else {
        console.error('Coordinator ID missing in signup response');
      }
    } catch (error) {
      showSnackbar('Signup failed:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* ... (existing JSX) ... */}
       <Grid container spacing={isMobile ? 5 : 5}>
        <Grid item xs={12} md={6}>
          <LeftSection>
            <Title>
              ScaN<span>Mark</span>
            </Title>
            <Image src={qrImage} alt="QR Illustration" />
          </LeftSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <RightSection>
            <LoginForm>
              <SignText>
                {account === 'signup' ? 'Create an Account' : 'Sign in to Account'}
              </SignText>

              <RoleSelection>
                <RoleButton
                  selected={selectedRole === 'student'}
                  onClick={() => handleRoleSelect('student')}
                >
                  <RoleIcon src={studentIcon} alt="Student" />
                </RoleButton>
                <RoleButton
                  selected={selectedRole === 'faculty'}
                  onClick={() => handleRoleSelect('faculty')}
                >
                  <RoleIcon src={facultyIcon} alt="Faculty" />
                </RoleButton>
                <RoleButton
                  selected={selectedRole === 'coordinator'}
                  onClick={() => handleRoleSelect('coordinator')}
                >
                  <RoleIcon src={coordinatorIcon} alt="Coordinator" />
                </RoleButton>
              </RoleSelection>

              {loading && <CircularProgress style={{ margin: '20px auto', display: 'block' }} />}

              {!loading && account === 'login' && (
                <>
                  {/* {selectedRole === 'student' ? (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Enter PRN"
                      style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                      value={formData.prn}
                      onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                      error={!!errors.prn}
                      helperText={errors.prn}
                    />) :  */}
                    {/* ( */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Enter email"
                      style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  {/* ) */}
                  {/* } */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Password"
                    type="password"
                    style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                  {/* <StyledButton fullWidth onClick={handleStudentLogin}>
                    Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </StyledButton> */}
                  <StyledButton
                  fullWidth
                  onClick={() => {
                    if (selectedRole === "student") {
                      handleStudentLogin();
                    } else if (selectedRole === "faculty") {
                      handleFacultyLogin();
                    } else if (selectedRole === "coordinator") {
                      handleLogin();
                    }
                  }}
                >
                  Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </StyledButton>
                {/* <LinkText>Forgot Password?</LinkText> */}
                <p>
                <Link to={`/forgot-password/${selectedRole}`}>
                  Forgot Password?
                </Link>
              </p>
                  {selectedRole === 'coordinator' && (
                    <LinkText onClick={toggleSignUp}>
                      Not registered yet? Create an Account
                    </LinkText>
                  )}
                </>
              )}

              {!loading && account === 'signup' && selectedRole === 'coordinator' && (
                !otpStep ? (
                  <>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Enter name"
                      style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Enter email"
                      style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Password"
                      type="password"
                      style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={!!errors.password}
                      helperText={errors.password}
                    />
                    <StyledButton fullWidth onClick={handleSignup}>
                      Sign up as Coordinator
                    </StyledButton>
                    <LinkText onClick={toggleSignUp}>Already have an account? Sign in</LinkText>
                  </>
                ) : (
                  <>
                    {/* <TextField
                      fullWidth
                      variant="outlined"
                      label="Enter OTP"
                      style={{ marginTop: '20px' }}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      error={!!errors.otp}
                      helperText={errors.otp}
                    />
                    <StyledButton fullWidth onClick={handleVerifyOtp}>
                      Verify OTP
                    </StyledButton> */}
                    {navigate("/verify-otp/coordinator")}
                    <LinkText onClick={toggleSignUp}>Already have an account? Sign in</LinkText>
                  </>
                )
              )}
            </LoginForm>
          </RightSection>
        </Grid>
      </Grid>
      {/* Add Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* Add Confirmation Dialog */}
      <StyledDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogHeader>{confirmDialog.title}</DialogHeader>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
            variant="contained"
            style={{ background: '#2c6556' }}
          >
            Proceed
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default Login;