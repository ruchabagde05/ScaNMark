import React from 'react';
import { TextField, styled, Typography, Button } from '@mui/material';

const StyledButton = styled(Button)`
  text-transform: none;
  background: #f1603d;
  color: #fff;
  height: 48px;
  border-radius: 4px;
  margin-top: 20px;
`;

const LinkText = styled(Typography)`
  color: #2143c9;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
  cursor: pointer;
`;

const SignupForm = ({
  formData,
  setFormData,
  handleSignup,
  handleVerifyOtp,
  otpStep,
  toggleSignUp,
}) => (
  <>
    {!otpStep ? (
      <>
        <TextField
          fullWidth
          variant="outlined"
          label="Enter name"
          style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Enter email"
          style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Password"
          type="password"
          style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <StyledButton fullWidth onClick={handleSignup}>
          Sign up as Coordinator
        </StyledButton>
        <LinkText onClick={toggleSignUp}>Already have an account? Sign in</LinkText>
      </>
    ) : (
      <>
        <TextField
          fullWidth
          variant="outlined"
          label="Enter OTP"
          style={{ marginTop: '20px' }}
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
        />
        <StyledButton fullWidth onClick={handleVerifyOtp}>
          Verify OTP
        </StyledButton>
        <LinkText onClick={toggleSignUp}>Already have an account? Sign in</LinkText>
      </>
    )}
  </>
);

export default SignupForm;
