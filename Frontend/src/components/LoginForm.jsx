import React from 'react';
import { TextField, styled, CircularProgress, Typography, Button } from '@mui/material';

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

const LoginForm = ({ selectedRole, formData, setFormData, handleLogin, toggleSignUp, loading }) => (
  <>
    {loading && <CircularProgress style={{ margin: '20px auto', display: 'block' }} />}
    {!loading && (
      <>
        {selectedRole === 'student' ? (
          <TextField
            fullWidth
            variant="outlined"
            label="Enter PRN"
            style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
            value={formData.prn}
            onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
          />
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            label="Enter email"
            style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        )}
        <TextField
          fullWidth
          variant="outlined"
          label="Password"
          type="password"
          style={{ marginTop: '20px', backgroundColor: '#d9eae9' }}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <StyledButton fullWidth onClick={handleLogin}>
          Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
        </StyledButton>
        {selectedRole === 'coordinator' && (
          <LinkText onClick={toggleSignUp}>Not registered yet? Create an Account</LinkText>
        )}
      </>
    )}
  </>
);

export default LoginForm;
