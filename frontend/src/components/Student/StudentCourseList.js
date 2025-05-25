import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, BookOpen, Clock, Video, CheckCircle, ChevronRight, Loader2, Award, BarChart2, Bookmark, List, X } from "lucide-react";
import CoursePlayer from "../CoursePlayer";

const StudentCourseList = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userJSON || !token) {
      console.warn("No user or token found");
      return;
    }
    
    const userObj = JSON.parse(userJSON);
    if (!userObj?.id) {
      console.warn("User object missing id");
      return;
    }
    setUser(userObj);

    Promise.all([fetchCourses(), fetchEnrollments(userObj.id)])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enrollments.length > 0) {
      const completed = enrollments.filter(e => e.progress?.isCompleted).length;
      setCompletedCoursesCount(completed);
    }
  }, [enrollments]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:1111/api/v1/courses");
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    }
  };

  const fetchEnrollments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get(
        `http://localhost:1111/api/v1/enrollments/user/${userId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      const enrollmentsData = res.data.data || res.data || [];
      setEnrollments(enrollmentsData);
      
    } catch (error) {
      console.error("Fetch enrollments error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setEnrollments([]);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) return;

    setEnrolling(courseId);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.post(
        `http://localhost:1111/api/v1/enrollments/create`,
        { userId: user.id, courseId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await fetchEnrollments(user.id);
      await fetchCourses();
      setActiveTab("enrolled");
      
    } catch (error) {
      console.error("Enrollment error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } finally {
      setEnrolling(null);
    }
  };

  const updateProgress = async (courseId, videoIndex, isCourseComplete = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const enrollment = getEnrollment(courseId);
      if (!enrollment?._id) throw new Error("No enrollment found");

      const update = {
        progress: {
          currentVideoIndex: videoIndex,
          completedVideos: [...new Set([...(enrollment.progress?.completedVideos || []), videoIndex])],
          isCompleted: isCourseComplete
        }
      };

      await axios.put(
        `http://localhost:1111/api/v1/enrollments/${enrollment._id}`,
        update,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEnrollments(user.id);
      
    } catch (error) {
      console.error("Progress update error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => {
      const courseRef = e.course?._id || e.course || e.courseId;
      return courseRef?.toString() === courseId?.toString();
    });
  };

  const getEnrollment = (courseId) => {
    return enrollments.find(e => {
      const courseRef = e.course?._id || e.course || e.courseId;
      return courseRef?.toString() === courseId?.toString();
    });
  };

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
        onVideoComplete={(videoIndex, isComplete) => updateProgress(selectedCourse._id, videoIndex, isComplete)}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const enrolledCourses = enrollments
    .map((enrollment) => {
      if (!enrollment.course) return null;
      const courseId = typeof enrollment.course === "string" ? enrollment.course : enrollment.course._id.toString();
      const course = courses.find(c => c._id.toString() === courseId);
      return course ? { ...course, enrollment } : null;
    })
    .filter(Boolean);

  const availableCourses = courses.filter((course) => !isEnrolled(course._id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Learning Portal</h1>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 py-2 border-t border-gray-200">
            <button
              onClick={() => {
                setActiveTab("enrolled");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                activeTab === "enrolled" ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => {
                setActiveTab("available");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                activeTab === "available" ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Available Courses
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Tabs */}
        <div className="hidden md:block mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("enrolled")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "enrolled"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Courses
                {enrolledCourses.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {enrolledCourses.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("available")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "available"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Available Courses
                {availableCourses.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {availableCourses.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Progress Summary */}
        {activeTab === "enrolled" && enrolledCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-lg font-semibold text-gray-900">Your Learning Progress</h2>
                <p className="text-gray-600">Track your overall course completion</p>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-medium text-gray-700">
                    {completedCoursesCount} of {enrolledCourses.length} courses completed
                  </span>
                  <span className="text-gray-500">
                    {Math.round((completedCoursesCount / enrolledCourses.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(completedCoursesCount / enrolledCourses.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Lists */}
        <div>
          {activeTab === "enrolled" ? (
            enrolledCourses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No enrolled courses</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  You haven't enrolled in any courses yet. Browse available courses to get started.
                </p>
                <button
                  onClick={() => setActiveTab("available")}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Browse Courses <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const progressPercentage = getProgressPercentage(course._id);
                  const isCompleted = course.enrollment?.progress?.isCompleted;
                  
                  return (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80"
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4" />
                            <span className="text-sm font-medium">Start Learning</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>{course.duration}h</span>
                            </div>
                            <div className="flex items-center">
                              <Video className="h-4 w-4 mr-1.5" />
                              <span>{course.videos.length} lessons</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2 text-sm">
                              <span className="font-medium text-gray-700">Your progress</span>
                              <span className="text-gray-500">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            {isCompleted && (
                              <div className="flex items-center mt-2 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                <span className="font-medium">Course completed!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                          <button
                            onClick={() => startCourse(course)}
                            className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isCompleted ? "Review" : progressPercentage > 0 ? "Continue" : "Start"}
                          </button>
                          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-700">
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            availableCourses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Award className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No available courses</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  You've enrolled in all available courses. Check back later for new content.
                </p>
                <button
                  onClick={() => setActiveTab("enrolled")}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  View My Courses <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => {
                  const isEnrollingThis = enrolling === course._id;
                  const isAlreadyEnrolled = isEnrolled(course._id);
                  
                  return (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80"
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">{course.title}</h3>
                        
                        <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>{course.duration}h</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1.5" />
                            <span>{course.videos.length} lessons</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={isEnrollingThis || isAlreadyEnrolled}
                          className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                            isAlreadyEnrolled
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } ${isEnrollingThis || isAlreadyEnrolled ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isEnrollingThis ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : isAlreadyEnrolled ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enrolled
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentCourseList;