"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  CheckCircle,
  ChevronLeft,
  List,
  X,
  Play,
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
  const [needsInteraction, setNeedsInteraction] = useState(false)

  const videoRef = useRef(null)

  // Enhanced Security: Block all known screenshot and screen recording methods
  useEffect(() => {
    let warningCount = 0

    // Block keyboard shortcuts for screenshots and screen recording
    const handleKeyDown = (e) => {
      // Windows/Linux screenshot keys
      const isWindowsScreenshot = e.key === "PrintScreen" || 
                                (e.ctrlKey && e.key === "PrintScreen") ||
                                (e.shiftKey && e.key === "PrintScreen")

      // macOS screenshot keys
      const isMacScreenshot = (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) ||
                             (e.metaKey && e.ctrlKey && e.shiftKey && e.key === "4")

      // Screen recording keys
      const isScreenRecording = (e.metaKey && e.ctrlKey && e.key === "5")

      // Developer tools keys
      const isDevTools = (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
                         (e.ctrlKey && e.key.toUpperCase() === "U") ||
                         e.key === "F12"

      if (isWindowsScreenshot || isMacScreenshot || isScreenRecording || isDevTools) {
        e.preventDefault()
        warningCount++
        setSecurityWarnings(warningCount)
        alert("Screenshots and screen recording are disabled to protect course content.")
        
        if (warningCount >= 3) {
          alert("Multiple security violations detected. Please focus on your learning.")
        }
      }
    }

    // Block right-click menu
    const handleContextMenu = (e) => {
      e.preventDefault()
      alert("Right-click is disabled to protect course content.")
    }

    // Block text selection
    const preventSelect = (e) => e.preventDefault()

    // Block drag/drop of content
    const preventDrag = (e) => e.preventDefault()

    // Block clipboard manipulation
    const handleCopy = (e) => {
      e.preventDefault()
      alert("Copying content is disabled to protect course materials.")
    }

    // Block print screen via keyboard
    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen") {
        e.preventDefault()
        alert("Screenshots are disabled to protect course content.")
      }
    }

    // Add all event listeners
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", preventSelect)
    document.addEventListener("dragstart", preventDrag)
    document.addEventListener("copy", handleCopy)

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", preventSelect)
      document.removeEventListener("dragstart", preventDrag)
      document.removeEventListener("copy", handleCopy)
    }
  }, [])

  // Detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSecurityWarnings(prev => {
          const newCount = prev + 1
          if (newCount >= 3) {
            alert("Multiple tab switches detected. For security purposes, please focus on your learning.")
          }
          return newCount
        })
        
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    setHasMounted(true)
    setShowVideoList(true)
  }, [])

  // Initialize from enrollment data
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

  // Attempt to auto-play when video changes
  useEffect(() => {
    if (videoRef.current && course?.videos?.[currentVideoIndex]) {
      videoRef.current.load()
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setNeedsInteraction(false)
        })
        .catch(error => {
          console.log("Auto-play prevented:", error)
          setIsPlaying(false)
          setNeedsInteraction(true)
        })
    }
  }, [currentVideoIndex, course])

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
    if (!videoRef.current) {
      console.error("Video element not found")
      return
    }

    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setNeedsInteraction(false)
        })
        .catch(error => {
          console.error("Playback failed:", error)
          setNeedsInteraction(true)
          alert("Please click the play button to start the video")
        })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warning */}
      {securityWarnings > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">
              Security Notice: Suspicious activity detected ({securityWarnings} times). Please focus on your learning.
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
                  onClick={() => {
                    setCurrentVideoIndex(index)
                    setWatchedPercentage(0)
                  }}
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

            {/* Play overlay when interaction is needed */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                onClick={togglePlayPause}
              >
                <div className="p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src={currentVideo.url}
              controls={false}
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

              {needsInteraction && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Click the play button to start the video</p>
                </div>
              )}

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

export default CoursePlayer