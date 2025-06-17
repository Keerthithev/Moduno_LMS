"use client"

import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, Users, Award, TrendingUp, Calendar, Clock, Home, 
  Settings, ChevronDown, Menu, X, Plus, Sun, Moon, User, 
  LogOut, Play, CheckCircle, BarChart2, Bookmark, GraduationCap, 
  Target, Zap, Star, Mail, Phone, Facebook, Sparkles, Globe, Monitor, Video, Search, Filter, SortAsc, Heart, DollarSign, UserPlus
} from 'lucide-react';
import axios from "axios";
import { toast } from "react-toastify";
import AdminAddCourseForm from "../components/Admin/AdminAddCourseForm";
import ModunoLogo from "../components/ModunoLogo";
import axiosInstance from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from './shared/DashboardLayout';
import CoursePlayer from "../components/CoursePlayer";

// Enhanced Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color, description }) => {
  const colorStyles = {
    blue: { bg: "rgba(59, 130, 246, 0.3)", border: "rgba(59, 130, 246, 0.3)", icon: "#3B82F6" },
    green: { bg: "rgba(16, 185, 129, 0.3)", border: "rgba(16, 185, 129, 0.3)", icon: "#10B981" },
    purple: { bg: "rgba(139, 92, 246, 0.3)", border: "rgba(139, 92, 246, 0.3)", icon: "#8B5CF6" },
    orange: { bg: "rgba(245, 158, 11, 0.3)", border: "rgba(245, 158, 11, 0.3)", icon: "#F59E0B" },
    indigo: { bg: "rgba(99, 102, 241, 0.3)", border: "rgba(99, 102, 241, 0.3)", icon: "#6366F1" }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: `1px solid ${colorStyles[color].border}`,
        backdropFilter: "blur(20px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#93C5FD]">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
            {change && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colorStyles[color].bg}] text-white`}
              >
                {change}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-[#93C5FD]">{description}</p>}
        </div>
        <div
          className="p-4 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg transform group-hover:scale-110 transition-transform duration-300"
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Enhanced Course Card Component
const CourseCard = ({ course, isAdmin = false, onClick, progress = 0, isFavorite = false, onToggleFavorite }) => {
  const totalVideos = course.videos?.length || course.sections?.reduce((acc, section) => acc + (section.videos?.length || 0), 0) || 0;

  return (
    <div className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(20px)",
      }}>
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#10B981]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Course</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(course._id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-[#3B82F6] transition-colors text-white">
            {course.title}
          </h3>
          <p className="text-sm text-[#93C5FD]">by {course.instructor?.name || "Expert Instructor"}</p>
        </div>

        {!isAdmin && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#93C5FD]">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-sm text-[#93C5FD]">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{course.duration || 0}h</span>
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1.5" />
              <span>{totalVideos} lessons</span>
            </div>
          </div>

          <button
            onClick={() => onClick(course)}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white hover:from-[#1E40AF] hover:to-[#059669] shadow-lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isAdmin ? "Manage" : progress > 0 ? "Continue" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Button Component
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  return (
    <button
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${className} ${
        variant === "primary"
          ? "bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white hover:from-[#1E40AF] hover:to-[#059669] shadow-lg"
          : variant === "outline"
          ? "bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.2)] backdrop-blur-[10px]"
          : "text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)]"
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

const AdminDashboard = ({ stats, onCourseAdded }) => {
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // Ensure stats is not undefined
  const safeStats = stats || {
    totalUsers: 0,
    totalCourses: 0,
    newUsersThisMonth: 0,
    activeEnrollments: 0,
    courseCompletionRate: 0,
    activeStudents: 0
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
              }}>
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{
                background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Admin Dashboard
              </h1>
              <p className="text-[#93C5FD] text-lg">
                Monitor and manage your learning platform
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Course</span>
          </Button>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={safeStats.totalUsers}
          icon={Users}
          color="blue"
          description="Platform users"
        />

        <StatsCard
          title="Total Courses"
          value={safeStats.totalCourses}
          icon={BookOpen}
          color="green"
          description="Available courses"
        />

        <StatsCard
          title="New Users"
          value={safeStats.newUsersThisMonth}
          icon={UserPlus}
          color="purple"
          description="This month"
        />

        <StatsCard
          title="Active Enrollments"
          value={safeStats.activeEnrollments}
          icon={TrendingUp}
          color="orange"
          description="Current enrollments"
        />
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
          }}>
          <h3 className="text-xl font-bold text-white mb-4">Platform Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#93C5FD]">Course Completion Rate</span>
              <span className="text-white font-bold">{safeStats.courseCompletionRate}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] h-2 rounded-full transition-all duration-300"
                style={{ width: `${safeStats.courseCompletionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#93C5FD]">Active Students</span>
              <span className="text-white font-bold">{safeStats.activeStudents}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
          }}>
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/courselist"
              className="p-4 rounded-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center text-center"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}>
              <BookOpen className="h-8 w-8 text-[#3B82F6] mb-2" />
              <span className="text-sm font-medium text-[#93C5FD]">Manage Courses</span>
            </Link>
            <Link to="/users"
              className="p-4 rounded-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center text-center"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
              <Users className="h-8 w-8 text-[#10B981] mb-2" />
              <span className="text-sm font-medium text-[#93C5FD]">Manage Users</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Course</h2>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <AdminAddCourseForm
              onSuccess={() => {
                setShowAddCourseModal(false);
                toast.success("Course added successfully!");
                onCourseAdded();
              }}
              onCancel={() => setShowAddCourseModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StudentDashboard = ({ 
  stats, 
  courses, 
  enrollments, 
  handleContinueLearning, 
  favorites, 
  activeTab, 
  setActiveTab,
  getProgressPercentage 
}) => {
  const { user: authUser } = useContext(AuthContext);
  const [localFavorites, setLocalFavorites] = useState(favorites || []);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem(`favorites_${authUser._id}`);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setLocalFavorites(parsed);
        }
      } catch (error) {
        console.error('Error parsing favorites:', error);
      }
    }
  }, [authUser._id]);

  const handleToggleFavorite = (courseId) => {
    setLocalFavorites(prev => {
      const newFavorites = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      // Save to localStorage
      localStorage.setItem(`favorites_${authUser._id}`, JSON.stringify(newFavorites));
      
      // Show toast notification
      toast.success(
        prev.includes(courseId)
          ? "Removed from favorites"
          : "Added to favorites",
        {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      return newFavorites;
    });
  };

  // Filter courses based on active tab
  const getFilteredCourses = () => {
    // Get all enrolled courses first
    const enrolledCourses = courses.filter(course => {
      return enrollments.some(e => {
        const courseRef = e.course?._id?.toString() || e.courseId?.toString();
        return courseRef === course._id?.toString();
      });
    });

    switch (activeTab) {
      case 'completed':
        return enrolledCourses.filter(course => {
          const enrollment = enrollments.find(e => {
            const courseRef = e.course?._id?.toString() || e.courseId?.toString();
            return courseRef === course._id?.toString();
          });
          return enrollment?.progress?.isCompleted === true;
        });
      case 'favorites':
        return enrolledCourses.filter(course => localFavorites.includes(course._id));
      case 'inProgress':
      default:
        return enrolledCourses.filter(course => {
          const enrollment = enrollments.find(e => {
            const courseRef = e.course?._id?.toString() || e.courseId?.toString();
            return courseRef === course._id?.toString();
          });
          return enrollment?.progress?.isCompleted !== true;
        });
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="space-y-8">
      {/* Course Tabs */}
      <div className="space-y-6">
        <div className="flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('inProgress')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inProgress'
                ? 'text-white border-b-2 border-[#3B82F6]'
                : 'text-[#93C5FD] hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-white border-b-2 border-[#3B82F6]'
                : 'text-[#93C5FD] hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-[#3B82F6]'
                : 'text-[#93C5FD] hover:text-white'
            }`}
          >
            Favorites ({localFavorites.length})
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                progress={getProgressPercentage(course._id)}
                onClick={() => handleContinueLearning(course)}
                isFavorite={localFavorites.includes(course._id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              {activeTab === 'inProgress' ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                    }}>
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white text-xl font-semibold">No Courses in Progress</p>
                  <p className="text-[#93C5FD] text-base">Ready to start learning something new?</p>
                  <Link 
                    to="/studentcourselist"
                    className="inline-flex items-center px-6 py-3 mt-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white hover:from-[#1E40AF] hover:to-[#059669] shadow-lg transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Browse New Courses
                  </Link>
                </div>
              ) : activeTab === 'completed' ? (
                <p className="text-[#93C5FD] text-lg">No completed courses yet. Keep learning!</p>
              ) : (
                <p className="text-[#93C5FD] text-lg">No favorite courses yet. Add some!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user: authUser, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    inProgress: 0,
    timeSpent: '0h'
  });
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const profileBtnRef = useRef();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('inProgress');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    newUsersThisMonth: 0,
    activeEnrollments: 0,
    courseCompletionRate: 0,
    activeStudents: 0,
    averageRating: 4.5
  });

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    if (authUser.role === 'admin') {
      setIsAdmin(true);
      fetchAdminStats();
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem(`favorites_${authUser._id}`);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch (error) {
        console.error('Error parsing favorites:', error);
      }
    }

    Promise.all([fetchCourses(), fetchEnrollments()])
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load courses. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [authUser, navigate]);

  useEffect(() => {
    if (enrollments.length > 0) {
      const inProgress = enrollments.filter(e => !e.progress?.isCompleted).length;

      setStats({
        totalEnrolled: enrollments.length,
        inProgress: inProgress
      });
    }
  }, [enrollments]);

  useEffect(() => {
    if (authUser?._id) {
      localStorage.setItem(`favorites_${authUser._id}`, JSON.stringify(favorites));
    }
  }, [favorites, authUser?._id]);

  const calculateTimeSpent = (enrollments) => {
    let totalMinutes = 0;
    enrollments.forEach(enrollment => {
      if (enrollment.progress?.watchTime) {
        totalMinutes += enrollment.progress.watchTime;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h`;
  };

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get("/courses");
      const normalizedCourses = (res.data.data || []).map(course => ({
        ...course,
        videos: (course.sections || []).flatMap(section =>
          (section.videos || []).map(video => ({
            ...video,
            url: video.videoUrl || video.url || "",
          }))
        ),
      }));
      setCourses(normalizedCourses);
      } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  const fetchEnrollments = async () => {
    if (!authUser?._id) return;
    
    try {
      console.log("Fetching enrollments for user:", authUser._id);
      const res = await axiosInstance.get(`/enrollments/user/${authUser._id}`);
      
      if (!res.data || !Array.isArray(res.data.data)) {
        console.error("Invalid enrollments response:", res);
        throw new Error("Invalid enrollments data");
      }

      console.log("Fetched enrollments:", res.data.data);
      setEnrollments(res.data.data);
      
      // Update stats based on enrollments
      const inProgress = res.data.data.filter(e => !e.progress?.isCompleted).length;
      setStats(prev => ({
        ...prev,
        totalEnrolled: res.data.data.length,
        inProgress
      }));
    } catch (error) {
      console.error("Fetch enrollments error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error("Failed to load enrollments");
      setEnrollments([]);
    }
  };

  const fetchAdminStats = async () => {
    try {
      console.log("Fetching admin stats...");
      
      const statsResponse = await axiosInstance.get("/dashboard/admin/stats");
      console.log("Admin stats response:", statsResponse.data);

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        setAdminStats({
          totalUsers: stats.totalUsers || 0,
          totalCourses: stats.totalCourses || 0,
          newUsersThisMonth: stats.newUsersThisMonth || 0,
          activeEnrollments: stats.activeEnrollments || 0,
          courseCompletionRate: stats.courseCompletionRate || 0,
          activeStudents: stats.activeStudents || 0,
          averageRating: 4.5
        });
      } else {
        console.error("Invalid admin stats response:", statsResponse.data);
        toast.error("Failed to load admin statistics");
      }

    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load admin statistics');
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some((e) => {
      const courseRef = e.course?._id?.toString() || e.courseId?.toString();
      return courseRef === courseId?.toString();
    });
  };

  const getEnrollment = (courseId) => {
    return enrollments.find((e) => {
      const courseRef = e.course?._id?.toString() || e.courseId?.toString();
      return courseRef === courseId?.toString();
    });
  };

  const getProgressPercentage = (courseId) => {
    const enrollment = getEnrollment(courseId);
    const course = courses.find((c) => c._id.toString() === courseId.toString());
    if (!enrollment || !course) return 0;
    const completedVideos = enrollment.progress?.completedVideos || [];
    return Math.round((completedVideos.length / (course.videos?.length || 1)) * 100);
  };

  const handleContinueLearning = async (course) => {
    try {
      if (!isEnrolled(course._id)) {
        toast.error("You are not enrolled in this course");
        return;
      }

      console.log("Starting course:", {
        courseId: course._id,
        course: course
      });

      // Instead of fetching again, use the course data we already have
      const fullCourse = course;

      // Validate course structure
      if (!fullCourse.sections || !Array.isArray(fullCourse.sections)) {
        console.error("Invalid course structure:", fullCourse);
        toast.error("Course structure is invalid");
        return;
      }

      // Get the enrollment to find the current progress
      const enrollment = getEnrollment(course._id);
      
      // Flatten all videos from sections with proper validation
      const allVideos = fullCourse.sections.reduce((videos, section) => {
        if (!section || !section.videos || !Array.isArray(section.videos)) {
          return videos;
        }
        
        const sectionVideos = section.videos
          .filter(video => video && (video.videoUrl || video.url)) // Only include valid videos
          .map(video => ({
            ...video,
            sectionId: section._id,
            url: video.videoUrl || video.url,
            title: video.title || 'Untitled Video'
          }));
          
        return [...videos, ...sectionVideos];
      }, []);

      console.log("Processed videos:", {
        totalVideos: allVideos.length,
        videos: allVideos
      });

      if (allVideos.length === 0) {
        toast.error("No videos available in this course");
        return;
      }

      // Determine which video to play
      let videoIndex = 0;
      if (enrollment?.progress?.currentVideoIndex !== undefined) {
        videoIndex = Math.min(enrollment.progress.currentVideoIndex, allVideos.length - 1);
      }

      const videoToPlay = allVideos[videoIndex];
      
      if (!videoToPlay || !videoToPlay.url) {
        console.error("Invalid video data:", videoToPlay);
        toast.error("Video data is invalid");
        return;
      }

      console.log("Starting playback:", {
        videoIndex,
        video: videoToPlay
      });

      setSelectedCourse({
        ...fullCourse,
        videos: allVideos // Add flattened videos array for easier access
      });
      setCurrentVideo(videoToPlay);

    } catch (error) {
      console.error("Error starting course:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // More specific error messages
      if (error.response) {
        switch (error.response.status) {
          case 404:
            toast.error("Course not found. Please refresh the page and try again.");
            break;
          case 403:
            toast.error("You don't have permission to access this course.");
            break;
          default:
            toast.error(`Server error: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to start the course. Please try again.");
      }
    }
  };

  const handleSignOut = () => {
    try {
      // Clear any component state
      setSelectedCourse(null);
      setCurrentVideo(null);
      setFavorites([]);
      setEnrollments([]);
      setCourses([]);
      setStats({
        totalEnrolled: 0,
        inProgress: 0,
        timeSpent: '0h'
      });

      // Use the AuthContext logout which will clear localStorage
      logout();
      
      // Navigate to login
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const updateProgress = async (courseId, videoIndex, isCourseComplete = false) => {
    try {
      const enrollment = getEnrollment(courseId);
      if (!enrollment?._id) {
        console.error("No enrollment found for course:", courseId);
        toast.error("Enrollment not found");
        return;
      }

      const update = {
        courseId: courseId,
        userId: authUser._id,
        progress: {
          currentVideoIndex: videoIndex,
          completedVideos: [...new Set([...(enrollment.progress?.completedVideos || []), videoIndex])],
          isCompleted: isCourseComplete,
          lastUpdated: new Date().toISOString()
        },
      };

      console.log("Updating progress:", {
        enrollmentId: enrollment._id,
        update
      });

      // Use the correct API endpoint
      const response = await axiosInstance.put(`/enrollments/update/${enrollment._id}`, update);
      
      if (!response.data) {
        console.error("Invalid response:", response);
        throw new Error("Invalid response from server");
      }

      console.log("Progress update response:", response.data);

      // Refresh enrollments to update UI
      await fetchEnrollments();
      
      if (isCourseComplete) {
        toast.success("Congratulations! You've completed the course!");
      }
    } catch (error) {
      // Store enrollment ID for error logging
      const enrollmentId = getEnrollment(courseId)?._id;
      
      console.error("Progress update error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: `/enrollments/update/${enrollmentId}`,
        config: error.config
      });

      // More specific error handling
      if (error.response) {
        switch (error.response.status) {
          case 404:
            toast.error("Could not find the enrollment. Please try refreshing the page.");
            break;
          case 400:
            toast.error("Invalid progress data. Please try again.");
            break;
          case 401:
            toast.error("Session expired. Please log in again.");
            // Optionally redirect to login
            break;
          default:
            toast.error(`Failed to update progress: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to update progress. Please try again.");
      }

      // If there's an error, we might want to retry the fetch
      try {
        await fetchEnrollments();
      } catch (fetchError) {
        console.error("Failed to refresh enrollments after error:", fetchError);
      }
    }
  };

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => {
      const isFavorited = prev.includes(courseId);
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
      return isFavorited ? prev.filter((id) => id !== courseId) : [...prev, courseId];
    });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get first name
  const getFirstName = () => {
    if (!authUser?.name) return "";
    return authUser.name.split(" ")[0];
  };

  // Get course completion stats
  const getCourseStats = () => {
    if (isAdmin) return null;
    
    const totalEnrolled = enrollments.length;
    const completed = enrollments.filter(e => e.progress?.isCompleted).length;
    const inProgress = totalEnrolled - completed;
    
    return {
      completed,
      inProgress,
      totalEnrolled
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B2545]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[#93C5FD]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (selectedCourse && currentVideo) {
    return (
      <DashboardLayout>
        <CoursePlayer
          course={selectedCourse}
          enrollment={getEnrollment(selectedCourse._id)}
          initialVideo={currentVideo}
          onBack={() => {
            setSelectedCourse(null);
            setCurrentVideo(null);
          }}
          onVideoComplete={async (videoIndex, isComplete) => {
            await updateProgress(selectedCourse._id, videoIndex, isComplete);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{
        background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
      }}>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome Message with Stats */}
          <div className="relative overflow-hidden rounded-3xl p-8"
                  style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
            }}>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold" style={{
                  background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                  {getGreeting()}, {getFirstName()}! 👋
                </h1>
                <p className="text-[#93C5FD] text-lg mt-2">
                  {isAdmin 
                    ? "Welcome to your admin dashboard. Manage your courses and monitor platform activity."
                    : "Here's your learning progress overview"}
                </p>
              </div>

              {!isAdmin && getCourseStats() && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white">{getCourseStats().completed}</div>
                      <div className="text-[#93C5FD] text-sm">Completed Courses</div>
            </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white">{getCourseStats().inProgress}</div>
                      <div className="text-[#93C5FD] text-sm">Courses in Progress</div>
          </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white">{getCourseStats().totalEnrolled}</div>
                      <div className="text-[#93C5FD] text-sm">Total Enrolled Courses</div>
                    </div>
          </div>

                  {getCourseStats().inProgress > 0 && (
              <div>
                      <div className="text-white text-sm font-medium mb-2">Next up to complete:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrollments
                          .filter(e => !e.progress?.isCompleted)
                          .slice(0, 2)
                          .map(enrollment => {
                            const course = courses.find(c => c._id.toString() === (enrollment.course?._id || enrollment.courseId).toString());
                            if (!course) return null;
                            const progress = getProgressPercentage(course._id);
                            
                            return (
                              <div 
                                key={enrollment._id}
                                className="bg-white/5 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
                                onClick={() => handleContinueLearning(course)}
                              >
                                <div className="flex-grow">
                                  <div className="text-white font-medium truncate">{course.title}</div>
                                  <div className="text-[#93C5FD] text-sm">{progress}% completed</div>
                </div>
                                <div className="ml-4">
                                  <Play className="h-5 w-5 text-[#3B82F6]" />
              </div>
              </div>
                            );
                          })}
          </div>
      </div>
                  )}
                </>
              )}
                </div>
                </div>

          {isAdmin ? (
            <AdminDashboard 
              stats={adminStats} 
              onCourseAdded={fetchCourses}
            />
          ) : (
            <StudentDashboard
              stats={stats}
              courses={courses}
              enrollments={enrollments}
              handleContinueLearning={handleContinueLearning}
              favorites={favorites}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              getProgressPercentage={getProgressPercentage}
            />
          )}
    </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;