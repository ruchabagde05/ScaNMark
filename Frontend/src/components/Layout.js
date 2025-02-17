// import React, { useState } from "react";
// import Sidebar from "./Sidebar"
// import SearchBar from "./Searchbar";
// import ClassesPage from "../pages/ClassesPage";
// import FacultyPage from "../pages/FacultyPage";
// import StudentsPage from "../pages/StudentsPage";
// import Home from "../pages/HomePage"
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/adminstyle.css";
// import StudentModifyPage from "../pages/StudentModifyPage";
// import FacultyModifyPage from "../pages/FacultyModifyPage";

// const Layout = () => {
//   const [activePage, setActivePage] = useState("home"); 

//   const renderContent = () => {
//     switch (activePage) {
//       case "classes":
//         return <ClassesPage />;
//       case "students":
//         return <StudentsPage />;
//       case "faculty":
//         return <FacultyPage />;
//       case "home":
//         return <Home />;
//       case "studentModifyPage":
//         return <StudentModifyPage />;
//       case "facultyModifyPage":
//         return <FacultyModifyPage />;
//       default:
//         return <h1>Coming soon...</h1>;
//     }
//   };

//   return (
//     <div className="layout">
//       <div className="sidebar">
//         <Sidebar onMenuClick={setActivePage} />
//       </div>
//       <div className="main-content">
//         <SearchBar
//           onSearch={(query) => console.log(query)}
//           onNavigate={setActivePage} 
//         />
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Layout;



import { useState } from "react"
import Sidebar from "./Sidebar"
import SearchBar from "./Searchbar"
import ClassesPage from "../pages/ClassesPage"
import FacultyPage from "../pages/FacultyPage"
import StudentsPage from "../pages/StudentsPage"
import Home from "../pages/HomePage"
import "bootstrap/dist/css/bootstrap.min.css"
import "../styles/adminstyle.css"
import StudentModifyPage from "../pages/StudentModifyPage"
import FacultyModifyPage from "../pages/FacultyModifyPage"

const Layout = () => {
  const [activePage, setActivePage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query) => {
    setSearchQuery(query)
    setActivePage("students") // Navigate to students page when search is performed
  }

  const renderContent = () => {
    switch (activePage) {
      case "classes":
        return <ClassesPage />
      case "students":
        return <StudentsPage searchQuery={searchQuery} />
      case "faculty":
        return <FacultyPage />
      case "home":
        return <Home />
      case "studentModifyPage":
        return <StudentModifyPage />
      case "facultyModifyPage":
        return <FacultyModifyPage />
      default:
        return <h1>Coming soon...</h1>
    }
  }

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar onMenuClick={setActivePage} />
      </div>
      <div className="main-content">
        <SearchBar onSearch={handleSearch} onNavigate={setActivePage} />
        {renderContent()}
      </div>
    </div>
  )
}

export default Layout

