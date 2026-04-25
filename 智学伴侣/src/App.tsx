import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import LearningCabin from "./pages/LearningCabin";
import Dashboard from "./pages/Dashboard";
import TaskBoard from "./pages/TaskBoard";
import Schedule from "./pages/Schedule";
import NotesPage from "./pages/Notes";
import NoteDetailPage from "./pages/Notes/NoteDetail";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="learning-cabin" element={<LearningCabin />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="task-board" element={<TaskBoard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:id" element={<NoteDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
