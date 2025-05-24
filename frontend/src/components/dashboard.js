import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award, Users, Home, Settings, FileText,
  BarChart2, Clock, User, LogOut, ChevronDown, Menu, X, Plus, BookOpen, Sun, Moon,
  Play, Video, CheckCircle
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminAddCourseForm from "../components/Admin/AdminAddCourseForm";
import ModunoLogo from "../components/ModunoLogo";
import CoursePlayer from "../components/CoursePlayer";

// Reusable UI Components
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
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className || ""}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-4 border-b border-gray-200 dark:border-gray-700">{children}</div>;

const CardTitle = ({ children, className }) => (
  <h3 className={`text-lg font-bold dark:text-white ${className || ""}`}>{children}</h3>
);

const CardDescription = ({ children, className }) => (
  <p className={`text-gray-600 dark:text-gray-300 ${className || ""}`}>{children}</p>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Badge = ({ children, variant }) => {
  let baseClass = "inline-block px-2 py-0.5 rounded-full text-xs font-semibold";
  if (variant === "success") baseClass += " bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200";
  else if (variant === "warning") baseClass += " bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
  else baseClass += " bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  return <span className={baseClass}>{children}</span>;
};

const placeholderThumbnail = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80";

// Student Course List Component
const StudentCourseList = ({ courses, enrollments, user, loading }) => {
  const [enrolling, setEnrolling] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleEnroll = async (courseId) => {
    if (!user) return;
    if (isEnrolled(courseId)) return;

    setEnrolling(courseId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:1111/api/v1/enrollments/create`,
        { userId: user._id, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // You'll need to update the parent component's enrollments state here
      // This would be better handled through a callback or context
    } catch (error) {
      console.error("Enrollment failed", error);
      toast.error("Failed to enroll in course");
    }
    setEnrolling(null);
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

  if (selectedCourse) {
    const enrollment = getEnrollment(selectedCourse._id);
    return (
      <CoursePlayer
        course={selectedCourse}
        enrollment={enrollment}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <>
      <section>
        <h2 className="mb-6 text-2xl font-semibold dark:text-white">My Enrolled Courses</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You have not enrolled in any courses yet.</p>
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
                      <CardTitle className="text-xl line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <Badge variant={enrollment?.progress?.isCompleted ? "success" : "warning"}>
                        {enrollment?.progress?.isCompleted ? "Completed" : "Enrolled"}
                      </Badge>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      {enrollment?.progress?.isCompleted && (
                        <div className="flex items-center mt-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Course Completed!</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {enrollment?.progress?.completedVideos?.length === 0
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
        <h2 className="mb-6 text-2xl font-semibold dark:text-white">Available Courses</h2>
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
                      <CardTitle className="text-xl line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
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
  );
};

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  return (
    <div className={`rounded-xl shadow bg-gradient-to-br ${color} dark:bg-gray-800 p-6 flex items-center`}>
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg p-2 shadow">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ to, icon, label, active, mobile, onClick }) {
  const base = "group flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-150";
  const activeClasses = "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow";
  const inactive = "text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:dark:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-200";
  return (
    <Link
      to={to}
      className={`${base} ${active ? activeClasses : inactive} ${mobile ? "text-base" : "text-sm"}`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}

// Main Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const profileBtnRef = useRef();

  const navigate = useNavigate();

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Load user data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    fetchDashboardData(userData.role, userData._id);
  }, [navigate]);

  // Profile dropdown click outside handler
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handler = (e) => {
      if (profileBtnRef.current && !profileBtnRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileDropdownOpen]);

  // Fetch dashboard data
  const fetchDashboardData = async (role, userId) => {
    setLoading(true);
    try {
      if (role === "admin") {
        const [statsRes, coursesRes] = await Promise.all([
          axios.get("/api/v1/dashboard/admin/stats"),
          axios.get("/api/v1/courses"),
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data.data);
      } else {
        const [statsRes, myCoursesRes, enrollmentsRes] = await Promise.all([
          axios.get(`http://localhost:1111/api/v1/dashboard/student/stats/${userId}`),
          axios.get(`http://localhost:1111/api/v1/courses/user/${userId}`),
          axios.get(`http://localhost:1111/api/v1/enrollments/user/${userId}`),
        ]);
        setStats(statsRes.data);
        setCourses(myCoursesRes.data.data);
        setEnrollments(enrollmentsRes.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCourseAdded = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) fetchDashboardData(userData.role, userData._id);
    setShowAddCourseModal(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-b-4 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-indigo-400"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center h-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 shadow space-x-4">
          <ModunoLogo size={48} />
          
        </div>
        <nav className="flex flex-col flex-grow pt-8 px-3 space-y-2">
          <SidebarLink to="/dashboard" icon={<Home />} label="Dashboard" active />
          <SidebarLink to={isAdmin ? "/courselist" : "/studentcourselist" } icon={<BookOpen />} label={isAdmin ? "Courses" : "My Courses"} />
          <SidebarLink to="/progress" icon={<BarChart2 />} label="Progress" />
          {isAdmin && (
            <SidebarLink to="/admin/users" icon={<Users />} label="Manage Users" />
          )}
          <SidebarLink to="/settings" icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white dark:bg-gray-900">
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 space-x-2">
              <ModunoLogo size={32} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Moduno</span>
              <button
                aria-label="Close menu"
                className="ml-auto rounded-md p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-2">
              <SidebarLink to="/dashboard" icon={<Home />} label="Dashboard" mobile onClick={() => setMobileMenuOpen(false)} active />
              <SidebarLink to={isAdmin ? "/courselist" : "/studentcourselist" }icon={<BookOpen />} label={isAdmin ? "Courses" : "My Courses"} mobile onClick={() => setMobileMenuOpen(false)} />
              <SidebarLink to="/progress" icon={<BarChart2 />} label="Progress" mobile onClick={() => setMobileMenuOpen(false)} />
              {isAdmin && (
                <SidebarLink to="/admin/users" icon={<Users />} label="Manage Users" mobile onClick={() => setMobileMenuOpen(false)} />
              )}
              <SidebarLink to="/settings" icon={<Settings />} label="Settings" mobile onClick={() => setMobileMenuOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex justify-center items-center">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-xl w-full p-6">
            <button
              aria-label="Close modal"
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              onClick={() => setShowAddCourseModal(false)}
            >
              <X size={24} />
            </button>
            <AdminAddCourseForm onCourseAdded={handleCourseAdded} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="sticky top-0 z-10 flex h-16 bg-white dark:bg-gray-900 shadow-sm items-center px-4 md:px-8">
          <button
            aria-label="Open menu"
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1"></div>

          {/* Dark Mode Toggle */}
          <button
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((dm) => !dm)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            {darkMode ? (
              <Sun className="text-yellow-500" size={20} />
            ) : (
              <Moon className="text-gray-700 dark:text-gray-300" size={20} />
            )}
          </button>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                className="flex items-center px-4 py-2 rounded-md font-semibold shadow-sm focus:outline-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowAddCourseModal(true)}
              >
                <Plus size={18} className="mr-2" />
                Add Course
              </button>
            )}
            {/* Profile dropdown */}
            <div className="relative" ref={profileBtnRef}>
              <button
                type="button"
                aria-label="Open user menu"
                className="flex items-center rounded-full bg-blue-50 dark:bg-blue-900 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setProfileDropdownOpen((open) => !open)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center text-lg font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="ml-2 text-gray-700 dark:text-gray-200 font-semibold hidden md:inline">{user.name || "User"}</span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500 hidden md:inline" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-100 dark:border-gray-800 z-50 animate-dropdownIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || "User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    tabIndex={0}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="inline-block mr-2 h-4 w-4" />
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main className="flex-1 py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Welcome back, {user.name || "User"} {isAdmin && <span className="text-blue-600">(Admin)</span>}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {isAdmin
                ? "You have admin privileges. Manage users, add courses, and view platform stats."
                : "Track your learning progress and keep leveling up your skills!"}
            </p>

            {/* Show different content based on user role */}
            {isAdmin ? (
              <>
                {/* Admin Dashboard Content */}
                <div className="mb-10 flex flex-wrap gap-4">
                  <button
                    className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-5 rounded-lg shadow transition dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/30"
                    onClick={() => setShowAddCourseModal(true)}
                  >
                    <Plus className="mr-2" size={20} /> Add New Course
                  </button>
                  <Link
                    to="/admin/users"
                    className="flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-5 rounded-lg shadow transition dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-800/30"
                  >
                    <Users className="mr-2" size={20} /> Manage Users
                  </Link>
                  <Link
                    to="/admin/courses"
                    className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 px-5 rounded-lg shadow transition dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/30"
                  >
                    <BookOpen className="mr-2" size={20} /> Manage Courses
                  </Link>
                </div>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-8">
                    <StatCard
                      icon={<Users className="text-blue-600 dark:text-blue-400" size={32} />}
                      title="Total Users"
                      value={stats.totalUsers || 0}
                      color="from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20"
                    />
                    <StatCard
                      icon={<BookOpen className="text-green-600 dark:text-green-400" size={32} />}
                      title="Total Courses"
                      value={courses.length}
                      color="from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20"
                    />
                    <StatCard
                      icon={<FileText className="text-purple-600 dark:text-purple-400" size={32} />}
                      title="New Enrollments"
                      value={stats.newEnrollments || 0}
                      color="from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20"
                    />
                  </div>
                  {courses.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400">No courses to show.</p>
                  )}
                </section>
              </>
            ) : (
              <StudentCourseList 
                courses={courses} 
                enrollments={enrollments} 
                user={user} 
                loading={loading} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;