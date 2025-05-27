"use client"

import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, TrendingUp, Calendar, Clock, Home, Settings, ChevronDown, Menu, X, Plus, Sun, Moon, User, LogOut, Play, CheckCircle, BarChart2, Bookmark, GraduationCap, Target, Zap, Star } from 'lucide-react';
import axios from "axios";
import { toast } from "react-toastify";
import AdminAddCourseForm from "../components/Admin/AdminAddCourseForm";
import ModunoLogo from "../components/ModunoLogo";

// Enhanced Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600"
  };

  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100", 
    orange: "bg-orange-100",
    indigo: "bg-indigo-100"
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
            {change && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {change}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Enhanced Course Card Component
const CourseCard = ({ course, isAdmin = false, onClick, progress = 0 }) => {
  return (
    <div className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 right-4">
          {progress === 100 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </span>
          ) : progress > 0 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
              {progress}% Complete
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Course</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600">by {course.instructor || "Expert Instructor"}</p>
        </div>

        {!isAdmin && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{course.duration || "8"}h</span>
            </div>
            <div className="flex items-center">
              <Play className="h-4 w-4 mr-1" />
              <span>{course.videos?.length || 0} lessons</span>
            </div>
          </div>

          <button
            onClick={onClick}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
              isAdmin 
                ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
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

const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const baseClasses = "flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg",
    outline: "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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
    // studyHours: 0,
    // certificates: 0
  });
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const profileBtnRef = useRef();

  const navigate = useNavigate();

 useEffect(() => {
  
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!token || !userData) {
        navigate("/login");
        return;
      }

      // Normalize the user ID field
      if (userData.id && !userData._id) {
        userData._id = userData.id;
      }

      // Validate required fields
      if (!userData._id || !userData.role || !userData.name || !userData.email) {
        console.error("Invalid user data structure:", userData);
        toast.error("Your session data is incomplete. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setUser(userData);
      setIsAdmin(userData.role === "admin");
      await fetchDashboardData(userData.role, userData._id);
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast.error("Failed to load your session. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  loadUserData();
}, [navigate]);

 const fetchEnrollments = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const res = await axios.get(`http://localhost:1111/api/v1/enrollments/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      })

      const enrollmentsData = res.data.data || res.data || []
      setEnrollments(enrollmentsData)
    } catch (error) {
      console.error("Fetch enrollments error:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      setEnrollments([])
    }
  }

const fetchDashboardData = async (role, userId) => {
  // Validate inputs
  if (!role || !userId) {
    console.error("Missing required parameters for dashboard fetch:", { role, userId });
    toast.error("System error: Missing user identification");
    return;
  }

  // Validate MongoDB ID format if using MongoDB
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    console.error("Invalid user ID format:", userId);
    toast.error("System error: Invalid user identification");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    if (role === "admin") {
      const [statsRes, coursesRes] = await Promise.all([
        axios.get(`http://localhost:1111/api/v1/dashboard/admin/stats`, { headers }),
        axios.get(`http://localhost:1111/api/v1/courses`, { headers })
      ]);
      
      setStats(statsRes.data);
      setCourses(coursesRes.data.data || []);
    } else {

      const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
};

      const [statsRes, coursesRes, enrollmentsRes] = await Promise.all([
        
        axios.get(`http://localhost:1111/api/v1/dashboard/student/stats/${userId}`, { headers })
          .catch(err => {
            console.error("Stats fetch error:", err);
            return { data: {} }; // Provide fallback data
          }),
        axios.get(`http://localhost:1111/api/v1/courses/user/${userId}`, { headers })
          .catch(err => {
            console.error("Courses fetch error:", err);
            return { data: { data: [] } }; // Provide fallback data
          }),
        axios.get(`http://localhost:1111/api/v1/enrollments/user/${userId}`, { headers })
        
          .catch(err => {
            console.error("Enrollments fetch error:", err);
            return { data: { data: [] } }; // Provide fallback data
          })
      ]);
      
      // Merge stats with default values
      setStats({
        enrolledCourses: 0,
        completedCourses: 0,
         totalCourses: 0,
        // studyHours: 0,
        // certificates: 0,
        ...statsRes.data
      });
      setCourses(coursesRes.data.data || []);
      setEnrollments(enrollmentsRes.data.data || []);
    }
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    toast.error("Failed to load dashboard data. Please try refreshing.");
    
    // Set safe default values
    setStats({
      totalUsers: 0,
      totalCourses: 0,
      newEnrollments: 0,
      revenue: 0,
      enrolledCourses: 0,
      completedCourses: 0,
      // studyHours: 0,
      // certificates: 0
    });
    setCourses([]);
    setEnrollments([]);
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
  if (isAdmin) {
    navigate(`/admin/course/manage/${courseId}`);
  } else {
    navigate(`/course/${courseId}`);
  }
};


 if (!user) {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-blue-100 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );
}

const UserDataValidator = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?._id) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Session Error</h2>
          <p className="text-gray-600 mb-6">
            Your session data is incomplete or corrupted. Please log in again.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Then wrap your Dashboard component with it:
const Dashboard = () => {
  return (
    <UserDataValidator>
      {/* Your existing dashboard JSX */}
    </UserDataValidator>
  );
};

  // Get enrolled courses with progress for students
 const enrolledCourses = isAdmin 
  ? courses.slice(0, 6)
  : enrollments.map(enrollment => {
      const course = courses.find(c => c && c._id === enrollment.courseId);
      if (!course) return null; // ✅ skip if course not found

      const totalVideos = course.videos?.length || 1;
      const completedVideos = enrollment.progress?.completedVideos?.length || 0;
      const progress = Math.round((completedVideos / totalVideos) * 100);

      return {
        ...course,
        progress,
        enrollmentId: enrollment._id,
        lastAccessed: enrollment.lastAccessed,
        isCompleted: enrollment.progress?.isCompleted || false
      };
    }).filter(Boolean); // ✅ removes all null entries


  const adminStats = [
    {
      title: "Total Students",
      value: stats.totalUsers,
      change: "+12%",
      icon: Users,
      color: "blue",
      description: "Active learners"
    },
    {
      title: "Total Weeks", 
      value: stats.totalCourses,
      change: "+3",
      icon: BookOpen,
      color: "green",
      description: "Available courses"
    },
    {
      title: "New Enrollments",
      value: stats.newEnrollments,
      change: "+18%", 
      icon: TrendingUp,
      color: "purple",
      description: "This month"
    },

  ];

  const studentStats = [{
      title: "Total Weeks", 
      value: stats.totalCourses,
    
      icon: BookOpen,
      color: "green",
      description: "Available weeks"
    },
    {
      title: "Enrolled Weeks",
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: "blue",
      description: "Active weeks"
    },
    {
      title: "Completed eeks",
      value: stats.completedCourses,
      icon: CheckCircle,
      color: "green", 
      description: "Finished weeks"
    },
    // {
    //   title: "Study Hours",
    //   value: stats.studyHours,
    //   icon: Clock,
    //   color: "purple",
    //   description: "Total time"
    // },
    // {
    //   title: "Certificates",
    //   value: stats.certificates,
    //   icon: Award,
    //   color: "orange",
    //   description: "Earned certificates"
    // }
  ];

  const statsToShow = isAdmin ? adminStats : studentStats;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-b-4 border-blue-100 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex items-center h-20 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduPro
              </h1>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-col flex-grow pt-8 px-4 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            to={isAdmin ? "/courselist" : "/studentcourselist"} 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 ${
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
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 ${
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
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-gray-100 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </Link>
          )}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className={`sticky top-0 z-10 flex h-16 ${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-lg'} shadow-sm items-center px-4 md:px-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            aria-label="Open menu"
            className={`md:hidden rounded-lg p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} focus:outline-none transition-colors`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1"></div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                onClick={() => setShowAddCourseModal(true)}
              >
                <Plus size={18} className="mr-2" />
                Add Course
              </Button>
            )}
            
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} focus:outline-none transition-colors`}
            >
              {darkMode ? (
                <Sun className="text-yellow-400" size={20} />
              ) : (
                <Moon className="text-gray-700" size={20} />
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileBtnRef}>
              <button
                type="button"
                aria-label="Open user menu"
                className={`flex items-center rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className={`ml-3 ${darkMode ? 'text-white' : 'text-gray-700'} font-semibold hidden md:inline`}>
                  {user.name || "User"}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                  profileDropdownOpen ? 'transform rotate-180' : ''
                } ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden md:inline`} />
              </button>
              
              {profileDropdownOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } border backdrop-blur-lg`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || "User"}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className={`block px-4 py-3 text-sm transition-colors rounded-t-none ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="inline-block mr-3 h-4 w-4" />
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-3 text-sm transition-colors rounded-b-xl ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="inline-block mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 p-6 lg:p-8 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {isAdmin ? <Target className="h-8 w-8" /> : <Zap className="h-8 w-8" />}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name || "User"}! 👋</h1>
                  <p className="text-blue-100 text-lg">
                    {isAdmin 
                      ? "Manage your platform and track performance" 
                      : "Ready to continue your learning journey?"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsToShow.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Courses Section */}
          <div className={`rounded-3xl p-8 shadow-2xl mb-8 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border-0`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {isAdmin ? "Recent Courses" : "Your Courses"}
                </h2>
                <p className={`text-lg mt-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isAdmin ? "Manage and monitor course performance" : "Continue your learning journey"}
                </p>
              </div>
              <Button
                variant="outline"
                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent"
                onClick={() => navigate(isAdmin ? "/courselist" : "/studentcourselist")}
              >
                View All Courses
              </Button>
            </div>
            
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                  {isAdmin ? "No courses created yet" : "No enrolled courses"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  {isAdmin
                    ? "Create your first course to get started with your educational platform"
                    : "Explore available courses to begin your learning journey"}
                </p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg px-8 py-3"
                  onClick={() => navigate(isAdmin ? "/courselist" : "/studentcourselist")}
                >
                  {isAdmin ? "Create Course" : "Browse Courses"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isAdmin={isAdmin}
                    onClick={() => handleStartCourse(course._id)}
                    progress={course.progress || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`relative rounded-3xl shadow-2xl max-w-2xl w-full p-8 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              aria-label="Close modal"
              className={`absolute top-6 right-6 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
              onClick={() => setShowAddCourseModal(false)}
            >
              <X size={24} />
            </button>
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