import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, BookOpen, Clock, Video, CheckCircle } from "lucide-react";
import CoursePlayer from "../CoursePlayer";

const Button = ({ children, className, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded text-white font-semibold transition focus:outline-none ${
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
    } ${className || ""}`}
  >
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md ${className || ""}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-4 border-b border-gray-200">{children}</div>;
const CardTitle = ({ children, className }) => (
  <h3 className={`text-lg font-bold ${className || ""}`}>{children}</h3>
);
const CardDescription = ({ children, className }) => (
  <p className={`text-gray-600 ${className || ""}`}>{children}</p>
);
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Badge = ({ children, variant }) => {
  let baseClass = "inline-block px-2 py-0.5 rounded-full text-xs font-semibold";
  if (variant === "default") baseClass += " bg-green-200 text-green-800";
  else if (variant === "secondary") baseClass += " bg-yellow-200 text-yellow-800";
  else baseClass += " bg-gray-200 text-gray-800";
  return <span className={baseClass}>{children}</span>;
};

const placeholderThumbnail =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80";

const StudentCourseList = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    if (!userJSON) return;
    const userObj = JSON.parse(userJSON);
    if (!userObj?.id) {
      console.warn("User object missing id");
      return;
    }
    setUser(userObj);

    fetchCourses();
    fetchEnrollments(userObj.id);
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:1111/api/v1/courses");
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        setEnrollments([]);
        return;
      }

      const res = await axios.get(`http://localhost:1111/api/v1/enrollments/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(res.data.data || []);
    } catch (error) {
      console.error("Failed to load enrollments:", error);
      setEnrollments([]);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) return;
    if (enrollments.some((e) => e.courseId.toString() === courseId.toString())) return;

    setEnrolling(courseId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        setEnrolling(null);
        return;
      }

      await axios.post(
        `http://localhost:1111/api/v1/enrollments/create`,
        { userId: user.id, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEnrollments(user.id);
    } catch (error) {
      console.error("Enrollment failed", error);
    }
    setEnrolling(null);
  };

  const updateProgress = async (courseId, videoIndex) => {
    if (!user) return;
    const enrollment = enrollments.find((e) => e.courseId.toString() === courseId.toString());
    if (!enrollment) return;

    const completedVideos = [...(enrollment.progress?.completedVideos || [])];
    if (!completedVideos.includes(videoIndex)) completedVideos.push(videoIndex);

    const course = courses.find((c) => c._id.toString() === courseId.toString());
    const isCompleted = course ? completedVideos.length === course.videos.length : false;
    const currentVideoIndex = isCompleted
      ? course.videos.length - 1
      : Math.min(videoIndex + 1, course.videos.length - 1);

    try {
      await axios.put(
        `http://localhost:1111/api/v1/enrollments/${enrollment._id}`,
        {
          progress: {
            currentVideoIndex,
            completedVideos,
            isCompleted,
          },
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      await fetchEnrollments(user.id);
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  const isEnrolled = (courseId) =>
    enrollments.some((e) => e.courseId.toString() === courseId.toString());

  const getEnrollment = (courseId) =>
    enrollments.find((e) => e.courseId.toString() === courseId.toString());

  const getProgressPercentage = (courseId) => {
    const enrollment = getEnrollment(courseId);
    const course = courses.find((c) => c._id.toString() === courseId.toString());
    if (!enrollment || !course) return 0;
    const completedVideos = enrollment.progress?.completedVideos || [];
    return Math.round((completedVideos.length / course.videos.length) * 100);
  };

  const startCourse = (course) => setSelectedCourse(course);

  if (selectedCourse) {
    const enrollment = getEnrollment(selectedCourse._id);
    return (
      <CoursePlayer
        course={selectedCourse}
        enrollment={enrollment}
        user={user}
        onVideoComplete={(videoIndex) => updateProgress(selectedCourse._id, videoIndex)}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Student Course Portal</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover and enroll in courses to advance your learning journey. Watch videos sequentially and track your
          progress.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700">Loading courses...</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-6 text-3xl font-semibold">My Enrolled Courses</h2>
            {enrollments.length === 0 ? (
              <p className="text-gray-600">You have not enrolled in any courses yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrollments.map((enrollment) => {
                  const course = courses.find(
                    (c) => c._id.toString() === enrollment.courseId.toString()
                  );
                  if (!course) return null;
                  const progressPercentage = getProgressPercentage(course._id);
                  return (
                    <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${placeholderThumbnail})` }}
                      />

                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <Badge variant={enrollment?.progress.isCompleted ? "default" : "secondary"}>
                            {enrollment?.progress.isCompleted ? "Completed" : "Enrolled"}
                          </Badge>
                        </div>

                        <CardDescription className="text-gray-600 line-clamp-3">{course.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.duration}h</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            <span>{course.videos.length} videos</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-500">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          {enrollment?.progress.isCompleted && (
                            <div className="flex items-center mt-2 text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">Course Completed!</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => startCourse(course)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {enrollment?.progress.completedVideos.length === 0
                              ? "Start Course"
                              : "Continue Learning"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-semibold">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses
                .filter((course) => !isEnrolled(course._id))
                .map((course) => {
                  const isEnrollingThis = enrolling === course._id;
                  return (
                    <Card
                      key={course._id}
                      className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${placeholderThumbnail})` }}
                      />

                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                            {course.title}
                          </CardTitle>
                        </div>

                        <CardDescription className="text-gray-600 line-clamp-3">{course.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.duration}h</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            <span>{course.videos.length} videos</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEnroll(course._id)}
                            disabled={isEnrollingThis}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {isEnrollingThis ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Enroll Now
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StudentCourseList;
