"use client"

import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosConfig";
import {
  Play, BookOpen, Clock, Video, CheckCircle, ChevronRight, Loader2, Bookmark, List, X,
  Heart,
  GraduationCap,
  TrendingUp,
  Search,
  Filter,
  SortAsc,
  Users
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import CoursePlayer from "../CoursePlayer";
import DashboardLayout from '../shared/DashboardLayout';

// Simple Progress Bar Component
const ProgressBar = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

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

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get("/courses");
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axiosInstance.delete(`/courses/${courseId}`);
        toast.success("Course deleted successfully");
        fetchCourses();
      } catch (error) {
        console.error("Failed to delete course:", error);
        toast.error("Failed to delete course");
      }
    }
  };

  const sortedAndFilteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'enrollments':
          return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Course Management</h2>
        <Link
          to="/courses/new"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Add New Course
        </Link>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white flex items-center space-x-2 hover:bg-white/20"
          >
            <SortAsc className="h-5 w-5" />
            <span>Sort</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg z-10">
              <div className="py-1">
                {['title', 'enrollments', 'created'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      sortBy === option ? 'text-blue-500' : 'text-white'
                    } hover:bg-white/10`}
                  >
                    Sort by {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredCourses.map((course) => (
          <div
            key={course._id}
            className="rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-lg transition-transform hover:scale-105"
          >
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-green-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-50" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">{course.title}</h3>
              <p className="text-gray-300 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrollmentCount || 0} enrolled</span>
                </div>
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-1" />
                  <span>{course.videos?.length || 0} videos</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/courses/edit/${course._id}`}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-500 text-center hover:bg-blue-500/30 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentCourseList = () => {
  const { user: authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add this near the top of the component, after the initial state declarations
  const [initialized, setInitialized] = useState(false);

  // Helper functions first
  const isEnrolled = (courseId) => {
    if (!courseId || !enrollments || !initialized) return false;
    
    console.log("Checking enrollment for course:", courseId);
    console.log("Current enrollments:", enrollments);
    
    const enrolled = enrollments.some(e => {
      const enrollmentCourseId = e.course?._id?.toString() || e.courseId?.toString();
      const targetCourseId = courseId?.toString();
      console.log("Comparing course IDs:", { enrollmentCourseId, targetCourseId });
      const result = enrollmentCourseId === targetCourseId;
      console.log("Enrollment match result:", result);
      return result;
    });
    
    console.log("Is enrolled result:", enrolled);
    return enrolled;
  };

  // Add this helper function to calculate course completion status
  const calculateCourseCompletion = (enrollment, courseData) => {
    if (!enrollment || !courseData) return false;
    
    const completedVideos = enrollment.progress?.completedVideos || [];
    const totalVideos = courseData.videos?.length || 0;
    
    // Course is complete if either:
    // 1. All videos are completed
    // 2. The progress.isCompleted flag is true
    const isComplete = enrollment.progress?.isCompleted || 
                      (totalVideos > 0 && completedVideos.length === totalVideos);
    
    console.log("Calculating course completion:", {
      courseId: courseData._id,
      completedVideos: completedVideos.length,
      totalVideos,
      isComplete
    });
    
    return isComplete;
  };

  // Update the getEnrollment function to include completion calculation
  const getEnrollment = (courseId) => {
    if (!courseId || !enrollments) return null;
    
    const enrollment = enrollments.find(e => {
      const enrollmentCourseId = e.course?._id?.toString() || e.courseId?.toString();
      const targetCourseId = courseId?.toString();
      return enrollmentCourseId === targetCourseId;
    });
    
    if (enrollment) {
      const course = courses.find(c => c._id.toString() === courseId.toString());
      const isComplete = calculateCourseCompletion(enrollment, course);
      
      // Return enrollment with verified completion status
      return {
        ...enrollment,
        progress: {
          ...enrollment.progress,
          isCompleted: isComplete
        }
      };
    }
    
    return null;
  };

  const getProgressPercentage = (courseId) => {
    const enrollment = getEnrollment(courseId);
    const course = courses.find(c => c._id.toString() === courseId.toString());
    
    if (!enrollment || !course?.videos?.length) return 0;
    
    const completedVideos = enrollment.progress?.completedVideos || [];
    const percentage = (completedVideos.length / course.videos.length) * 100;
    
    console.log("Progress calculation:", {
      courseId,
      completedVideos: completedVideos.length,
      totalVideos: course.videos.length,
      percentage
    });
    
    return Math.round(percentage);
  };

  // State hooks
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0
  });

  // Memoized values
  const availableCourses = useMemo(() => {
    return courses.filter(course => !isEnrolled(course._id));
  }, [courses, enrollments]);

  const enrolledCourses = useMemo(() => {
    return enrollments
      .map((enrollment) => {
        const courseId = enrollment.course?._id || enrollment.courseId;
        const course = courses.find((c) => c._id.toString() === courseId?.toString());
        if (!course) return null;
        return {
          ...course,
          enrollment,
          progress: getProgressPercentage(course._id),
          isCompleted: enrollment.progress?.isCompleted || false,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments]);

  // Effects
  useEffect(() => {
    if (authUser?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        // First fetch courses
        const coursesResponse = await fetchCourses();
        console.log("Fresh courses loaded:", coursesResponse);

        // Then fetch enrollments from backend
        const enrollmentsResponse = await fetchEnrollments();
        console.log("Fresh enrollments loaded:", enrollmentsResponse);

        if (enrollmentsResponse.length > 0) {
          // Update enrollments with full course data
          const updatedEnrollments = enrollmentsResponse.map(enrollment => {
            const course = coursesResponse.find(c => 
              c._id.toString() === (enrollment.course?._id || enrollment.courseId).toString()
            );
            return {
              ...enrollment,
              course: course || enrollment.course
            };
          });

          setEnrollments(updatedEnrollments);
          console.log("Updated enrollments with course data:", updatedEnrollments);

          // Calculate and update stats
          const newStats = calculateStats(updatedEnrollments, coursesResponse);
          console.log("Calculated new stats:", newStats);
          setStats(newStats);

          // Persist to localStorage
          localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(updatedEnrollments));
        } else {
          // Try to load from localStorage if no enrollments from API
          const persistedEnrollments = localStorage.getItem(`enrollments_${authUser._id}`);
          if (persistedEnrollments) {
            try {
              const parsed = JSON.parse(persistedEnrollments);
              setEnrollments(parsed);
              
              // Calculate stats from persisted enrollments
              const newStats = calculateStats(parsed, coursesResponse);
              setStats(newStats);
              
              console.log("Loaded persisted enrollments:", parsed);
            } catch (error) {
              console.error("Error loading persisted enrollments:", error);
            }
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load your courses. Please try again.");

        // Try to load from localStorage as fallback
        const persistedEnrollments = localStorage.getItem(`enrollments_${authUser._id}`);
        if (persistedEnrollments) {
      try {
            const parsed = JSON.parse(persistedEnrollments);
            setEnrollments(parsed);
            
            // Calculate stats even from persisted data
            const newStats = calculateStats(parsed, courses);
            setStats(newStats);
            
            console.log("Loaded persisted enrollments as fallback:", parsed);
      } catch (error) {
            console.error("Error loading persisted enrollments:", error);
      }
    }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [authUser, navigate]);

  useEffect(() => {
    if (enrollments.length > 0) {
      const completed = enrollments.filter((e) => e.progress?.isCompleted).length;
      setCompletedCoursesCount(completed);
    }
  }, [enrollments]);

  useEffect(() => {
    if (authUser?._id) {
      localStorage.setItem(`favorites_${authUser._id}`, JSON.stringify(favorites));
    }
  }, [favorites, authUser?._id]);

  useEffect(() => {
    if (enrollments.length > 0 && courses.length > 0) {
      const newStats = calculateStats(enrollments, courses);
      console.log("Updating stats from enrollments change:", newStats);
      setStats(newStats);
    }
  }, [enrollments, courses]);

  // Load persisted enrollments on mount
  useEffect(() => {
    if (authUser?._id) {
      const persistedEnrollments = localStorage.getItem(`enrollments_${authUser._id}`);
      if (persistedEnrollments) {
        try {
          const parsed = JSON.parse(persistedEnrollments);
          setEnrollments(parsed);
          console.log("Loaded persisted enrollments:", parsed);
        } catch (error) {
          console.error("Error loading persisted enrollments:", error);
        }
      }
    }
  }, [authUser?._id]);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");
      const res = await axiosInstance.get("/courses");
      
      if (!res.data) {
        throw new Error("No course data received");
      }

      const coursesData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const normalizedCourses = coursesData.map(course => ({
        ...course,
        videos: (course.sections || []).flatMap(section =>
          (section.videos || []).map(video => ({
            ...video,
            url: video.videoUrl || video.url || "",
          }))
        ),
      }));

      console.log("Fetched courses successfully:", {
        totalCourses: normalizedCourses.length,
        courses: normalizedCourses
      });
      
      setCourses(normalizedCourses);
      return normalizedCourses;
    } catch (error) {
      console.error("Failed to load courses:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: "/courses"
      });

      if (error.response?.status === 404) {
        console.error("API endpoint not found. Check if the backend server is running and the endpoint is correct.");
      }

      toast.error("Failed to load courses");
      setCourses([]);
      return [];
    }
  };

  // Update fetchEnrollments to use the completion calculation
  const fetchEnrollments = async () => {
    if (!authUser?._id) return [];
    
    try {
      console.log("Fetching enrollments for user:", authUser._id);

      const res = await axiosInstance.get(`/enrollments/user/${authUser._id}`);
      
      if (!res.data) {
        console.error("Invalid enrollments response:", res);
        throw new Error("Invalid enrollments data");
      }

      let enrollmentsData = Array.isArray(res.data) ? res.data : 
                           Array.isArray(res.data.data) ? res.data.data : 
                           res.data.data ? [res.data.data] : [];
      
      console.log("Raw enrollments data:", enrollmentsData);

      // Process enrollments and ensure completion status is correct
      const validEnrollments = enrollmentsData.map(enrollment => {
        const courseData = enrollment.course || { _id: enrollment.courseId };
        const fullCourseData = courses.find(c => 
          c._id.toString() === (typeof courseData === 'string' ? courseData : courseData._id).toString()
        );

        const isComplete = calculateCourseCompletion(enrollment, fullCourseData);

        return {
        ...enrollment,
          course: fullCourseData || courseData,
          progress: {
            ...enrollment.progress,
            completedVideos: enrollment.progress?.completedVideos || [],
            isCompleted: isComplete,
            currentVideoIndex: enrollment.progress?.currentVideoIndex || 0
        }
        };
      });

      console.log("Processed enrollments with completion status:", validEnrollments);
      
      // Update state and localStorage
      setEnrollments(validEnrollments);
      if (validEnrollments.length > 0) {
        localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(validEnrollments));
      }

      // Update completion count
      const completedCount = validEnrollments.filter(e => e.progress?.isCompleted).length;
      setCompletedCoursesCount(completedCount);

      return validEnrollments;
    } catch (error) {
      console.error("Fetch enrollments error:", error);
      
      // Try to load from localStorage as fallback
      const persistedEnrollments = localStorage.getItem(`enrollments_${authUser._id}`);
      if (persistedEnrollments) {
        try {
          const parsed = JSON.parse(persistedEnrollments);
          
          // Recalculate completion status for persisted enrollments
          const updatedEnrollments = parsed.map(enrollment => {
            const course = courses.find(c => c._id.toString() === (enrollment.course?._id || enrollment.courseId).toString());
            const isComplete = calculateCourseCompletion(enrollment, course);
            
            return {
              ...enrollment,
              progress: {
                ...enrollment.progress,
                isCompleted: isComplete
              }
            };
          });
          
          setEnrollments(updatedEnrollments);
          const completedCount = updatedEnrollments.filter(e => e.progress?.isCompleted).length;
          setCompletedCoursesCount(completedCount);
          return updatedEnrollments;
        } catch (error) {
          console.error("Error loading persisted enrollments:", error);
        }
      }

      setEnrollments([]);
      return [];
    }
  };

  // Update the calculateStats function to remove timeSpent
  const calculateStats = (enrollmentsData, coursesData) => {
    console.log("Calculating stats with:", {
      enrollments: enrollmentsData.length,
      courses: coursesData.length
    });

    const totalEnrolled = enrollmentsData.length;
    const completed = enrollmentsData.filter(e => e.progress?.isCompleted).length;
    const inProgress = totalEnrolled - completed;
    
    return {
      totalCourses: totalEnrolled,
      completedCourses: completed,
      inProgressCourses: inProgress
    };
  };

  const handleEnroll = async (courseId) => {
    if (!authUser || !localStorage.getItem('token')) {
      toast.error("Please log in to enroll in courses");
      navigate("/login");
      return;
    }

    setEnrolling(courseId);
    try {
      const enrollmentData = {
        courseId: courseId
      };

      console.log("Sending enrollment data:", JSON.stringify(enrollmentData, null, 2));

      const response = await axiosInstance.post("/enrollments/create", enrollmentData);

      console.log("Enrollment response:", response.data);

      if (response.data?.data) {
      const newEnrollment = response.data.data;
        console.log("Enrollment data received:", newEnrollment);

        setEnrollments(prev => {
          const exists = prev.some(e => 
            e._id === newEnrollment._id || 
            (e.course?._id === newEnrollment.course?._id && e.user === newEnrollment.user)
          );
          
          if (exists) return prev;
          
          const updated = [...prev, newEnrollment];
          console.log("Updated enrollments:", updated);

          // Recalculate stats with new enrollment
          const newStats = calculateStats(updated, courses);
          setStats(newStats);

          localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(updated));
          return updated;
        });

      setActiveTab("inProgress");
        toast.success(response.data.message || "Successfully enrolled in course!");
        await fetchEnrollments();
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      if (error.response?.data?.message?.includes('already enrolled') || 
          error.response?.status === 409) {
        toast.info("You are already enrolled in this course");
        setActiveTab("inProgress");
        await fetchEnrollments();
        return;
      }

      // Handle other errors
      if (error.response) {
        switch (error.response.status) {
          case 404:
            toast.error("Service temporarily unavailable. Please try again later.");
            break;
          case 400:
            toast.error(error.response.data?.message || "Invalid enrollment data");
            break;
          case 401:
            toast.error("Please log in to enroll in courses");
            navigate("/login");
            break;
          default:
            toast.error("Failed to enroll in course");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to enroll in course. Please try again.");
      }
    } finally {
      setEnrolling(null);
    }
  };

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => {
      const isFavorited = prev.includes(courseId);
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
      return isFavorited ? prev.filter((id) => id !== courseId) : [...prev, courseId];
    });
  };

  const updateEnrollmentProgress = async (enrollmentId, update) => {
    console.log("Attempting to update enrollment:", { enrollmentId, update });
    
    try {
      // Try the first endpoint format
      try {
        const response = await axiosInstance.put(`/enrollments/${enrollmentId}`, update);
        if (response.data.success || response.data.data) {
          return response;
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      // If first attempt fails with 404, try the alternative endpoint
      const response = await axiosInstance.put(`/api/enrollments/${enrollmentId}`, update);
      return response;
    } catch (error) {
      console.error("Error updating enrollment:", error);
      throw error;
    }
  };

  // Update the onVideoComplete handler
  const handleVideoComplete = async (enrollmentId, videoIndex, isComplete) => {
    try {
      const enrollment = getEnrollment(selectedCourse._id);
      if (!enrollment) return null;

      // Get current completed videos and add new one if not already included
      const completedVideos = [...(enrollment.progress?.completedVideos || [])];
      if (!completedVideos.includes(videoIndex)) {
        completedVideos.push(videoIndex);
      }

      // Check if this completes the course
      const isAllCompleted = completedVideos.length === selectedCourse.videos.length;
      const shouldMarkComplete = isComplete || isAllCompleted;

      console.log("Completion status check:", {
        completedVideos,
        totalVideos: selectedCourse.videos.length,
        isAllCompleted,
        shouldMarkComplete
      });

      const update = {
        progress: {
          ...enrollment.progress,
          currentVideoIndex: videoIndex,
          completedVideos,
          isCompleted: shouldMarkComplete,
          lastUpdated: new Date().toISOString()
        }
      };

      console.log("Sending enrollment update:", { enrollmentId, update });

      // Try to update using the helper function
      const response = await updateEnrollmentProgress(enrollmentId, update);

      if (response.data.success || response.data.data) {
        // Update local state
        setEnrollments(prev => {
          const updated = prev.map(e => {
            if (e._id === enrollmentId) {
              const updatedEnrollment = {
                ...e,
                progress: {
                  ...e.progress,
                  ...update.progress
                }
              };
              console.log("Updated enrollment in state:", updatedEnrollment);
              return updatedEnrollment;
            }
            return e;
          });

          // Persist to localStorage
          localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(updated));
          
          // Recalculate stats
          const completed = updated.filter(e => e.progress?.isCompleted).length;
          setCompletedCoursesCount(completed);
          
          return updated;
        });

        // If course is completed, show success message and update UI
        if (shouldMarkComplete) {
          console.log("Course completed, updating UI");
          toast.success("Course completed! 🎉");
          setSelectedCourse(null);
          setCurrentVideo(null);
          setActiveTab("completed");
          await fetchEnrollments(); // Refresh enrollment data
        }

        return update.progress;
      }
    } catch (error) {
      console.error("Error in handleVideoComplete:", error);
      
      // Get the enrollment again to ensure we have the latest data
      const enrollment = getEnrollment(selectedCourse._id);
      if (!enrollment) return null;

      // Get current completed videos
      const currentCompletedVideos = [...(enrollment.progress?.completedVideos || [])];
      if (!currentCompletedVideos.includes(videoIndex)) {
        currentCompletedVideos.push(videoIndex);
      }

      // Update local state even if API fails
      setEnrollments(prev => {
        const updated = prev.map(e => {
          if (e._id === enrollmentId) {
            return {
              ...e,
              progress: {
                ...e.progress,
                currentVideoIndex: videoIndex,
                completedVideos: currentCompletedVideos,
                isCompleted: isComplete || (currentCompletedVideos.length === selectedCourse.videos.length),
                lastUpdated: new Date().toISOString()
              }
            };
          }
          return e;
        });
        localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(updated));
        return updated;
      });
    }
    return null;
  };

  // Add function to get next video
  const getNextVideo = (course, currentVideoIndex) => {
    if (!course?.videos) return null;
    const nextIndex = currentVideoIndex + 1;
    return nextIndex < course.videos.length ? course.videos[nextIndex] : null;
  };

  const handleStartCourse = (course) => {
    if (!isEnrolled(course._id)) {
      handleEnroll(course._id);
    } else {
      const enrollment = getEnrollment(course._id);
      const courseVideos = course.videos || [];
      
      let videoIndex = 0;
      if (enrollment?.progress?.currentVideoIndex !== undefined) {
        videoIndex = enrollment.progress.currentVideoIndex;
      }
      
      setCurrentVideo(courseVideos[videoIndex]);
      setSelectedCourse(course);
    }
  };

  const getButtonText = (course) => {
    if (enrolling === course._id) {
      return "Enrolling...";
    }
    const enrollment = getEnrollment(course._id);
    if (enrollment) {
      if (enrollment.progress?.isCompleted) {
        return "Review Course";
      }
      return "Continue Learning";
    }
    return "Enroll Now";
  };

  const getButtonIcon = (course) => {
    const enrollment = getEnrollment(course._id);
    if (enrollment?.progress?.isCompleted) {
      return <CheckCircle className="h-4 w-4 mr-2" />;
    }
    if (enrollment) {
      return <Play className="h-4 w-4 mr-2" />;
    }
    return <Play className="h-4 w-4 mr-2" />;
  };

  // Update the filterCourses function to use the completion calculation
  const filterCourses = (courses) => {
    console.log("Filtering courses. Current tab:", activeTab);
    
    // First apply search filter
    let filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then apply tab filter
    switch (activeTab) {
      case 'inProgress':
        filtered = filtered.filter(course => {
          const enrollment = getEnrollment(course._id);
          return enrollment && !enrollment.progress?.isCompleted;
        });
        console.log("In Progress courses:", filtered);
        break;
      case 'completed':
        filtered = filtered.filter(course => {
          const enrollment = getEnrollment(course._id);
          return enrollment && enrollment.progress?.isCompleted;
        });
        break;
      case 'favorites':
        filtered = filtered.filter(course => favorites.includes(course._id));
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
    }

    console.log("Filtered courses:", filtered);
    return filtered;
  };

  // Update the course card button
  const renderCourseButton = (course) => {
    const enrollment = getEnrollment(course._id);
    const enrolled = Boolean(enrollment);
    console.log("Rendering button for course:", course._id, { enrolled, enrollment });

    return (
      <button
        onClick={() => handleStartCourse(course)}
        disabled={enrolling === course._id}
        className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white disabled:opacity-50"
      >
        {enrolling === course._id ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {getButtonIcon(course)}
            {enrolled ? (enrollment?.progress?.isCompleted ? "Review Course" : "Continue Learning") : "Enroll Now"}
          </>
        )}
      </button>
    );
  };

  // Update the course card to show progress for enrolled courses
  const renderCourseCard = (course) => {
    const enrollment = getEnrollment(course._id);
    const progress = enrollment ? getProgressPercentage(course._id) : 0;
    const isFavorite = favorites.includes(course._id);

    return (
      <div key={course._id} className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          border: enrollment?.progress?.isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
        }}>
        <div className="relative h-48">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#10B981]" />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {enrollment?.progress?.isCompleted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(course._id);
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-white'
                }`}
              />
            </button>
        </div>

          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium">Course</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-white group-hover:text-[#3B82F6] transition-colors">
            {course.title}
          </h3>
          <p className="text-[#93C5FD] line-clamp-2">{course.description}</p>

          {enrollment && (
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

          <div className="flex items-center justify-between text-sm text-[#93C5FD]">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{course.duration || 0}h</span>
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1" />
              <span>{course.videos?.length || 0} videos</span>
            </div>
          </div>

          {renderCourseButton(course)}
        </div>
      </div>
    );
  };

  // Update the course grid sections
  const renderCourseGrid = () => {
    const filteredCourses = filterCourses(courses);
    
    if (filteredCourses.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No courses found</p>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 text-blue-500 hover:underline"
            >
              View all courses
            </button>
          )}
      </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => renderCourseCard(course))}
      </div>
    );
  };

  // Add effect to refresh enrollments when courses change
  useEffect(() => {
    if (courses.length > 0 && authUser?._id) {
      console.log("Courses changed, refreshing enrollments");
      fetchEnrollments();
    }
  }, [courses, authUser?._id]);

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
            fetchEnrollments();
          }}
          onVideoComplete={async (videoIndex, isComplete) => {
            console.log("Video completed in CoursePlayer:", { videoIndex, isComplete });
            const enrollment = getEnrollment(selectedCourse._id);
            if (!enrollment) return;

            try {
              await handleVideoComplete(enrollment._id, videoIndex, isComplete);

              if (isComplete) {
                toast.success("Course completed! 🎉");
                setSelectedCourse(null);
                setCurrentVideo(null);
                setActiveTab("completed");
                await fetchEnrollments();
              }
            } catch (error) {
              console.error("Error handling video completion:", error);
              toast.error("Failed to save progress. Will try again later.");
            }
          }}
          onProgressUpdate={async (videoIndex, progress) => {
            const enrollment = getEnrollment(selectedCourse._id);
            if (!enrollment) return;

            // Don't update if progress is too small or hasn't changed significantly
            if (progress < 1) return;
            if (Math.abs(enrollment.progress?.watchTime - Math.floor(progress)) < 2) return;

            const update = {
              progress: {
                ...enrollment.progress,
                currentVideoIndex: videoIndex,
                watchTime: Math.floor(progress),
                lastUpdated: new Date().toISOString()
              }
            };

            try {
              await updateEnrollmentProgress(enrollment._id, update);
            } catch (error) {
              console.error("Failed to update watch time:", error);
              // Update local state on error
              setEnrollments(prev => {
                const updated = prev.map(e => {
                  if (e._id === enrollment._id) {
                    return {
                      ...e,
                      progress: {
                        ...e.progress,
                        ...update.progress
                      }
                    };
                  }
                  return e;
                });
                localStorage.setItem(`enrollments_${authUser._id}`, JSON.stringify(updated));
                return updated;
              });
            }
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
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold" style={{
              background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              My Learning
            </h1>
            <p className="text-[#93C5FD] text-lg mt-2">Track your progress and achievements</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 transition-all duration-300 group hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                backdropFilter: "blur(20px)",
              }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  }}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
                  <p className="text-sm text-[#93C5FD]">Total Courses</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 transition-all duration-300 group hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                backdropFilter: "blur(20px)",
              }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  }}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{stats.inProgressCourses}</p>
                  <p className="text-sm text-[#93C5FD]">In Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Sections */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">My Courses</h2>
                <p className="text-[#93C5FD]">Continue your learning journey</p>
              </div>

              {/* Course Filter Tabs */}
              <div className="flex space-x-2 p-1 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white'
                      : 'text-[#93C5FD] hover:bg-white/10'
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setActiveTab('inProgress')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'inProgress'
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white'
                      : 'text-[#93C5FD] hover:bg-white/10'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'completed'
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white'
                      : 'text-[#93C5FD] hover:bg-white/10'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'favorites'
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white'
                      : 'text-[#93C5FD] hover:bg-white/10'
                  }`}
                >
                  Favorites
                </button>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white flex items-center space-x-2 hover:bg-white/20"
                >
                  <SortAsc className="h-5 w-5" />
                  <span>Sort</span>
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg z-10">
                    <div className="py-1">
                      {['title', 'duration', 'videos'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortMenu(false);
                          }}
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            sortBy === option ? 'text-blue-500' : 'text-white'
                          } hover:bg-white/10`}
                        >
                          Sort by {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Grid */}
            {renderCourseGrid()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseList;