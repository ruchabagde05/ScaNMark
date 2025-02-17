import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/sidebar.css";

const Sidebar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <ul className="sidebar-list">
        <li className="sidebar-item" onClick={() => onMenuClick("home")}>
          <i className="bi bi-house-door"></i> <span>Home</span>
        </li>
        <li className="sidebar-item" onClick={() => onMenuClick("classes")}>
          <i className="bi bi-calendar-check"></i> <span>Lectures</span>
        </li>
        <li className="sidebar-item" onClick={() => onMenuClick("students")}>
          <i className="bi bi-people"></i> <span>Attendance Report</span>
        </li>

        <li className="sidebar-item" onClick={() => onMenuClick("studentModifyPage")}>
          <i className="bi bi-pencil-square"></i> <span>Students</span>
        </li>
        <li className="sidebar-item" onClick={() => onMenuClick("facultyModifyPage")}>
          <i className="bi bi-pencil"></i> <span>Faculties</span>
        </li>
      </ul>
      <div className="sidebar-signout" onClick={() =>{
        localStorage.removeItem("studentToken");
        navigate("/")
      }}>
        <i className="bi bi-box-arrow-right"></i> <span>Sign Out</span>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default Sidebar;