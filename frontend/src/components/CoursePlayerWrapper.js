import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CoursePlayer from './CoursePlayer';

const CoursePlayerWrapper = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(userData);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`http://localhost:1111/api/v1/courses/${courseId}`, { headers });
        setCourse(courseRes.data);

        const enrollmentRes = await axios.get(`http://localhost:1111/api/v1/enrollments/user/${userData._id}`, { headers });
        const enrolled = enrollmentRes.data.data.find(e => e.courseId === courseId);
        setEnrollment(enrolled || null);
      } catch (err) {
        console.error("Error loading course or enrollment:", err);
        navigate("/studentcourselist");
      }
    };

    fetchData();
  }, [courseId, navigate]);

  if (!course) {
    return <div className="p-8 text-center text-gray-600">Loading course...</div>;
  }

  return (
    <CoursePlayer
      course={course}
      enrollment={enrollment}
      user={user}
      onVideoComplete={() => {}}
      onBack={() => navigate("/studentcourselist")}
    />
  );
};


export default CoursePlayerWrapper;