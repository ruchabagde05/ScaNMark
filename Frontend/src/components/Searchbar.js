import { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import "bootstrap/dist/css/bootstrap.min.css";

const SearchBar = ({ onSearch, onNavigate }) => {
  const [query, setQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("studentToken");

    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8085/api/coordinators/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfileData(response.data); // Axios automatically parses JSON
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary" id="navbar">
        <div className="container-fluid">
          <div className="d-flex align-items-center mx-auto">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile Icon"
              className="rounded-circle me-2"
              style={{ width: "40px", height: "40px", cursor: "pointer" }}
              onClick={() => setShowProfile(!showProfile)}
            />
            <span className="profile_name">{profileData.name}</span>
          </div>
          <div className="d-flex">
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search by PRN"
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-outline-success" type="submit">
                Search
              </button>
            </form>
          </div>
          <div className="ms-auto"></div>
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
