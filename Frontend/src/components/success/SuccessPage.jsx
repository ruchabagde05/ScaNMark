import React from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/'); // Replace with your login route
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', position: 'relative' }}>
      <Confetti />
      <h1>Thanks for Signing Up!</h1>
      <p>Your account has been created successfully.</p>
      <button
        style={{
          padding: '10px 20px',
          margin: '20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handleGoToLogin}
      >
        Go to Login
      </button>
    </div>
  );
};

export default SuccessPage;
