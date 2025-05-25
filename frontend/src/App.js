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
import { ErrorBoundary } from 'react-error-boundary';
import Users from './components/Users'; // ✅ default import



function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => window.location.reload()}
>
  <StudentCourseList />
</ErrorBoundary>

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
            <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
