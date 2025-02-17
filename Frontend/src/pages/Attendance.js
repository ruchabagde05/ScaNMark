// src/pages/Attendance.js
import React, { useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import Scanner from "../components/Scanner";
import { markAttendance } from "../services/api";
import { getLocation } from "../utils/location";

const Attendance = () => {
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleScan = async (signedQrContent) => {
    try {
      const { latitude, longitude } = await getLocation();
      const studentPrn = "240840120101"; // Replace with dynamic PRN if needed

      const response = await markAttendance(signedQrContent, studentPrn, latitude, longitude);
      setAttendanceMessage(response.message || "Attendance marked successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while marking attendance.");
      setOpenSnackbar(true);
    }
  };

  const handleError = (error) => {
    setErrorMessage(error);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>
      <Scanner onScan={handleScan} onError={handleError} />
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={errorMessage ? "error" : "success"}>
          {errorMessage || attendanceMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance;