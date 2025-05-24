import logo from './logo.svg';
import './App.css';
import './index.css';

import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Logout from './components/Logout';
import AdminAddCourseForm from './components/Admin/AdminAddCourseForm';
import AdminCourseList from './components/Admin/AdminCourseList';
import StudentCourseList from './components/Student/StudentCourseList';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/logout" element={<Logout />} />
            <Route path="/studentcourselist" element={<StudentCourseList />} />
           <Route path="/addcourse" element={<AdminAddCourseForm onCourseAdded={(course) => {
  console.log('New course added:', course);
  // Optional: update parent state, navigate, etc.
}} />


} />
           <Route path="/courselist" element={<AdminCourseList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
