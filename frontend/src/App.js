import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './App.css';
import './index.css';

import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/dashboard';
import Logout from './components/Logout';
import AdminAddCourseForm from './components/Admin/AdminAddCourseForm';
import AdminCourseList from './components/Admin/AdminCourseList';
import StudentCourseList from './components/Student/StudentCourseList';
import Users from './components/Users';
import Profile from './components/profile';
import Settings from './components/settings';
import Home from './components/Home';
import CoursePlayerWrapper from './components/CoursePlayerWrapper';

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<Home />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/studentcourselist"
            element={
              <PrivateRoute>
                <StudentCourseList />
              </PrivateRoute>
            }
          />
          <Route
            path="/addcourse"
            element={
              <PrivateRoute>
                <AdminAddCourseForm
                  onCourseAdded={(course) => {
                    console.log('New course added:', course);
                  }}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/courselist"
            element={
              <PrivateRoute>
                <AdminCourseList />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <CoursePlayerWrapper />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/course/manage/:courseId"
            element={
              <PrivateRoute>
                <AdminCourseList />
              </PrivateRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
