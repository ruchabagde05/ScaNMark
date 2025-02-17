// src/services/api.js
const API_BASE_URL = "http://localhost:8085/api";

export const markAttendance = async (signedQrContent, studentPrn, latitude, longitude) => {
  const response = await fetch(`${API_BASE_URL}/attendance/mark-attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedQrContent, studentPrn, latitude, longitude }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to mark attendance");
  }

  return response.json();
};