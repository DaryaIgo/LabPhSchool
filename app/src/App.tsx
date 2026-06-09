import { Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Labs from "./pages/Labs";
import LabCategoryPage from "./pages/LabCategoryPage";
import LabWorkPage from "./pages/LabWorkPage";
import AdminProblems from "./pages/admin/AdminProblems";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import TopicManagement from "./pages/admin/TopicManagement";
import VirtualLabManagement from "./pages/admin/VirtualLabManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import AuditLogViewer from "./pages/admin/AuditLogViewer";
import ResourceManagement from "./pages/admin/ResourceManagement";
import LabSubmissions from "./pages/admin/LabSubmissions";
import SubtopicManagement from "./pages/admin/SubtopicManagement";
import JupyterNotebookManagement from "./pages/admin/JupyterNotebookManagement";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#262e33] text-white pt-16">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/category/:slug" element={<LabCategoryPage />} />
        <Route path="/labs/work/:slug" element={<LabWorkPage />} />
        <Route path="/resources" element={<Resources />} />
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin/problems" element={<AdminProblems />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/topics" element={<TopicManagement />} />
        <Route path="/admin/virtual-labs" element={<VirtualLabManagement />} />
        <Route path="/admin/enrollments" element={<EnrollmentManagement />} />
        <Route path="/admin/audit" element={<AuditLogViewer />} />
        <Route path="/admin/resources" element={<ResourceManagement />} />
        <Route path="/admin/lab-submissions" element={<LabSubmissions />} />
        <Route path="/admin/subtopics" element={<SubtopicManagement />} />
        <Route path="/admin/jupyter-notebooks" element={<JupyterNotebookManagement />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
