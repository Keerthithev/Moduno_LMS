"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { useNavigate } from "react-router-dom"
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


  const navigate = useNavigate()
  useEffect(() => {
    // Check if user is admin on mount
    const user = JSON.parse(localStorage.getItem("user"))

    if (!user || user.role !== "admin") {
      alert("Access denied: Admins only")
      navigate("/login")  // or any other page
      return
    }

    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:1111/api/v1/courses")
      setCourses(res.data.data)
    } catch (error) {
      alert("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

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

 const filteredCourses = courses.filter((course) => {
  const title = course.title || ""
  const description = course.description || ""

  return (
    title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    description.toLowerCase().includes(searchTerm.toLowerCase())
  )
})


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-b-4 border-blue-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-lg">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Course Management
            </h1>
            <p className="text-gray-600 text-lg mt-2">Manage and monitor your course content</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-700">Filter</span>
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <SortAsc className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-700">Sort</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-sm text-gray-500">Total Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-500">Total Students</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((acc, course) => acc + (course.duration || 0), 0)}h
                </p>
                <p className="text-sm text-gray-500">Total Duration</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((acc, course) => acc + (course.videos?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Videos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 shadow-lg text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">No courses found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchTerm ? "Try adjusting your search terms" : "Create your first course to get started"}
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              <BookOpen className="h-5 w-5 mr-2 inline" />
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isEditing = editingCourseId === course._id

              return (
                <div
                  key={course._id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl"
                >
                  {isEditing ? (
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Course Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Course title"
                          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Course description"
                          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Duration (hours)</label>
                        <input
                          type="number"
                          min="1"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          placeholder="Duration"
                          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Videos Section */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Videos ({editVideos.length})
                        </label>
                        {editVideos.length > 0 && (
                          <div className="max-h-32 overflow-y-auto space-y-2">
                            {editVideos.map((video, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm truncate font-medium">{video.title}</span>
                                <button
                                  onClick={() => removeVideoFromEdit(idx)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video Upload */}
                      <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <label className="block text-sm font-semibold text-gray-700">Add New Video</label>
                        {uploadError && <p className="text-sm text-red-600 font-medium">{uploadError}</p>}
                        <input
                          type="text"
                          placeholder="Video title"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          disabled={uploading}
                          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files[0])}
                          disabled={uploading}
                          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {uploading && (
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Speed: {uploadSpeed}</span>
                              <span>{uploadProgress}%</span>
                              <span>Time left: {timeLeft}</span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={uploadVideo}
                          disabled={uploading || !videoFile || !videoTitle.trim()}
                          className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
                            uploading || !videoFile || !videoTitle.trim()
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105"
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2 inline" />
                          {uploading ? "Uploading..." : "Upload Video"}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={saveEdit}
                          disabled={editSaving}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                        >
                          <Check className="h-4 w-4 mr-2 inline" />
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={editSaving}
                          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                        >
                          <X className="h-4 w-4 mr-2 inline" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Course Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                            {course.videos?.length || 0} videos
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center space-x-2">
                            <Video className="h-5 w-5" />
                            <span className="text-sm font-medium">Course</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">{course.description}</p>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{course.duration || 0}h</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>0 students</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              onClick={() => {
                                setSelectedCourse(course)
                                setShowVideoModal(true)
                              }}
                              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </button>

                            <div className="relative">
                              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                              {/* Dropdown menu would go here */}
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => startEditing(course)}
                              className="flex-1 py-2 px-4 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors font-medium"
                            >
                              <Edit className="h-4 w-4 mr-2 inline" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="flex-1 py-2 px-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-2 inline" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

  {showVideoModal && selectedCourse && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div 
      className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{selectedCourse.title} - Videos</h3>
        <button
          onClick={() => setShowVideoModal(false)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Get all videos from course */}
      {(() => {
        // Method to extract all videos regardless of structure
        const getAllVideos = (course) => {
          let videos = [];
          
          // Check flat videos array first
          if (course.videos && Array.isArray(course.videos)) {
            videos = [...course.videos];
          }
          
          // Check sections for nested videos
          if (course.sections && Array.isArray(course.sections)) {
            course.sections.forEach(section => {
              if (section.videos && Array.isArray(section.videos)) {
                videos = [...videos, ...section.videos];
              }
            });
          }
          
          return videos;
        };

        const videos = getAllVideos(selectedCourse);
        
        if (videos.length === 0) {
          return (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No videos uploaded yet.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {videos.map((video, idx) => (
              <div key={`video-${idx}`} className="bg-gray-50 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-gray-900">
                      {video.title || `Untitled Video ${idx + 1}`}
                    </h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Video {idx + 1}
                    </span>
                  </div>
                  {video.url || video.videoUrl ? (
                    <div className="relative aspect-video">
                      <video
                        src={video.url || video.videoUrl}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full rounded-xl shadow-lg"
                        poster={video.thumbnail}
                        onError={(e) => {
                          e.target.parentElement.innerHTML = `
                            <div class="bg-red-50 p-4 rounded-lg text-red-700 text-center">
                              Failed to load video: ${video.title || 'Untitled Video'}<br>
                              URL: ${video.url || video.videoUrl || 'None'}
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                      Video URL missing (needs either url or videoUrl property)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  </div>
)}      </div>
    </div>
  )
}

export default AdminCourseList
