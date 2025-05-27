"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Play,
  BookOpen,
  Clock,
  Video,
  CheckCircle,
  ChevronRight,
  Loader2,
  Bookmark,
  List,
  X,
  ChevronLeft,
  Pause,
  SkipBack,
  SkipForward,
  Shield,
  Eye,
} from "lucide-react"

// Simple Progress Bar Component
const ProgressBar = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

const CoursePlayer = ({ course, enrollment, user, onVideoComplete, onBack }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [showVideoList, setShowVideoList] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const [completedVideos, setCompletedVideos] = useState([])
  const [watchedPercentage, setWatchedPercentage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [isReviewMode, setIsReviewMode] = useState(false)
  const [securityWarnings, setSecurityWarnings] = useState(0)

  const videoRef = useRef(null)

  useEffect(() => {
    setHasMounted(true)
    setShowVideoList(true)
  }, [])

  useEffect(() => {
    if (enrollment?.progress) {
      setCurrentVideoIndex(enrollment.progress.currentVideoIndex || 0)
      const isCompleted = enrollment.progress.isCompleted || false
      setCourseCompleted(isCompleted)
      setIsReviewMode(isCompleted)
      setCompletedVideos(
        Array.isArray(enrollment.progress.completedVideos)
          ? enrollment.progress.completedVideos
          : []
      )
    }
  }, [course, enrollment])

  const currentVideo = course?.videos?.[currentVideoIndex]
  const progressPercentage = Math.round(
    (completedVideos.length / (course?.videos?.length || 1)) * 100
  )

  const markVideoCompleted = (index, isComplete = false) => {
    if (isReviewMode) return

    const newCompletedVideos = [...new Set([...completedVideos, index])]
    const isCourseComplete = isComplete || newCompletedVideos.length === course.videos.length

    setCompletedVideos(newCompletedVideos)

    if (isCourseComplete) {
      setCourseCompleted(true)
      setIsReviewMode(true)
    }

    onVideoComplete(index, isCourseComplete)
  }

  const handleProgress = (e) => {
    const video = e.target
    if (video.duration) {
      const percentage = Math.round((video.currentTime / video.duration) * 100)
      setWatchedPercentage(percentage)

      if (percentage >= 95 && !completedVideos.includes(currentVideoIndex) && !isReviewMode) {
        markVideoCompleted(currentVideoIndex)
      }
    }
  }

  const handleVideoEnd = () => {
    if (!completedVideos.includes(currentVideoIndex) && !isReviewMode) {
      const isLastVideo = currentVideoIndex === course.videos.length - 1
      markVideoCompleted(currentVideoIndex, isLastVideo)
    }
  }

  const navigateVideo = (direction) => {
    const newIndex = direction === "next" ? currentVideoIndex + 1 : currentVideoIndex - 1
    if (newIndex >= 0 && newIndex < course.videos.length) {
      setCurrentVideoIndex(newIndex)
      setWatchedPercentage(0)
      setIsPlaying(false)
    }
  }

  const canNavigate = (direction) => {
    if (direction === "prev") return currentVideoIndex > 0
    if (direction === "next") {
      if (currentVideoIndex >= course.videos.length - 1) return false
      if (isReviewMode) return true
      return completedVideos.includes(currentVideoIndex)
    }
    return true
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (!course || !course.videos || course.videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
          <p className="text-gray-600 mb-6">This course doesn't contain any video content yet.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  if (!currentVideo || !currentVideo.url) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <p className="text-red-600 font-semibold">
          Video URL is missing for this lesson.
        </p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">
          Back to Courses
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warning */}
      {securityWarnings > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">
              Security Notice: Tab switching detected ({securityWarnings} times). Please focus on your learning.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </button>
          <div className="hidden md:block">
            <h1 className="font-semibold text-lg text-gray-900">{course.title}</h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                Lesson {currentVideoIndex + 1} of {course.videos.length}
              </p>
              {isReviewMode && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Eye className="h-3 w-3 mr-1" />
                  Review Mode
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <ProgressBar value={progressPercentage} className="w-32" />
            <span className="text-sm text-gray-500 min-w-[3rem]">{progressPercentage}%</span>
          </div>

          <button
            onClick={() => setShowVideoList(!showVideoList)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <List className="h-4 w-4 mr-2" />
            Contents
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Video List */}
        {hasMounted && showVideoList && (
          <div className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Course Content</h2>
                <button onClick={() => setShowVideoList(false)} className="text-gray-500 hover:text-gray-700 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ProgressBar value={progressPercentage} />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>
                  {completedVideos.length} of {course.videos.length} completed
                </span>
                <span>{progressPercentage}%</span>
              </div>
              {isReviewMode && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">✓ Course Completed - Review Mode Active</p>
                </div>
              )}
            </div>

            <div className="p-2">
              {course.videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors mb-1 ${
                    index === currentVideoIndex
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {completedVideos.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <span className="truncate font-medium">{video.title}</span>
                  {isReviewMode && <Eye className="h-4 w-4 text-gray-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Video Player */}
        <div className="flex-1">
          <div className="bg-black aspect-video relative">
            {/* Security Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                🔒 Protected Content
              </div>
            </div>

            <video
              ref={videoRef}
              src={currentVideo.url}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              className="w-full h-full"
              onTimeUpdate={handleProgress}
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => setWatchedPercentage(0)}
              style={{ userSelect: "none" }}
            />
          </div>

          {/* Video Controls */}
          <div className="bg-white p-6 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{currentVideo.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Video {currentVideoIndex + 1} of {course.videos.length}
                    </span>
                    <span>•</span>
                    <span>{watchedPercentage}% watched</span>
                    {isReviewMode && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">✓ Completed</span>
                      </>
                    )}
                  </div>
                </div>

                {!isReviewMode && !completedVideos.includes(currentVideoIndex) && (
                  <div className="text-right">
                    <p className="text-sm text-orange-600 font-medium">Watch 95% to complete</p>
                    <div className="w-24 mt-1">
                      <ProgressBar value={watchedPercentage} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateVideo("prev")}
                  disabled={!canNavigate("prev")}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    canNavigate("prev")
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  onClick={() => navigateVideo("next")}
                  disabled={!canNavigate("next")}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    canNavigate("next")
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </button>
              </div>

              {!isReviewMode && !canNavigate("next") && currentVideoIndex < course.videos.length - 1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Complete this video to unlock the next lesson.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StudentCourseList = () => {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("enrolled")
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const userJSON = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!userJSON || !token) return

    const userObj = JSON.parse(userJSON)
    if (!userObj?.id) return

    setUser(userObj)

    const savedFavorites = localStorage.getItem(`favorites_${userObj.id}`)
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    Promise.all([fetchCourses(), fetchEnrollments(userObj.id)]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (enrollments.length > 0) {
      const completed = enrollments.filter((e) => e.progress?.isCompleted).length
      setCompletedCoursesCount(completed)
    }
  }, [enrollments])

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
    }
  }, [favorites, user?.id])

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:1111/api/v1/courses")
      // Normalize videos: flatten sections videos into `videos` array with url field for each video
      const normalizedCourses = (res.data.data || []).map(course => {
        const videosFlat = (course.sections || []).flatMap(section =>
          (section.videos || []).map(video => ({
            ...video,
            url: video.url || video.videoUrl || "",
          }))
        )
        return { ...course, videos: videosFlat }
      })
      setCourses(normalizedCourses)
    } catch (error) {
      console.error("Failed to load courses:", error)
      setCourses([])
    }
  }

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

  const handleEnroll = async (courseId) => {
    if (!user) return

    setEnrolling(courseId)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      await axios.post(
        `http://localhost:1111/api/v1/enrollments/create`,
        { userId: user.id, courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      await fetchEnrollments(user.id)
      await fetchCourses()
      setActiveTab("enrolled")
      alert("Successfully enrolled in course!")
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("Failed to enroll in course")
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    } finally {
      setEnrolling(null)
    }
  }

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => {
      const isFavorited = prev.includes(courseId)
      if (isFavorited) {
        alert("Removed from favorites")
        return prev.filter((id) => id !== courseId)
      } else {
        alert("Added to favorites")
        return [...prev, courseId]
      }
    })
  }

  const updateProgress = async (courseId, videoIndex, isCourseComplete = false) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const enrollment = getEnrollment(courseId)
      if (!enrollment?._id) throw new Error("No enrollment found")

      const update = {
        progress: {
          currentVideoIndex: videoIndex,
          completedVideos: [...new Set([...(enrollment.progress?.completedVideos || []), videoIndex])],
          isCompleted: isCourseComplete,
        },
      }

      await axios.put(`http://localhost:1111/api/v1/enrollments/${enrollment._id}`, update, {
        headers: { Authorization: `Bearer ${token}` },
      })

      await fetchEnrollments(user.id)
    } catch (error) {
      console.error("Progress update error:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }

  const isEnrolled = (courseId) => {
    return enrollments.some((e) => {
      const courseRef = e.course?._id || e.course || e.courseId
      return courseRef?.toString() === courseId?.toString()
    })
  }

  const getEnrollment = (courseId) => {
    return enrollments.find((e) => {
      const courseRef = e.course?._id || e.course || e.courseId
      return courseRef?.toString() === courseId?.toString()
    })
  }

  const getProgressPercentage = (courseId) => {
    const enrollment = getEnrollment(courseId)
    const course = courses.find((c) => c._id.toString() === courseId.toString())
    if (!enrollment || !course) return 0
    const completedVideos = enrollment.progress?.completedVideos || []
    return Math.round((completedVideos.length / (course.videos?.length || 1)) * 100)
  }

  const startCourse = (course) => {
    // Course already has videos array normalized from fetchCourses
    setSelectedCourse(course)
  }

  if (selectedCourse) {
    const enrollment = getEnrollment(selectedCourse._id)
    return (
      <CoursePlayer
        course={selectedCourse}
        enrollment={enrollment}
        user={user}
        onVideoComplete={(videoIndex, isComplete) => updateProgress(selectedCourse._id, videoIndex, isComplete)}
        onBack={() => setSelectedCourse(null)}
      />
    )
  }

  const enrolledCourses = enrollments
    .map((enrollment) => {
      if (!enrollment.course) return null
      const courseId = typeof enrollment.course === "string" ? enrollment.course : enrollment.course._id.toString()
      const course = courses.find((c) => c._id.toString() === courseId)
      return course ? { ...course, enrollment } : null
    })
    .filter(Boolean)

  const availableCourses = courses.filter((course) => !isEnrolled(course._id))
  const favoriteCourses = courses.filter((course) => favorites.includes(course._id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Portal</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700 p-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t">
          <div className="px-4 py-2">
            {["enrolled", "available", "favorites"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-md font-medium capitalize ${
                  activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab === "enrolled" ? "My Courses" : tab === "available" ? "Available Courses" : "Favorites"}
                {tab === "enrolled" && enrolledCourses.length > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {enrolledCourses.length}
                  </span>
                )}
                {tab === "available" && availableCourses.length > 0 && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                    {availableCourses.length}
                  </span>
                )}
                {tab === "favorites" && favorites.length > 0 && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Tabs */}
        <div className="hidden md:block mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "enrolled", label: "My Courses", count: enrolledCourses.length },
                { key: "available", label: "Available Courses", count: availableCourses.length },
                { key: "favorites", label: "Favorites", count: favorites.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                        activeTab === tab.key
                          ? "bg-blue-100 text-blue-800"
                          : tab.key === "favorites"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Course Content */}
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
                  const progressPercentage = getProgressPercentage(course._id)
                  const isCompleted = course.enrollment?.progress?.isCompleted
                  const isFavorited = favorites.includes(course._id)

                  return (
                    <div
                      key={course._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                        <div className="absolute inset-0 bg-black bg-opacity-20" />
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4" />
                            <span className="text-sm font-medium">Continue Learning</span>
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" /> Completed
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>{course.duration || 0}h</span>
                            </div>
                            <div className="flex items-center">
                              <Video className="h-4 w-4 mr-1.5" />
                              <span>{course.videos?.length || 0} lessons</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2 text-sm">
                              <span className="font-medium text-gray-700">Your progress</span>
                              <span className="text-gray-500">{progressPercentage}%</span>
                            </div>
                            <ProgressBar value={progressPercentage} />
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
                            className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isCompleted ? "Review" : progressPercentage > 0 ? "Continue" : "Start"}
                          </button>
                          <button
                            onClick={() => toggleFavorite(course._id)}
                            className={`p-2 rounded-md transition-colors ${
                              isFavorited
                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : activeTab === "available" ? (
            availableCourses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
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
                  const isEnrollingThis = enrolling === course._id
                  const isFavorited = favorites.includes(course._id)

                  return (
                    <div
                      key={course._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-green-500 to-blue-600">
                        <div className="absolute inset-0 bg-black bg-opacity-20" />
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm font-medium">New Course</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">{course.title}</h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>

                        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>{course.duration || 0}h</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1.5" />
                            <span>{course.videos?.length || 0} lessons</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEnroll(course._id)}
                            disabled={isEnrollingThis}
                            className="flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                          >
                            {isEnrollingThis ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Enroll Now
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => toggleFavorite(course._id)}
                            className={`p-2 rounded-md transition-colors ${
                              isFavorited
                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : favoriteCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No favorite courses</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Mark courses as favorites by clicking the bookmark icon. Your favorites will appear here.
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
              {favoriteCourses.map((course) => {
                const isEnrolledCourse = isEnrolled(course._id)
                const enrollment = getEnrollment(course._id)
                const progressPercentage = getProgressPercentage(course._id)
                const isCompleted = enrollment?.progress?.isCompleted
                const isFavorited = favorites.includes(course._id)

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-yellow-500 to-yellow-600">
                      <div className="absolute inset-0 bg-black bg-opacity-20" />
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <div className="flex items-center space-x-2">
                          <Bookmark className="h-4 w-4" />
                          <span className="text-sm font-medium">Favorite</span>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-gray-600 line-clamp-3 mb-4">{course.description}</p>

                      {isEnrolledCourse && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="font-medium text-gray-700">Your progress</span>
                            <span className="text-gray-500">{progressPercentage}%</span>
                          </div>
                          <ProgressBar value={progressPercentage} />
                        </div>
                      )}

                      <div className="flex space-x-3">
                        {isEnrolledCourse ? (
                          <button
                            onClick={() => startCourse(course)}
                            className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-50"
                                : "bg-yellow-600 text-white hover:bg-yellow-700"
                            }`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isCompleted ? "Review" : progressPercentage > 0 ? "Continue" : "Start"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course._id)}
                            disabled={enrolling === course._id}
                            className="flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                          >
                            {enrolling === course._id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Enroll Now
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => toggleFavorite(course._id)}
                          className={`p-2 rounded-md transition-colors ${
                            isFavorited
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default StudentCourseList
