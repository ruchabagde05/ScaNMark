
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Button, Select, MenuItem, Card, CardContent, CircularProgress 
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import QrCodeIcon from '@mui/icons-material/QrCode';
//import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas
import '../styles/faculty_styles.css';
import { format } from "date-fns";

const API_BASE_URL = "http://localhost:8085";

const FacultyDashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [timer, setTimer] = useState(60);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCount, setQrCount] = useState(0);
  const [qrExpired, setQrExpired] = useState(false);  // Track QR Code expiration
  const navigate = useNavigate();
  const token = localStorage.getItem("studentToken"); // Replace with actual token
  const [qrShownCount, setQrShownCount] = useState(0); // Track how many times QR is displayed


  const fetchFacultyDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, "Content-Type": 'application/json' },
      });
      if (response.ok) {
        setFaculty(await response.json());
      }
    } catch (error) {
      console.error('Error fetching faculty details:', error);
    }
  }, [token]);

  const fetchLectures = useCallback(async () => {
    if (!faculty) return;

    try {
      const facultyName = encodeURIComponent(faculty.name);
      const response = await fetch(`${API_BASE_URL}/api/lecture/lectures?facultyName=${facultyName}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, "Content-Type": 'application/json' },
      });

      const textResponse = await response.text();
      console.log('Raw API Response:', textResponse);

      try {
        const data = JSON.parse(textResponse);
        console.log('Parsed API Response:', data);
        if (response.ok) {
          setLectures(data);
        } else {
          console.error('API Error:', data);
        }
      } catch (jsonError) {
        console.error('Response is not valid JSON:', jsonError);
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  }, [token, faculty]);

  useEffect(() => {
    fetchFacultyDetails();
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const generateQRCode = async () => {
    if (!selectedLecture || qrCount >= 2) return;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Machine Location:", latitude, longitude);

        try {
          const response = await fetch(`${API_BASE_URL}/api/faculty/generate-qr?lectureId=${selectedLecture}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
          });

          const textResponse = await response.text();
          console.log('Raw API Response:', textResponse);

          try {
            const data = JSON.parse(textResponse);
            if (response.ok && data.qrCode) {
              //setQrCode(data.qrCode); // QR Code will now be a text string
		setQrCode(`data:image/png;base64,${data.qrCode}`);
              setTimer(60);
              setQrExpired(false); 
setTimer(60);
setQrCount((prev) => prev + 1);
 // Reset expiration state
              setQrCount(prev => prev + 1);
            } else if (response.status === 409) {
              console.warn('QR Code already exists. Fetching the latest QR code...');
              await showQRCodeAgain();
            } else {
              console.error('Error:', data.error || 'Unknown error');
            }
          } catch (jsonError) {
            console.error('Response is not valid JSON:', textResponse);
          }
        } catch (error) {
          console.error('Error generating QR Code:', error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  const formatLectureTime = (lectureTime) => {
    if (!lectureTime) return "Invalid Date";
  
    try {
      const date = new Date(lectureTime);
      return format(date, "EEEE, MMM dd - hh:mm a"); // Example: "Monday, Feb 10 - 10:30 AM"
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const showQRCodeAgain = async () => {
    if (qrShownCount >= 2) return; // Stop after 2 times
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/show-qr-again/${selectedLecture}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, "Content-Type": 'application/json' },
      });
  
      const data = await response.json();
  
      if (response.ok && data.qrCode) {
        setQrCode(`data:image/png;base64,${data.qrCode}`);
        setTimer(60);
        setQrExpired(false);
        setQrShownCount(qrShownCount + 1);
      } else {
        console.error('Error fetching QR again:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching QR Code again:', error);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/');
  };

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
  
    if (timer > 0 && qrCode && qrShownCount < 2) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      if (qrShownCount < 1) {
        // First expiration → Allow re-showing
        setQrExpired(true);
      } else {
        // Second expiration → QR is permanently expired
        setQrExpired(true);
        setQrCode(null);
      }
      clearInterval(interval);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, qrCode, qrShownCount]);
  
  

  return (
    <Container maxWidth="md" style={{ marginTop: 20, textAlign: 'center' }}>
      <Card raised style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  backgroundColor: "#1e3a8a",  // Dark blue professional theme
  color: "white",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)"
}}>
  <Typography variant="h4" style={{ fontWeight: "bold" }}>
    Faculty Dashboard
  </Typography>
  
  <Button
    variant="contained"
    style={{
      backgroundColor: "#b91c1c", // Dark red professional color
      color: "white",
      fontWeight: "bold",
      textTransform: "uppercase",
      padding: "10px 20px",
      borderRadius: "8px"
    }}
    startIcon={<LogoutIcon />}
    onClick={handleLogout}
  >
    Logout
  </Button>
</Card>


      {loading ? (
        <CircularProgress style={{ marginTop: 20 }} />
      ) : (
        <>
          {faculty && (
  <Card 
    raised
    style={{
      marginTop: 20,
      background: "linear-gradient(to right, #1e3a8a, #1e40af)", 
      color: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
      textAlign: "left",
    }}
  >
    <CardContent>
      <Typography 
        variant="h5" 
        style={{ fontWeight: "bold", marginBottom: 10, textTransform: "uppercase" }}
      >
        {faculty.name}
      </Typography>

      <Typography 
        variant="body1" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          fontSize: "16px", 
          fontWeight: "500",
          marginBottom: 5 
        }}
      >
        <span style={{ fontWeight: "bold", color: "#facc15", marginRight: 8 }}>📌 Department:</span> 
        {faculty.department}
      </Typography>

      <Typography 
        variant="body1" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          fontSize: "16px", 
          fontWeight: "500",
          marginBottom: 5
        }}
      >
        <span style={{ fontWeight: "bold", color: "#f87171", marginRight: 8 }}>📧 Email:</span> 
        {faculty.email}
      </Typography>
    </CardContent>
  </Card>
)}


<Card 
  raised
  style={{
    marginTop: 20,
    background: "linear-gradient(to right, #e0e7ff, #c7d2fe)",  // Light professional gradient
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
  }}
>
  <CardContent>
    <Typography 
      variant="h6" 
      style={{ fontWeight: "bold", color: "#1e3a8a", marginBottom: 10 }}
    >
      Select a Lecture
    </Typography>

    <Select
      fullWidth
      value={selectedLecture}
      onChange={(e) => setSelectedLecture(e.target.value)}
      displayEmpty
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "10px",
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 300,
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          },
        },
      }}
    >
      <MenuItem value="" disabled>
        <em>Select a Lecture</em>
      </MenuItem>
      {lectures.length > 0 ? (
        lectures.map(({ id, subjectName, lectureTime }) => (
          <MenuItem 
            key={id} 
            value={id} 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "flex-start", 
              padding: "12px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "16px", color: "#374151" }}>{subjectName}</span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>{formatLectureTime(lectureTime)}</span>
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No lectures available</MenuItem>
      )}
    </Select>

    <Button 
      variant="contained" 
      color="primary" 
      startIcon={<QrCodeIcon />} 
      onClick={generateQRCode} 
      disabled={!selectedLecture || qrCount >= 2 || qrExpired} 
      style={{ 
        marginTop: 20, 
        fontWeight: "bold", 
        textTransform: "uppercase", 
        padding: "10px 20px", 
        borderRadius: "8px",
      }}
    >
      Generate QR Code
    </Button>
    {qrExpired && qrShownCount < 2 && qrCode && (
  <Button
    variant="contained"
    color="secondary"
    onClick={showQRCodeAgain}
    style={{ marginTop: 20, marginLeft:16 }}
  >
    Show QR Again
  </Button>
)}
  </CardContent>
</Card>


          {qrCode && !qrExpired && (
  <Card 
  style={{
    marginTop: 20,
    padding: 24,
    textAlign: 'center',
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
  }}
>
  <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 12 }}>
    Scan QR Code
  </Typography>

  <div 
    style={{
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 8,
      display: 'inline-block',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}
  >
    <img src={qrCode} alt="QR Code" style={{ width: 280, height: 280 }} />
  </div>

  <Typography 
    variant="body2" 
    style={{ marginTop: 12, color: '#d32f2f', fontWeight: 'bold' }}
  >
    Expires in {timer} seconds
  </Typography>
</Card>


)}

          {qrExpired && (
            <Card style={{ marginTop: 20, textAlign: 'center' }}>
              <Typography variant="h6" color="error">QR Code Expired</Typography>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default FacultyDashboard;

