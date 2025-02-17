import React from "react";
import { Typography, Box } from "@mui/material";
import Navbar from './../components/Navbar';

const Home = () => {
  return (
    <Box sx={{ p: 3 }}>
        <Navbar/>
      <Typography variant="h4" gutterBottom>
        Welcome to the Attendance System
      </Typography>
      <Typography variant="body1">
        Use the navigation bar to mark your attendance.
      </Typography>
    </Box>
  );
};

export default Home;