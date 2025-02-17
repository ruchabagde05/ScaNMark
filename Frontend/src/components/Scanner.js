// src/components/Scanner.js
import React, { useEffect, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button, Typography, Box } from "@mui/material";

const Scanner = ({ onScan, onError }) => {
  const [qrResult, setQrResult] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [videoStream, setVideoStream] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    setScanner(codeReader);

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setVideoStream(stream);

      scanner.decodeFromVideoDevice(null, "video", (result, error) => {
        if (result) {
          setQrResult(result.text);
          onScan(result.text); // Pass the scanned result to the parent component
        }
        if (error instanceof NotFoundException) {
          console.log("No QR code found");
        }
      });
    } catch (error) {
      onError("Unable to access the camera. Please check your permissions.");
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <video id="video" style={{ width: "100%", maxWidth: "400px", border: "1px solid #ccc", borderRadius: "8px" }} />
      <Button variant="contained" color="primary" onClick={startScanner} sx={{ mt: 2 }}>
        Start Scanner
      </Button>
      {qrResult && <Typography sx={{ mt: 2 }}>Scanned QR Code: {qrResult}</Typography>}
    </Box>
  );
};

export default Scanner;