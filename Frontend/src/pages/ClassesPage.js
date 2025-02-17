import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ClassesPage.css";
import "../styles/datepicker.css";

import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ClassesPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    facultyName: "",
    subjectName: "",
    lectureTime: "",
    facultyCode: "",
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get("http://localhost:8085/api/faculty/get-all-faculties", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        });
        setFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        alert("Could not fetch faculty data. Please try again later.");
      }
    };

    fetchFaculties();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleLecture = async () => {
    const { facultyName, subjectName, lectureTime, facultyCode } = formData;

    if (!facultyName || !subjectName || !lectureTime || !facultyCode) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8085/api/coordinators/schedule-lecture",
        {
          facultyName,
          subjectName,
          lectureTime,
          facultyCode,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );
      alert("Lecture scheduled successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error scheduling lecture:", error);
      alert(
        error.response?.data?.message || "Could not schedule lecture. Please try again."
      );
    }
  };

  const handleOpenDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  const handleCloseDatePicker = () => {
    setIsDatePickerOpen(false);
  };

  const handleConfirmDate = () => {
    setFormData((prev) => ({
      ...prev,
      lectureTime: selectedDate.toISOString(),
    }));
    setIsDatePickerOpen(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Schedule Lecture</h2>
      <form>
        {/* Faculty Name */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Faculty Name</InputLabel>
          <Select
            name="facultyName"
            value={formData.facultyName}
            onChange={handleInputChange}
          >
            {facultyList.map((faculty) => (
              <MenuItem key={faculty.facultyCode} value={faculty.name}>
                {faculty.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Subject Name */}
        <TextField
          name="subjectName"
          label="Subject Name"
          value={formData.subjectName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />

        {/* Lecture Time */}
        <TextField
          name="lectureTime"
          label="Lecture Time"
          value={formData.lectureTime ? new Date(formData.lectureTime).toLocaleString() : ""}
          onClick={handleOpenDatePicker}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />

        {/* Faculty Code */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Faculty Code</InputLabel>
          <Select
            name="facultyCode"
            value={formData.facultyCode}
            onChange={handleInputChange}
          >
            {facultyList.map((faculty) => (
              <MenuItem key={faculty.facultyCode} value={faculty.facultyCode}>
                {faculty.facultyCode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Submit Button */}
        <Button
  variant="contained"
  style={{ backgroundColor: "#00ADB5", color: "#FFFFFF", marginTop: "20px" }}
  onClick={handleScheduleLecture}
  fullWidth
>
  Schedule Lecture
</Button>

      </form>

      {/* Date Picker Dialog */}
      <Dialog open={isDatePickerOpen} onClose={handleCloseDatePicker} maxWidth="sm" fullWidth>
        <DialogTitle style={{ textAlign: "center", fontWeight: "bold" }}>
          Select Lecture Time
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="subtitle1" gutterBottom>
              Choose Date & Time
            </Typography>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
            />
          </Box>
        </DialogContent>
        <DialogActions>
        <Button
  onClick={handleCloseDatePicker}
  variant="outlined"
  style={{ borderColor: "#00ADB5", color: "#00ADB5" }}
>
  Cancel
</Button>
<Button
  onClick={handleConfirmDate}
  variant="contained"
  style={{ backgroundColor: "#00ADB5", color: "#FFFFFF" }}
>
  OK
</Button>

        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClassesPage;
