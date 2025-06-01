"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  Trash2,
  Edit,
  Play,
  X,
  Check,
  Upload,
  Clock,
  Users,
  Video,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  Eye,
  BookOpen,
  Plus,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import CoursePlayer from "../CoursePlayer"
import DashboardLayout from '../shared/DashboardLayout'

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const formatTime = (seconds) => {
  if (seconds === Number.POSITIVE_INFINITY || isNaN(seconds)) return "Calculating..."
  if (seconds <= 0) return "Almost done"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const AdminCourseList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Editing state
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editVideos, setEditVideos] = useState([])
  const [editSaving, setEditSaving] = useState(false)

  // Video upload state during editing
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState("0 B/s")
  const [timeLeft, setTimeLeft] = useState("Calculating...")
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [uploadError, setUploadError] = useState("")

  const [previewMode, setPreviewMode] = useState(false)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)

  const [stats, setStats] = useState({
    totalVideos: 0,
    totalDuration: 0,
    totalEnrollments: 0
  });

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Sort options
  const sortOptions = [
    { label: 'Title', value: 'title' },
    { label: 'Price', value: 'price' },
    { label: 'Duration', value: 'duration' },
    { label: 'Created Date', value: 'createdAt' }
  ];

  const navigate = useNavigate()
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('Current user:', user);

    if (!user || user.role !== "admin") {
      toast.error("Access denied: Admins only");
      navigate("/login");
      return;
    }

    // Separate the API calls
    const fetchData = async () => {
      try {
        await fetchCourses();
        await fetchAllEnrollments();
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  const fetchAllEnrollments = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      console.log('Using token:', token);

      // Get enrollments for admin
      const enrollmentsRes = await axios.get(`http://localhost:1111/api/v1/courses/enrollments`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw enrollments response:', enrollmentsRes);
      console.log('Enrollments data:', enrollmentsRes?.data);

      if (!enrollmentsRes.data || !enrollmentsRes.data.data) {
        console.error('Invalid enrollment response structure:', enrollmentsRes);
        throw new Error('Invalid enrollment data structure received');
      }

      const enrollments = enrollmentsRes.data.data;
      console.log('Parsed enrollments:', enrollments);

      // Update the stats with just the enrollment count
      setStats(prev => {
        const newStats = {
          ...prev,
          totalEnrollments: enrollments.length
        };
        console.log('Updating stats to:', newStats);
        return newStats;
      });

    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      toast.error(
        "Failed to load enrollment data: " + 
        (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:1111/api/v1/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const normalizedCourses = (res.data.data || []).map(course => ({
        ...course,
        videos: normalizeVideos(course)
      }));

      // Calculate total videos and duration
      const totalStats = normalizedCourses.reduce((acc, course) => {
        const courseVideos = normalizeVideos(course);
        return {
          totalVideos: acc.totalVideos + courseVideos.length,
          totalDuration: acc.totalDuration + (parseFloat(course.duration) || 0)
        };
      }, { totalVideos: 0, totalDuration: 0 });

      setStats(prev => ({
        ...prev,
        totalVideos: totalStats.totalVideos,
        totalDuration: totalStats.totalDuration
      }));

      setCourses(normalizedCourses);
    } catch (error) {
      toast.error("Failed to load courses");
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeVideos = (course) => {
    // Handle both section-based and direct video array structures
    if (course.sections && course.sections.length > 0) {
      return course.sections.flatMap(section => 
        (section.videos || []).map(video => ({
          ...video,
          url: video.videoUrl || video.url,
          title: video.title,
          sectionId: section._id,
          sectionTitle: section.title
        }))
      );
    } else if (course.videos && course.videos.length > 0) {
      return course.videos.map(video => ({
        ...video,
        url: video.videoUrl || video.url,
        title: video.title,
        sectionId: 'default',
        sectionTitle: 'Main Section'
      }));
    }
    return [];
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:1111/api/v1/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(courses.filter((c) => c._id !== id))
      alert("Course deleted successfully!")
    } catch (error) {
      alert("Failed to delete course")
      console.error("Delete course error:", error)
    }
  }

  const startEditing = (course) => {
    setEditingCourseId(course._id)
    setEditTitle(course.title)
    setEditDescription(course.description)
    setEditDuration(course.duration)
    // Make sure course.sections or course.videos exist, fallback to empty array
    setEditVideos(course.videos || course.sections?.flatMap(section => section.videos) || [])
  }

  const cancelEditing = () => {
    setEditingCourseId(null)
    setEditTitle("")
    setEditDescription("")
    setEditDuration("")
    setEditVideos([])
    resetUploadState()
  }

  const resetUploadState = () => {
    setUploading(false)
    setUploadProgress(0)
    setUploadSpeed("0 B/s")
    setTimeLeft("Calculating...")
    setVideoFile(null)
    setVideoTitle("")
    setUploadError("")
  }

  const uploadVideo = async () => {
  if (!videoFile || !videoTitle.trim()) {
    setUploadError("Please provide a video title and select a video file.");
    return;
  }

  setUploadError("");
  setUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append("video", videoFile);

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:1111/api/v1/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (progressEvent) => {
        // ... existing progress handling ...
      }
    });

    if (!res.data.videoUrl) {
      throw new Error("Upload failed - no URL returned");
    }

    setEditVideos((prev) => [
      ...prev, 
      { 
        title: videoTitle.trim(), 
        url: res.data.videoUrl,
        videoUrl: res.data.videoUrl, // Add both for compatibility
        duration: 0 
      }
    ]);
    resetUploadState();
    alert("Video uploaded successfully!");
  } catch (err) {
    setUploadError(err.response?.data?.message || "Video upload failed. Please try again.");
    setUploading(false);
  }
};

  const removeVideoFromEdit = (idx) => {
    setEditVideos((prev) => prev.filter((_, i) => i !== idx))
  }

  const saveEdit = async () => {
  if (!editTitle.trim() || !editDescription.trim() || !editDuration) {
    alert("Please fill all course fields.");
    return;
  }

  // Validate videos before sending
  const hasInvalidVideos = editVideos.some(video => 
    !video.videoUrl || video.videoUrl.trim() === ''
  );
  
  if (hasInvalidVideos) {
    alert("Please ensure all videos have valid URLs. Empty URLs will be removed.");
    return;
  }

  setEditSaving(true);
  try {
    const token = localStorage.getItem("token");
    const currentCourse = courses.find(c => c._id === editingCourseId);

    const updatedCourse = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      duration: Number(editDuration),
      category: currentCourse?.category || 'General',
      price: currentCourse?.price || 0,
      discountPrice: currentCourse?.discountPrice || 0,
      level: currentCourse?.level || 'beginner',
      thumbnail: currentCourse?.thumbnail || 'no-photo.jpg',
      isFeatured: currentCourse?.isFeatured || false,
      isActive: currentCourse?.isActive !== false,
      sections: [
        {
          title: "Main Content",
          videos: editVideos.map(video => ({
            title: video.title,
            videoUrl: video.videoUrl || video.url,
            duration: video.duration || 0
          }))
        }
      ]
    };

    console.log('Sending update payload:', JSON.stringify(updatedCourse, null, 2));

    const res = await axios.put(
      `http://localhost:1111/api/v1/courses/${editingCourseId}`,
      updatedCourse,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    setCourses(prev => prev.map(c => c._id === editingCourseId ? res.data.data : c));
    cancelEditing();
    alert("Course updated successfully!");
  } catch (error) {
    console.error('Full update error:', error);
    console.error('Error response:', error.response?.data);
    alert(`Update failed: ${error.response?.data?.message || error.message}`);
  } finally {
    setEditSaving(false);
  }
};

  const handlePreview = (course) => {
    const normalizedVideos = normalizeVideos(course);
    if (normalizedVideos.length > 0) {
      const previewCourseData = {
        ...course,
        sections: [{
          _id: 'default',
          title: 'Main Section',
          videos: normalizedVideos
        }]
      };
      setPreviewCourse(previewCourseData);
      setPreviewVideo(normalizedVideos[0]);
      setPreviewMode(true);
    } else {
      toast.error("No videos available for preview");
    }
  };

  // Sort courses
  const sortCourses = (a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'title':
        return multiplier * (a.title || '').localeCompare(b.title || '');
      case 'price':
        return multiplier * ((a.price || 0) - (b.price || 0));
      case 'duration':
        return multiplier * ((a.duration || 0) - (b.duration || 0));
      case 'createdAt':
        return multiplier * (new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return 0;
    }
  };

  // Apply search and sort
  const filteredCourses = courses
    .filter(course => 
      (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortCourses);

  // Reset sort
  const resetSort = () => {
    setSortBy('title');
    setSortOrder('asc');
    setSortOpen(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-blue-100 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium text-lg">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (previewMode && previewCourse && previewVideo) {
    return (
      <DashboardLayout>
        <div className="min-h-screen" style={{
          background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
        }}>
          <CoursePlayer
            course={previewCourse}
            initialVideo={previewVideo}
            onBack={() => {
              setPreviewMode(false);
              setPreviewCourse(null);
              setPreviewVideo(null);
            }}
            isPreview={true}
          />
        </div>
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
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold" style={{
                  background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Course Management
                </h1>
                <p className="text-[#93C5FD] text-lg mt-2">Manage and monitor your course content</p>
              </div>
            </div>

            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#93C5FD]" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                  }}
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}>
                  <SortAsc className="h-4 w-4 mr-2 text-[#93C5FD]" />
                  <span className="text-[#93C5FD]">Sort</span>
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(20px)",
                    }}>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#93C5FD] mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                        >
                          {sortOptions.map(option => (
                            <option key={option.value} value={option.value} className="bg-gray-800">{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#93C5FD] mb-2">Order</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSortOrder('asc')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              sortOrder === 'asc' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            Asc
                          </button>
                          <button
                            onClick={() => setSortOrder('desc')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              sortOrder === 'desc' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            Desc
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={resetSort}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setSortOpen(false)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                          style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-3xl font-bold text-white">{courses.length}</p>
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
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{stats.totalDuration}h</p>
                  <p className="text-sm text-[#93C5FD]">Total Duration</p>
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
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
                  <p className="text-sm text-[#93C5FD]">Total Videos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id} className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
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
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#3B82F6] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[#93C5FD] line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-[#93C5FD]">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration || 0}h</span>
                    </div>
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-1" />
                      <span>{normalizeVideos(course).length} videos</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handlePreview(course)}
                      className="flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#3B82F6",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                      }}>
                      <Eye className="h-4 w-4 mr-2 inline" />
                      Preview
                    </button>
                    <button
                      onClick={() => startEditing(course)}
                      className="flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                      }}>
                      <Edit className="h-4 w-4 mr-2 inline" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 py-2 px-4 rounded-xl font-medium bg-red-500 hover:bg-red-600 transition-all duration-300 hover:scale-105">
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Edit Modal */}
        {editingCourseId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Course</h3>
                <button onClick={cancelEditing} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#93C5FD] mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#93C5FD] mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter course description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#93C5FD] mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter duration in hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#93C5FD] mb-2">
                    Videos
                  </label>
                  <div className="space-y-4">
                    {editVideos.map((video, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <Video className="h-5 w-5 text-[#93C5FD]" />
                          <span className="text-white">{video.title}</span>
                        </div>
                        <button
                          onClick={() => removeVideoFromEdit(idx)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-lg border border-dashed border-white/20">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter video title"
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        className="w-full text-[#93C5FD]"
                      />
                      {uploadError && (
                        <p className="text-red-500 text-sm">{uploadError}</p>
                      )}
                      <button
                        onClick={uploadVideo}
                        disabled={uploading}
                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                        }}
                      >
                        {uploading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Uploading...
                          </div>
                        ) : (
                          "Upload Video"
                        )}
                      </button>
                      {uploading && (
                        <div className="space-y-2">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-[#93C5FD]">
                            <span>{uploadProgress}%</span>
                            <span>{uploadSpeed}</span>
                            <span>{timeLeft}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={saveEdit}
                    disabled={editSaving}
                    className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                    }}
                  >
                    {editSaving ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 py-3 px-4 rounded-xl font-medium bg-red-500 hover:bg-red-600 transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminCourseList
