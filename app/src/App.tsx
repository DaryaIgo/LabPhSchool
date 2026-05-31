import { Routes, Route } from "react-router";
import Header from "./components/Header";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Labs from "./pages/Labs";
import LabDetail from "./pages/LabDetail";
import OhmsLawLab from "./pages/OhmsLawLab";
import ProjectileLab from "./pages/ProjectileLab";
import LabPendulum from "./pages/LabPendulum";
import LabSpringPendulum from "./pages/LabSpringPendulum";
import LabEnergyConservation from "./pages/LabEnergyConservation";
import AdminProblems from "./pages/admin/AdminProblems";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import TopicManagement from "./pages/admin/TopicManagement";
import SubtopicManagement from "./pages/admin/SubtopicManagement";
import LabManagement from "./pages/admin/LabManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import AuditLogViewer from "./pages/admin/AuditLogViewer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#262e33] text-white pt-16">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/ohms-law" element={<OhmsLawLab />} />
        <Route path="/labs/projectile" element={<ProjectileLab />} />
        <Route path="/labs/pendulum" element={<LabPendulum />} />
        <Route path="/labs/spring" element={<LabSpringPendulum />} />
        <Route path="/labs/energy" element={<LabEnergyConservation />} />
        <Route path="/labs/:slug" element={<LabDetail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/about" element={<About />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin/problems" element={<AdminProblems />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/topics" element={<TopicManagement />} />
        <Route path="/admin/subtopics" element={<SubtopicManagement />} />
        <Route path="/admin/labs" element={<LabManagement />} />
        <Route path="/admin/enrollments" element={<EnrollmentManagement />} />
        <Route path="/admin/audit" element={<AuditLogViewer />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
