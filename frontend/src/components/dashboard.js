import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Award, TrendingUp, Calendar, Clock,
  Home, Settings, ChevronDown, Menu, X, Plus, Sun, Moon,
  User, LogOut, Play, CheckCircle, BarChart2, Bookmark
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminAddCourseForm from "../components/Admin/AdminAddCourseForm";
import ModunoLogo from "../components/ModunoLogo";

// UI Components
const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };

  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    indigo: "bg-indigo-100"
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <p className={`text-xs mt-2 ${
              change.startsWith('+') ? 'text-green-500' : 'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, isAdmin = false, onClick }) => {
  const progress = course.progress || 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        {progress === 100 && (
          <div className="absolute top-2 right-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center border border-green-100">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-4">by {course.instructor || "Moduno Instructor"}</p>
        
        {!isAdmin && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration || '8'} hours</span>
          </div>
          <button
            onClick={onClick}
            className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              isAdmin 
                ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Play className="h-4 w-4 mr-2" />
            {isAdmin ? 'Manage' : progress > 0 ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    newEnrollments: 0,
    revenue: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    studyHours: 0,
    certificates: 0
  });
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const profileBtnRef = useRef();

  const navigate = useNavigate();

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

  const fetchDashboardData = async (role, userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (role === "admin") {
        const [statsRes, coursesRes, upcomingRes] = await Promise.all([
          axios.get("http://localhost:1111/api/v1/dashboard/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:1111/api/v1/courses", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:1111/api/v1/classes/upcoming", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setStats(statsRes.data);
        setCourses(coursesRes.data.data || []);
        setUpcomingClasses(upcomingRes.data.data || []);
      } else {
        const [statsRes, coursesRes, enrollmentsRes, upcomingRes] = await Promise.all([
          axios.get(`http://localhost:1111/api/v1/dashboard/student/stats/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:1111/api/v1/courses/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:1111/api/v1/enrollments/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:1111/api/v1/classes/upcoming/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setStats(statsRes.data);
        setCourses(coursesRes.data.data || []);
        setEnrollments(enrollmentsRes.data.data || []);
        setUpcomingClasses(upcomingRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const handleStartCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-b-4 border-blue-100"></div>
      </div>
    );
  }

  // Get enrolled courses with progress for students
  const enrolledCourses = isAdmin 
    ? courses.slice(0, 3)
    : enrollments.map(enrollment => {
        const course = courses.find(c => c._id === enrollment.courseId);
        return course ? {
          ...course,
          progress: Math.round(
            ((enrollment.progress?.completedVideos?.length || 0) / 
            (course.videos?.length || 1)) * 100
          )
        } : null;
      }).filter(Boolean);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-blue-100"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex items-center h-20 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} space-x-4`}>
          <ModunoLogo size={48} darkMode={darkMode} />
          <div className="flex flex-col justify-center">
            <span className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} tracking-wider`}>Moduno</span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} tracking-wide`} style={{ letterSpacing: "0.04em" }}>
              Build Your Dreams in Real
            </span>
          </div>
        </div>
        <nav className="flex flex-col flex-grow pt-8 px-3 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            to={isAdmin ? "/courselist" : "/studentcourselist"} 
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            {isAdmin ? "Courses" : "My Courses"}
          </Link>

          {!isAdmin && (
            <Link 
              to="/progress" 
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Progress
            </Link>
          )}
          {isAdmin && (
            <Link 
              to="/users" 
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </Link>
          )}
          <Link 
            to="/settings" 
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className={`sticky top-0 z-10 flex h-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm items-center px-4 md:px-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            aria-label="Open menu"
            className={`md:hidden rounded-md p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} focus:outline-none`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1"></div>

          {/* Dark Mode Toggle */}
          <button
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode(!darkMode)}
            className={`mr-4 p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} focus:outline-none`}
          >
            {darkMode ? (
              <Sun className="text-yellow-400" size={20} />
            ) : (
              <Moon className="text-gray-700" size={20} />
            )}
          </button>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                className="flex items-center"
                onClick={() => setShowAddCourseModal(true)}
              >
                <Plus size={18} className="mr-2" />
                Add Course
              </Button>
            )}
            
            {/* Profile dropdown */}
            <div className="relative" ref={profileBtnRef}>
              <button
                type="button"
                aria-label="Open user menu"
                className={`flex items-center rounded-full transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center text-lg font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-700'} font-semibold hidden md:inline`}>
                  {user.name || "User"}
                </span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  profileDropdownOpen ? 'transform rotate-180' : ''
                } ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden md:inline`} />
              </button>
              
              {profileDropdownOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50 animate-dropdownIn ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } border`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || "User"}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 text-sm transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="inline-block mr-2 h-4 w-4" />
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || "User"}! 👋</h1>
            <p className="text-blue-100 text-lg">
              {isAdmin ? "Manage your platform and track performance" : "Ready to continue your learning journey?"}
            </p>
            <Button className="mt-4 bg-white text-blue-600 hover:bg-blue-50">
              {isAdmin ? "View Analytics" : "Continue Learning"}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={isAdmin ? "Total Users" : "Enrolled Courses"}
              value={isAdmin ? stats.totalUsers : enrollments.length}
              change={isAdmin ? `+${stats.newUsersThisMonth || 0} this month` : `+${stats.newEnrollments || 0} this month`}
              icon={isAdmin ? Users : BookOpen}
              color="blue"
            />
            <StatsCard
              title={isAdmin ? "Total Courses" : "Completed Courses"}
              value={isAdmin ? stats.totalCourses : stats.completedCourses || 0}
              change={isAdmin ? `+${stats.newCoursesThisMonth || 0} this month` : `+${stats.newCompletions || 0} this month`}
              icon={isAdmin ? BookOpen : Award}
              color="green"
            />
            <StatsCard
              title={isAdmin ? "New Enrollments" : "Study Hours"}
              value={isAdmin ? stats.newEnrollments : stats.studyHours || 0}
              change={isAdmin ? `+${stats.enrollmentChange || 0}% this week` : `+${stats.hoursChange || 0}% this week`}
              icon={isAdmin ? TrendingUp : Clock}
              color="purple"
            />
            <StatsCard
              title={isAdmin ? "Revenue" : "Certificates"}
              value={isAdmin ? `$${stats.revenue || 0}` : stats.certificates || 0}
              change={isAdmin ? `+${stats.revenueChange || 0}% this month` : `+${stats.certificatesChange || 0} this month`}
              icon={isAdmin ? Award : TrendingUp}
              color="orange"
            />
          </div>

          {/* Courses Section */}
          <div className={`rounded-xl p-6 shadow-sm mb-8 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isAdmin ? "Recent Courses" : "Your Courses"}
              </h2>
              {isAdmin ? (
                <Button 
                  onClick={() => setShowAddCourseModal(true)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              ) : (
                <Link 
                  to="/courses" 
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
                      : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'
                  } border`}
                >
                  View All Courses
                </Link>
              )}
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <CourseCard 
                    key={course._id}
                    course={course}
                    isAdmin={isAdmin}
                    onClick={() => handleStartCourse(course._id)}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <BookOpen className={`mx-auto h-12 w-12 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`mt-4 text-lg font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isAdmin ? "No courses available" : "You haven't enrolled in any courses yet"}
                </h3>
                <p className={`mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isAdmin ? "Add your first course to get started" : "Browse courses to begin learning"}
                </p>
                <Button className="mt-4">
                  {isAdmin ? "Add Course" : "Browse Courses"}
                </Button>
              </div>
            )}
          </div>

          {/* Upcoming Classes / Recent Activity */}
          <div className={`rounded-xl p-6 shadow-sm ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className={`h-5 w-5 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isAdmin ? "Recent Activity" : "Upcoming Classes"}
              </h2>
            </div>
            
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div 
                    key={classItem._id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <h3 className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {classItem.title}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        with {classItem.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {new Date(classItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button
                        className={`mt-1 px-3 py-1 rounded-lg font-medium text-sm transition-colors ${
                          darkMode 
                            ? 'bg-gray-600 text-white hover:bg-gray-500' 
                            : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {isAdmin ? "View" : "Join"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Calendar className={`mx-auto h-12 w-12 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`mt-4 text-lg font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isAdmin ? "No recent activity" : "No upcoming classes"}
                </h3>
                <p className={`mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isAdmin ? "Activity will appear here" : "Check back later for scheduled sessions"}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex justify-center items-center">
          <div className={`relative rounded-xl shadow-2xl max-w-xl w-full p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              aria-label="Close modal"
              className={`absolute top-4 right-4 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setShowAddCourseModal(false)}
            >
              <X size={24} />
            </button>
            <h2 className={`text-xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Add New Course
            </h2>
            <AdminAddCourseForm 
              onCourseAdded={handleCourseAdded} 
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;