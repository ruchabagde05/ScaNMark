import React,{useState,useEffect} from "react";
import "../styles/adminstyle.css";

const AdminProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:8085/api/coordinators/profile",
          {
            method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);
  
  return (
    <div className="admin-profile">
      <h2 className="profile-title">Admin Profile</h2>
      <div className="profile-details">
        <p>
          <span className="profile-label">Name:</span>  
          <span className="admin-profile-name"> {profileData.name}</span>  
        </p>
        <p>
          <span className="profile-label">Role:</span> CO-ORDINATOR
        </p>
        <p>
          <span className="profile-label">Course:</span> PG-DAC, PG-VLSI
        </p>
        <p>
          <span className="profile-label">Email:</span> {profileData.email}
        </p>
      </div>
    </div>
  );
};

export default AdminProfile;