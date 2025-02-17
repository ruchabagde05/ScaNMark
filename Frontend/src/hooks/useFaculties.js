import { useState, useEffect } from "react";
import axios from "axios";

const useFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8085/api/faculty/get-all-faculties", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
        },
      });
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      alert(`Error fetching faculties: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  return { faculties, fetchFaculties, loading };
};

export default useFaculties;