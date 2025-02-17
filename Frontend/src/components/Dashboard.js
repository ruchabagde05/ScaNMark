import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, Button, Container, Row, Col, Nav } from 'react-bootstrap';
import { BrowserQRCodeReader, NotFoundException } from '@zxing/library';
import Lottie from 'react-lottie-player';
import studentAnimation from '../animations/scan.json';
import AttendanceView from './AttendanceView';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [qrResult, setQrResult] = useState("");
  const [videoStream, setVideoStream] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [studentPrn, setStudentPrn] = useState(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
const [studentName, setStudentName] = useState("");
const [lectureId, setLectureId] = useState(null);
const [attendanceData, setAttendanceData] = useState({
  attendedLectures: 0,
  totalLectures: 0,
  attendancePercentage: 0
});
  const scanner = new BrowserQRCodeReader();

  // useEffect(() => {
  //   fetchStudentPrn();
  //   fetchStudentProfile();
  //   fetchAttendanceData();
  //   return () => {
  //     stopScanner();
  //   };
  // }, []);

  useEffect(() => {
    fetchStudentPrn();
    fetchStudentProfile();
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (studentPrn) {
      fetchAttendanceData();
    }
  }, [studentPrn]);

  const fetchStudentProfile = async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      console.error("❌ No authentication token found");
      return;
    }
    try {
      const response = await fetch("http://localhost:8085/api/students/getName", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch name");
      const sname = await response.text();
      console.log(sname);
      setStudentName(sname);
    } catch (error) {
      console.error("❌ Error fetching name:", error);
    }
  };

  const fetchAttendanceData = async () => {
    //const token = localStorage.getItem("studentToken");
    //if (!token || !studentPrn) return;
  
    try {
      const response = await fetch(`http://localhost:8085/api/students/${studentPrn}/attendance-percentage`, {
        headers: {
          //"Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const attendanceStats = await response.json();
  
      // Update state with attendance data
      setAttendanceData({
        attendedLectures: attendanceStats.attendedLectures,
        totalLectures: attendanceStats.totalLectures,
        attendancePercentage: attendanceStats.attendancePercentage
      });
  
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
    }
  };


  const fetchStudentPrn = async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      console.error("❌ No authentication token found");
      return;
    }
    try {
      const response = await fetch("http://localhost:8085/api/students/get-prn-through-token", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch PRN");
      const prn = await response.json();
      setStudentPrn(prn);
    } catch (error) {
      console.error("❌ Error fetching PRN:", error);
    }
  };


  const startScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera access is not supported in your browser.");
      return;
    }

    try {
      scanner.reset();
      setQrResult("");
      setAttendanceMessage("");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setVideoStream(stream);
      setScannerActive(true);

      scanner.decodeFromVideoDevice(undefined, "video", (result, error) => {
        if (result) {
          console.log("✅ Scanned QR Data:", result.text);
          handleScan(result);
        }
      });
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access the camera.");
    }
  };

  const stopScanner = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    scanner.reset();
    setScannerActive(false);
  };

  const handleScan = async (result) => {
    if (result?.text) {
      setQrResult(result.text);
      stopScanner();

      const qrParts = result.text.split("|");
      if (qrParts.length < 4) {
        setAttendanceMessage("❌ Invalid QR Code");
        return;
      }

      const [lectureId] = qrParts;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const token = localStorage.getItem("studentToken");
            const signResponse = await fetch("http://localhost:8085/api/qr/sign", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                lectureId,
                timestamp: new Date().toISOString(),
                latitude,
                longitude,
                studentPrn
              }),
            });

            if (!signResponse.ok) {
              throw new Error("Failed to get signed QR content");
            }

            const { signedContent } = await signResponse.json();
            await markAttendance(lectureId, signedContent, latitude, longitude, studentPrn);
          } catch (error) {
            console.error("❌ Error:", error);
            setAttendanceMessage("❌ Failed to process QR code");
          }
        },
        (error) => {
          setAttendanceMessage("⚠️ Location access is required to mark attendance.");
        }
      );
    }
  };

  const markAttendance = async (lectureId, signedQrContent, latitude, longitude, studentPrn) => {
    const token = localStorage.getItem("studentToken");
    if (!token || !studentPrn) {
      setAttendanceMessage("❌ Authentication error. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8085/api/attendance/mark-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId,
          signedQrContent,
          latitude,
          longitude,
          studentPrn,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message.includes("50 meters")) {
          setAttendanceMessage("❌ You are not within 50 meters of the classroom.");
        } else {
          setAttendanceMessage(`❌ Failed: ${data.message || "Unknown error"}`);
        }
        return;
      }
      setAttendanceMessage(data.success ? 
        "✅ Attendance marked successfully!" : 
        `❌ Failed: ${data.error || "Unknown error"}`
      );
    } catch (error) {
      setAttendanceMessage("❌ An error occurred while marking attendance.");
    }
  };

  const renderHome = () => (
    <div className="container-fluid py-4">
      <h2 className="mb-4 fw-bold">Welcome, {studentName}</h2>
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-white mb-3">Attended Lectures</h5>
              <h3 className="card-text text-white mb-0 fw-bold">{attendanceData.attendedLectures}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-dark mb-3">Total Lectures</h5>
              <h3 className="card-text text-dark mb-0 fw-bold">
                {attendanceData.totalLectures}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)' }}>
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-dark mb-3">Attended Percentage</h5>
              <h3 className="card-text text-dark mb-0 fw-bold">{attendanceData.attendancePercentage.toFixed(2)}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 shadow-sm border-0" style={{ backgroundColor: '#f8fafd' }}>
        <div className="card-body text-center">
          <AttendanceView studentPrn={studentPrn} />
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    
    <AttendanceView studentPrn={studentPrn} />
  );

  const renderQRScanner = () => (
    <div className="p-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div className="card-body text-center">
              <h4 className="mb-4">Scan QR Code</h4>
              <div className="d-flex flex-column align-items-center">
                <video
                  id="video"
                  className="mb-3"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}
                />
                <button
                  className={`btn ${scannerActive ? 'btn-danger' : 'btn-primary'} mb-3`}
                  onClick={scannerActive ? stopScanner : startScanner}
                >
                  {scannerActive ? "Stop Scanner" : "Start Scanner"}
                </button>
                {qrResult && (
                  <p className="mt-3">Scanned QR Code: {qrResult}</p>
                )}
                {attendanceMessage && (
                  <div className={`alert ${attendanceMessage.includes("✅") ? "alert-success" : "alert-danger"} mt-3`}>
                    {attendanceMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  

  const handleLogout = () => {
    // Remove the student token from local storage
    localStorage.removeItem("studentToken");
    
    // Redirect to login page
    window.location.href = "/";
  };


return (
  <div className="d-flex h-100">
    {/* Modern Sidebar */}
    <div 
      className={`bg-dark text-white ${isMenuCollapsed ? 'collapsed' : ''}`}
      style={{ 
        width: isMenuCollapsed ? '80px' : '240px',
        minHeight: '100vh',
        transition: 'width 0.3s ease'
      }}
    >
      <div className="p-3">
        <button 
          className="btn btn-link text-white d-flex align-items-center border-0 text-decoration-none w-100"
          onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
          style={{backgroundColor:'#143864'}}
        >
          <i className={`fas fa-${isMenuCollapsed ? 'bars' : 'times'} me-2`}></i>
          {!isMenuCollapsed && <span className="fw-bold">ScaNMark</span>}
        </button>
        
        <div className="nav flex-column mt-4">
          {[
            { id: 'home', icon: 'home', label: 'Home' },
            { id: 'scanQRCode', icon: 'qrcode', label: 'Scan QR Code' },
          ].map(item => (
            <button 
              key={item.id}
              className={`btn btn-link text-white text-start mb-2 text-decoration-none ${selectedPage === item.id ? 'active' : ''}`}
              onClick={() => setSelectedPage(item.id)}
              style={{
                backgroundColor: selectedPage === item.id ? '#6c757d' : '#143864'
              }}
            >
              <i className={`fas fa-${item.icon} me-2`}></i>
              {!isMenuCollapsed && item.label}
            </button>
          ))}
          <button 
            className="btn btn-link text-white text-start mb-2 text-decoration-none"
            onClick={handleLogout}
            style={{backgroundColor:'#143864'}}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            {!isMenuCollapsed && 'Logout'}
          </button>
        </div>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-grow-1 bg-light">
      {selectedPage === 'home' && renderHome()}
      {selectedPage === 'scanQRCode' && renderQRScanner()}
      {selectedPage === 'viewAttendance' && renderAttendance()}
    </div>
  </div>
);
};

export default Dashboard;