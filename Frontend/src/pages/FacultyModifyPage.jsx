import { useState, useEffect } from "react";
import axios from "axios";
import TablePagination from "@mui/material/TablePagination";
import "../styles/FacultyModifyPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FacultyModifyPage() {
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({
    facultyCode: "",
    name: "",
    email: "",
    dept: "",
  });
  const [editingFacultyCode, setEditingFacultyCode] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8085/api/faculty/get-all-faculties",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast.error(
        `Error fetching faculties: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddFaculty = async () => {
    if (
      !formData.facultyCode ||
      !formData.name ||
      !formData.email ||
      !formData.dept
    ) {
      toast.warn("All fields are required!");
      return;
    }
    try {
      const addFacultyRequest = {
        facultyCode: formData.facultyCode,
        name: formData.name,
        email: formData.email,
        department: formData.dept, // Backend expects "department"
      };

      const response = await axios.post(
        "http://localhost:8085/api/coordinators/add-faculty",
        addFacultyRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Add Faculty Response:", response.data);
      toast.success("Faculty added successfully!");
      fetchFaculties(); // Refresh the list
      setFormData({ facultyCode: "", name: "", email: "", dept: "" }); // Reset form
    } catch (error) {
      toast.error(
        `Error adding faculty: ${
          error.response?.data?.message || error.message
        }`
      );

      const errorMessage =
        error.response?.data || "An unexpected error occurred.";
    }
  };

  const handleEditFaculty = (facultyCode) => {
    const faculty = faculties.find((fac) => fac.facultyCode === facultyCode);
    //setFormData(faculty);
    setFormData({
      facultyCode: faculty.facultyCode,
      name: faculty.name,
      email: faculty.email,
      dept: faculty.department, // Map department to dept
    });
    setEditingFacultyCode(facultyCode);
  };

  const handleSaveFaculty = async () => {
    try {
      const updateFacultyRequest = {
        facultyCode: formData.facultyCode,
        name: formData.name,
        email: formData.email,
        department: formData.dept, // Backend expects "department"
      };

      await axios.put(
        `http://localhost:8085/api/coordinators/update-faculty/${editingFacultyCode}`,
        updateFacultyRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Faculty updated successfully!");
      fetchFaculties(); // Refresh the list
      setFormData({ facultyCode: "", name: "", email: "", dept: "" }); // Reset form
      setEditingFacultyCode(null);
    } catch (error) {
      toast.error(
        `Error updating faculty: ${
          error.response?.data?.message || error.message
        }`
      );
      const errorMessage =
        error.response?.data || "An unexpected error occurred.";
      // alert(`Error updating faculty: ${errorMessage}`);
    }
  };

  const handleDeleteFaculty = async (facultyCode) => {
    try {
      await axios.delete(
        `http://localhost:8085/api/coordinators/delete-faculty/${facultyCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      toast.success("Faculty deleted successfully!");
      fetchFaculties(); // Refresh the list
    } catch (error) {
      // const errorMessage = error.response?.data || "An unexpected error occurred.";
      toast.error(
        `Error deleting faculty: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const clearForm = () => {
    setFormData({ facultyCode: "", name: "", email: "", dept: "" });
    setEditingFacultyCode(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedFaculties = faculties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="faculty-page">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="content">
        <div className="form-card">
          <h2>{editingFacultyCode ? "Edit Faculty" : "Add Faculty"}</h2>
          <form>
            <div className="form-group">
              <label>Faculty Code</label>
              <input
                type="text"
                name="facultyCode"
                placeholder="F012"
                value={formData.facultyCode}
                onChange={handleInputChange}
                disabled={!!editingFacultyCode}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Dr. Jane Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="jane@univ.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="dept"
                placeholder="DAC"
                value={formData.dept}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              {editingFacultyCode ? (
                <>
                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSaveFaculty}
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
                    onClick={handleAddFaculty}
                  >
                    Add Faculty
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
          <h2>Faculty List</h2>
          {faculties.length === 0 ? (
            <p className="no-data">No faculty records available.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Faculty Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFaculties.map((faculty) => (
                    <tr key={faculty.facultyCode}>
                      <td>{faculty.facultyCode}</td>
                      <td>{faculty.name}</td>
                      <td>{faculty.email}</td>
                      <td>{faculty.department}</td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditFaculty(faculty.facultyCode)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteFaculty(faculty.facultyCode)
                          }
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
                count={faculties.length}
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

export default FacultyModifyPage;