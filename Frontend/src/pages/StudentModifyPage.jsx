import { useState, useEffect } from "react";
import axios from "axios";
import TablePagination from "@mui/material/TablePagination";
import "../styles/StudentModifyPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StudentModifyPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ prn: "", name: "", email: "" });
  const [editingPrn, setEditingPrn] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8085/api/students/get-all-students",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );
      setStudents(response.data); // Update the state with the fetched data
    } catch (error) {
      // console.error("Error fetching students:", error);
      toast.error(
        `Error fetching students: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudent = async () => {
    if (!formData.prn || !formData.name || !formData.email) {
      toast.warn("All fields are required!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8085/api/coordinators/add-student",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Student added successfully!");
      fetchStudents(); // Refresh the list
      setFormData({ prn: "", name: "", email: "" }); // Reset form
    } catch (error) {
      toast.error(
        `Error adding student: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleEditStudent = (prn) => {
    const student = students.find((stud) => stud.prn === prn);
    setFormData(student);
    setEditingPrn(prn);
  };

  const handleSaveStudent = async () => {
    try {
      await axios.put(
        `http://localhost:8085/api/coordinators/update-student/${editingPrn}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Student updated successfully!");
      fetchStudents(); // Refresh the list
      setFormData({ prn: "", name: "", email: "" }); // Reset form
      setEditingPrn(null);
    } catch (error) {
      toast.error(
        `Error updating student: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeleteStudent = async (prn) => {
    try {
      await axios.delete(
        `http://localhost:8085/api/coordinators/delete-student/${prn}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );
      toast.success("Student deleted successfully!");
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast.error(
        `Error deleting student: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const clearForm = () => {
    setFormData({ prn: "", name: "", email: "" });
    setEditingPrn(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedStudents = students.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="student-page">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="content">
        <div className="form-card">
          <h2>{editingPrn ? "Edit Student" : "Add Student"}</h2>
          <form>
            <div className="form-group">
              <label>PRN</label>
              <input
                type="text"
                name="prn"
                placeholder="240840120101"
                value={formData.prn}
                onChange={handleInputChange}
                disabled={!!editingPrn}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Alice Johnson"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="alice@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              {editingPrn ? (
                <>
                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSaveStudent}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={handleAddStudent}
                  >
                    Add Student
                  </button>
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
        <div className="list-card">
          <h2>Student List</h2>
          {students.length === 0 ? (
            <p className="no-data">No student records available.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>PRN</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((student) => (
                    <tr key={student.prn}>
                      <td>{student.prn}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditStudent(student.prn)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteStudent(student.prn)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15]}
                component="div"
                count={students.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default StudentModifyPage;
