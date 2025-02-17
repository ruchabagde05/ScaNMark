import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, Button, Container, Row, Col, Nav } from 'react-bootstrap';
import { BrowserQRCodeReader, NotFoundException } from '@zxing/library';
import Lottie from 'react-lottie-player';
import studentAnimation from '../animations/scan.json';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ studentName = "Nisha Patil", attendanceData = { total: 0, present: 0, subjects: [] } }) => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [qrResult, setQrResult] = useState("");
  const [videoStream, setVideoStream] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [studentPrn, setStudentPrn] = useState(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const scanner = new BrowserQRCodeReader();

  useEffect(() => {
    fetchStudentPrn();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchStudentPrn = async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      console.error("❌ No authentication token found");
      return;
    }
    try {
      const response = await fetch("http://localhost:8081/api/students/getPrn", {
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
            const signResponse = await fetch("http://localhost:8081/api/qr/sign", {
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
      const response = await fetch("http://localhost:8081/api/attendance/mark-attendance", {
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
      setAttendanceMessage(data.success ? 
        "✅ Attendance marked successfully!" : 
        `❌ Failed: ${data.error || "Unknown error"}`
      );
    } catch (error) {
      setAttendanceMessage("❌ An error occurred while marking attendance.");
    }
  };

  const renderHome = () => (
    <div className="p-4">
      <h2 className="mb-4">Welcome, {studentName}</h2>
      <div className="row g-4 mb-4">
        {/* Stats Cards Row */}
        <div className="col-md-4">
          <div className="card h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div className="card-body">
              <h5 className="card-title text-muted">Total Attendance</h5>
              <h3 className="card-text text-primary">{attendanceData.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div className="card-body">
              <h5 className="card-title text-muted">Present Percentage</h5>
              <h3 className="card-text text-success">
                {((attendanceData.present / attendanceData.total) * 100 || 0).toFixed(2)}%
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div className="card-body">
              <h5 className="card-title text-muted">Total Subjects</h5>
              <h3 className="card-text text-info">{attendanceData.subjects?.length || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Card */}
      <div className="card mt-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <div className="card-body text-center">
          <Lottie
            loop
            animationData={studentAnimation}
            play
            style={{ width: '300px', height: '300px', margin: '0 auto' }}
          />
        </div>
      </div>
    </div>
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

  const renderAttendance = () => (
    <div className="p-4">
      <h4 className="mb-4">Attendance Details</h4>
      <div className="row g-4">
        {attendanceData.subjects?.map((subject, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <div className="card h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div className="card-body">
                <h5 className="card-title mb-4">{subject.name}</h5>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: subject.present },
                        { name: 'Absent', value: subject.total - subject.present }
                      ]}
                      dataKey="value"
                      outerRadius={80}
                      innerRadius={50}
                    >
                      <Cell fill="#28a745" />
                      <Cell fill="#dc3545" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3">
                  <p className="mb-2">Total Classes: {subject.total}</p>
                  <p className="mb-2">Present: {subject.present}</p>
                  <p className="mb-0 text-success fw-bold">
                    Attendance: {((subject.present / subject.total) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className="sidebar bg-dark"
        style={{ 
          width: isMenuCollapsed ? '80px' : '240px',
          minHeight: '100vh',
          transition: 'width 0.3s ease'
        }}
      >
        <div className="p-3">
          <button 
            className="btn btn-link text-white d-flex align-items-center border-0"
            onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            style={{ textDecoration: 'none' }}
          >
            <i className={`fas fa-${isMenuCollapsed ? 'bars' : 'times'} me-2`}></i>
            {!isMenuCollapsed && <span>ScaNMark</span>}
          </button>
          
          <div className="nav flex-column mt-4">
            <button 
              className={`btn btn-link text-white text-start mb-2 ${selectedPage === 'home' ? 'active' : ''}`}
              onClick={() => setSelectedPage('home')}
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-home me-2"></i>
              {!isMenuCollapsed && 'Home'}
            </button>
            <button 
              className={`btn btn-link text-white text-start mb-2 ${selectedPage === 'scanQRCode' ? 'active' : ''}`}
              onClick={() => setSelectedPage('scanQRCode')}
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-qrcode me-2"></i>
              {!isMenuCollapsed && 'Scan QR Code'}
            </button>
            <button 
              className={`btn btn-link text-white text-start mb-2 ${selectedPage === 'viewAttendance' ? 'active' : ''}`}
              onClick={() => setSelectedPage('viewAttendance')}
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-chart-pie me-2"></i>
              {!isMenuCollapsed && 'View Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-white">
        {selectedPage === 'home' && renderHome()}
        {selectedPage === 'scanQRCode' && renderQRScanner()}
        {selectedPage === 'viewAttendance' && renderAttendance()}
      </div>
    </div>
  );
};

export default Dashboard;