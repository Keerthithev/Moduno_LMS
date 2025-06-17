"use client"

import React, { useState, useEffect, useRef, useContext } from "react"
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
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ChevronRight,
  Clock,
  Video,
  BookOpen,
  RotateCcw,
  Loader2,
  Award
} from "lucide-react"
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../context/AuthContext'

// Simple Progress Bar Component
const ProgressBar = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

const CoursePlayer = ({ course, enrollment, initialVideo, onBack, onVideoComplete, onProgressUpdate }) => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [currentVideo, setCurrentVideo] = useState(initialVideo)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)
  const [videoDurations, setVideoDurations] = useState({})
  const [courseProgress, setCourseProgress] = useState(0)
  const [completedVideos, setCompletedVideos] = useState([])
  const [buffering, setBuffering] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(null)
  const autoPlayTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  // Add user context
  const { user: authUser } = useContext(AuthContext);

  // Initialize state from enrollment data
  useEffect(() => {
    if (enrollment?.progress) {
      console.log("Initializing player from enrollment:", enrollment.progress);
      
      // Set completed videos
      const completed = enrollment.progress.completedVideos || [];
      setCompletedVideos(completed);
      console.log("Setting completed videos:", completed);
      
      // Calculate course progress
      if (course?.videos) {
        const progress = Math.round(
          (completed.length / course.videos.length) * 100
        );
        setCourseProgress(progress);
        console.log("Set initial course progress:", progress);
      }

      // Set current video progress if it's completed
      const currentVideoIndex = course.videos.indexOf(currentVideo);
      if (completed.includes(currentVideoIndex)) {
        setProgress(100);
        console.log("Current video is completed, setting progress to 100");
      }
    }
  }, [enrollment, course, currentVideo]);

  // Add effect to sync completed videos whenever they change
  useEffect(() => {
    if (enrollment?.progress?.completedVideos) {
      const completed = enrollment.progress.completedVideos;
      console.log("Syncing completed videos:", completed);
      setCompletedVideos(completed);
      
      // Update progress for current video if it's completed
      const currentVideoIndex = course?.videos?.indexOf(currentVideo);
      if (currentVideoIndex !== -1 && completed.includes(currentVideoIndex)) {
        setProgress(100);
      }
    }
  }, [enrollment?.progress?.completedVideos, currentVideo, course]);

  // Handle video loading states
  const handleWaiting = () => {
    console.log("Video buffering...")
    setBuffering(true)
  }

  const handleCanPlay = () => {
    console.log("Video can play")
    setBuffering(false)
    setLoading(false)
    setNetworkError(false)
  }

  const handleError = (error) => {
    console.error("Video playback error:", error)
    setNetworkError(true)
    setBuffering(false)
    
    if (retryCount < maxRetries) {
      console.log(`Retrying playback (${retryCount + 1}/${maxRetries})...`)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
          setRetryCount(prev => prev + 1)
        }
      }, 2000) // Wait 2 seconds before retrying
    } else {
      toast.error("Video playback failed. Please check your network connection.")
    }
  }

  // Reset retry count when changing videos
  useEffect(() => {
    setRetryCount(0)
    setNetworkError(false)
  }, [currentVideo])

  // Monitor network state
  useEffect(() => {
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        console.log("Network connection lost")
        setNetworkError(true)
        if (videoRef.current) {
          videoRef.current.pause()
        }
        toast.error("Network connection lost. Please check your internet connection.")
      } else {
        console.log("Network connection restored")
        setNetworkError(false)
        if (videoRef.current && isPlaying) {
          videoRef.current.play().catch(console.error)
        }
      }
    }

    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)

    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
    }
  }, [isPlaying])

  // Clear all timeouts and intervals
  const clearAutoPlayTimers = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
      autoPlayTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setAutoPlayCountdown(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoPlayTimers()
    }
  }, [])

  // Update progress storage key to be user-specific
  const getProgressStorageKey = () => {
    return `course_progress_${authUser?._id}_${course?._id}`;
  };

  // Update handleTimeUpdate to track partial progress
  const handleTimeUpdate = () => {
    if (!videoRef.current || buffering || networkError) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    if (isNaN(currentTime) || isNaN(duration)) return;
    
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
    setDuration(duration);

    // Update progress every 5 seconds if we're past 1 second
    if (currentTime > 1) {
      const videoIndex = course.videos.indexOf(currentVideo);
      
      // Store partial progress
      const progressData = {
        userId: authUser?._id,
        courseId: course?._id,
        videoIndex,
        currentTime,
        lastUpdated: new Date().toISOString(),
        completed: completedVideos
      };

      // Save to localStorage with user-specific key
      localStorage.setItem(getProgressStorageKey(), JSON.stringify(progressData));

      // Update backend through parent component
      if (onProgressUpdate) {
        onProgressUpdate(videoIndex, currentTime);
      }
    }

    // Mark as complete at 95% to ensure we're really near the end
    if (progressPercent >= 95) {
      const videoIndex = course.videos.indexOf(currentVideo);
      if (!completedVideos.includes(videoIndex)) {
        console.log("Video reached 95% completion, marking as complete");
        saveVideoCompletion(videoIndex).catch(error => {
          console.error("Error saving video completion at 95%:", error);
        });
      }
    }
  };

  // Load saved progress on component mount
  useEffect(() => {
    if (!authUser?._id || !course?._id) return;

    try {
      const savedProgress = localStorage.getItem(getProgressStorageKey());
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Verify the data belongs to current user and course
        if (progressData.userId === authUser._id && 
            progressData.courseId === course._id) {
          
          // Restore completed videos
          if (Array.isArray(progressData.completed)) {
            setCompletedVideos(progressData.completed);
          }

          // If we're loading the same video, restore its progress
          const currentVideoIndex = course.videos.indexOf(currentVideo);
          if (currentVideoIndex === progressData.videoIndex && videoRef.current) {
            videoRef.current.currentTime = progressData.currentTime;
          }
        } else {
          // Clear invalid data
          localStorage.removeItem(getProgressStorageKey());
        }
      }
    } catch (error) {
      console.error("Error loading saved progress:", error);
      localStorage.removeItem(getProgressStorageKey());
    }
  }, [authUser?._id, course?._id, currentVideo]);

  // Clear progress on unmount
  useEffect(() => {
    return () => {
      // Only clear if user completes the course
      if (completedVideos.length === course?.videos?.length) {
        localStorage.removeItem(getProgressStorageKey());
      }
    };
  }, [completedVideos.length, course?.videos?.length]);

  // Update saveVideoCompletion to be more robust
  const saveVideoCompletion = async (videoIndex) => {
    if (!completedVideos.includes(videoIndex)) {
      try {
        console.log("Saving video completion for index:", videoIndex);
        
        // Create new array with current video added
        const newCompletedVideos = [...completedVideos, videoIndex];
        
        // Calculate if this completes the course
        const isAllCompleted = course?.videos && 
          newCompletedVideos.length === course.videos.length;
        
        console.log("Completion status:", {
          newCompletedVideos,
          totalVideos: course?.videos?.length || 0,
          isAllCompleted
        });

        // Update local state first
        setCompletedVideos(newCompletedVideos);
        
        // Update localStorage
        const progressData = {
          userId: authUser?._id,
          courseId: course?._id,
          videoIndex,
          currentTime: videoRef.current?.currentTime || 0,
          lastUpdated: new Date().toISOString(),
          completed: newCompletedVideos
        };
        localStorage.setItem(getProgressStorageKey(), JSON.stringify(progressData));
        
        // Calculate and update progress
        const newProgress = Math.round(
          (newCompletedVideos.length / (course?.videos?.length || 1)) * 100
        );
        setCourseProgress(newProgress);
        
        // Call parent completion handler
        if (onVideoComplete) {
          await onVideoComplete(videoIndex, isAllCompleted);
          console.log("Video completion saved successfully");
          
          if (isAllCompleted) {
            console.log("All videos completed, course finished!");
            toast.success("Congratulations! Course completed! 🎉");
            // Clear localStorage on course completion
            localStorage.removeItem(getProgressStorageKey());
          }
        }
      } catch (error) {
        console.error("Error saving video completion:", error);
        // Revert local state on error
        setCompletedVideos(prev => prev.filter(v => v !== videoIndex));
        setCourseProgress(prev => 
          Math.round((completedVideos.length / (course?.videos?.length || 1)) * 100)
        );
        toast.error("Failed to save progress. Please try again.");
      }
    }
  };

  // Update handleVideoEnded to include delay
  const handleVideoEnded = async () => {
    if (!course?.videos || !currentVideo) return;
    const videoIndex = course.videos.indexOf(currentVideo);
    console.log("Video ended naturally");
    
    // Mark current video as complete
    await handleVideoComplete(videoIndex, true);

    // Add a delay before proceeding
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for next video
    const nextVideo = getNextVideo();
    const isLastVideo = !nextVideo;
    
    console.log("Video end status:", {
      currentIndex: videoIndex,
      hasNextVideo: !!nextVideo,
      isLastVideo,
      autoPlayEnabled,
      completedVideos: completedVideos.length,
      totalVideos: course.videos.length
    });

    // Handle autoplay
    if (nextVideo && autoPlayEnabled) {
      console.log("Setting up autoplay for next video");
      setAutoPlayCountdown(10);
      
      // Clear any existing timers
      clearAutoPlayTimers();
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setAutoPlayCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timeout for actual video change
      autoPlayTimeoutRef.current = setTimeout(() => {
        clearAutoPlayTimers();
        selectVideo(nextVideo);
        
        // Try to play after a short delay to ensure video is loaded
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        }, 500);
      }, 10000);
    } else if (isLastVideo) {
      console.log("Last video completed");
    }
  };

  const handleProgress = ({ played, playedSeconds }) => {
    if (!course?.videos || !currentVideo) return;
    const videoIndex = course.videos.indexOf(currentVideo);

    // Only check completion if video hasn't been marked complete
    if (!completedVideos.includes(videoIndex)) {
      const completionThreshold = 0.95; // 95% completion threshold
      if (played >= completionThreshold) {
        console.log("Video reached completion threshold:", {
          played,
          threshold: completionThreshold,
          videoIndex: videoIndex
        });
        handleVideoComplete(videoIndex, true);
      }
    }

    // Update watch time regardless of completion
    if (onProgressUpdate && playedSeconds > 0) {
      onProgressUpdate(videoIndex, playedSeconds);
    }
  };

  const handleVideoComplete = async (videoIndex, isComplete) => {
    console.log("Video completed in CoursePlayer:", { videoIndex, isComplete });
    
    if (!completedVideos.includes(videoIndex)) {
      try {
        console.log("Saving video completion for index:", videoIndex);
        
        // Create new array with current video added
        const newCompletedVideos = [...completedVideos, videoIndex];
        
        // Calculate if this completes the course
        const isAllCompleted = course?.videos && 
          newCompletedVideos.length === course.videos.length;
        
        console.log("Completion status:", {
          newCompletedVideos,
          totalVideos: course?.videos?.length || 0,
          isAllCompleted
        });

        // Show completion popup
        toast.success(
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-lg font-semibold mb-1">Video Completed! 🎉</div>
            <div className="text-sm text-gray-200">
              Your progress is being saved...
            </div>
          </div>,
          {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        );

        // Update local state first
        setCompletedVideos(newCompletedVideos);
        
        // Add a delay before proceeding
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Notify parent component
        if (onVideoComplete) {
          await onVideoComplete(videoIndex, isComplete);
          
          if (isAllCompleted) {
            toast.success(
              <div className="flex flex-col items-center">
                <Award className="h-10 w-10 text-yellow-500 mb-2" />
                <div className="text-lg font-semibold mb-1">Congratulations! 🎉</div>
                <div className="text-sm text-gray-200">
                  You've completed the entire course!
                </div>
              </div>,
              {
                autoClose: 5000,
                position: "top-center",
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
              }
            );
          }
        }
      } catch (error) {
        console.error("Error in handleVideoComplete:", error);
        toast.error("Failed to save video progress");
      }
    }
  };

  // Cancel auto-play
  const cancelAutoPlay = () => {
    console.log("Auto-play cancelled by user")
    clearAutoPlayTimers()
    setAutoPlayEnabled(false)
    toast.info("Auto-play disabled. Click play on any video to resume watching.")
  }

  // Enable auto-play
  const enableAutoPlay = () => {
    setAutoPlayEnabled(true)
    toast.success("Auto-play enabled")
  }

  // Update video selection to maintain completion status
  const selectVideo = (video) => {
    console.log("Selecting video:", video);
    setLoading(true);
    clearAutoPlayTimers();
    
    const videoIndex = course.videos.indexOf(video);
    const isCompleted = completedVideos.includes(videoIndex);
    console.log("Video selection state:", { videoIndex, isCompleted, completedVideos });
    
    setCurrentVideo(video);
    setProgress(isCompleted ? 100 : 0);
    
    // Reset video position and preload
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.preload = "auto";
      videoRef.current.load();
    }
    
    // Auto-play the video unless it's already completed
    if (!isCompleted) {
      setIsPlaying(true);
      // Try to play after a short delay to ensure video is loaded
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(error => {
            console.error("Error auto-playing video:", error);
            setIsPlaying(false);
          });
        }
      }, 500);
    } else {
      setIsPlaying(false);
    }
  };

  // Add this helper function to get next video
  const getNextVideo = () => {
    if (!course?.videos || !currentVideo) return null
    const currentIndex = course.videos.indexOf(currentVideo)
    if (currentIndex < course.videos.length - 1) {
      return course.videos[currentIndex + 1]
    }
    return null
  }

  // Add debounce utility at the top level
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Debounced progress update function
  const debouncedProgressUpdate = useRef(
    debounce((videoIndex, currentTime) => {
      if (onProgressUpdate) {
        onProgressUpdate(videoIndex, currentTime)
      }
    }, 2000) // Update every 2 seconds at most
  ).current

  useEffect(() => {
    if (!course || !course.videos || course.videos.length === 0) {
      return
    }

    // If no initial video is provided, start with the first video
    if (!currentVideo) {
      setCurrentVideo(course.videos[0])
    }
  }, [course, currentVideo])

  useEffect(() => {
    // Calculate overall course progress
    if (course?.videos && enrollment?.progress?.completedVideos) {
      const progress = Math.round(
        (enrollment.progress.completedVideos.length / course.videos.length) * 100
      )
      setCourseProgress(progress)
    }
  }, [course, enrollment])

  // Update useEffect for enrollment changes
  useEffect(() => {
    if (enrollment?.progress?.completedVideos) {
      console.log("Updating completed videos from enrollment:", enrollment.progress.completedVideos);
      setCompletedVideos(enrollment.progress.completedVideos);
    }
  }, [enrollment?.progress?.completedVideos]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setProgress(0)
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value)
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value
    }
    setIsMuted(value === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      setVolume(isMuted ? 1 : 0)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setVideoDurations(prev => ({
        ...prev,
        [currentVideo.url]: duration
      }))
      setDuration(duration)

      // Set video playback quality
      if (videoRef.current.videoHeight >= 720) {
        videoRef.current.playbackQuality = "high"
      }
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "white",
    }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="dark"
      />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Progress */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
          <button
            onClick={onBack}
              className="flex items-center px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}>
              <ChevronLeft className="h-5 w-5 mr-2 text-[#93C5FD]" />
              <span className="text-[#93C5FD]">Back to Course</span>
          </button>
            <div className="flex items-center space-x-2">
              <span className="text-[#93C5FD]">Course Progress:</span>
              <span className="text-white font-bold">{courseProgress}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${courseProgress}%`,
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
              }}>
              {currentVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentVideo.url}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onLoadedMetadata={handleLoadedMetadata}
                    onWaiting={handleWaiting}
                    onCanPlay={handleCanPlay}
                    onError={(e) => handleError(e)}
                    onClick={handlePlayPause}
                    playsInline // Better mobile support
                    preload="auto" // Enable preloading
                  />

                  {/* Loading/Buffering Overlay */}
                  {(loading || buffering) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        <p className="mt-2 text-white">
                          {loading ? "Loading video..." : "Buffering..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Network Error Overlay */}
                  {networkError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="flex flex-col items-center p-6 rounded-lg bg-red-500/20">
                        <X className="h-12 w-12 text-red-500 mb-2" />
                        <p className="text-white text-center">
                          Network error occurred.
                          <br />
                          Please check your connection.
                        </p>
                        {retryCount < maxRetries && (
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.load()
                                setRetryCount(prev => prev + 1)
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Retry Playback
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Progress Bar */}
                    <div
                      className="relative h-1 mb-4 cursor-pointer rounded-full overflow-hidden"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const clickedProgress = (x / rect.width) * 100
                        if (videoRef.current) {
                          videoRef.current.currentTime = (clickedProgress / 100) * videoRef.current.duration
                        }
                      }}
                      style={{ background: "rgba(255, 255, 255, 0.2)" }}
                    >
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white" />
                          )}
                        </button>

                        <button
                          onClick={handleRestart}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <RotateCcw className="h-6 w-6 text-white" />
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleMute}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                          >
                            {isMuted ? (
                              <VolumeX className="h-5 w-5 text-white" />
                            ) : (
                              <Volume2 className="h-5 w-5 text-white" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20"
                          />
                        </div>

                        <div className="text-sm text-white">
                          <span>{formatDuration(videoRef.current?.currentTime || 0)}</span>
                          <span> / </span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {isFullscreen ? (
                            <Minimize className="h-5 w-5 text-white" />
                          ) : (
                            <Maximize className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <p className="text-[#93C5FD]">Loading video...</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            {currentVideo && (
              <div className="rounded-2xl p-6 space-y-4"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(20px)",
                }}>
                <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
                <p className="text-[#93C5FD]">{currentVideo.description}</p>
                <div className="flex items-center space-x-4 text-sm text-[#93C5FD]">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duration: {formatDuration(videoDurations[currentVideo.url])}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video List */}
          <div className="rounded-2xl p-6 space-y-6"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
            }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Course Content</h3>
              <div className="flex items-center space-x-2 text-[#93C5FD] text-sm">
                <Video className="h-4 w-4" />
                <span>{course?.videos?.length || 0} videos</span>
              </div>
            </div>

            <div className="space-y-3">
              {course?.videos?.map((video, index) => {
                const isCompleted = completedVideos.includes(index)
                const isCurrent = currentVideo?.url === video.url
                const videoDuration = videoDurations[video.url]
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentVideo(video)}
                    className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 text-left ${
                      isCurrent
                        ? "bg-[#3B82F6]/20 border border-[#3B82F6]/30"
                        : isCompleted
                        ? "bg-green-500/10 border border-green-500/30"
                        : "hover:bg-white/5"
                    }`}
                    style={{
                      background: isCurrent
                        ? "rgba(59, 130, 246, 0.1)"
                        : isCompleted
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: isCurrent
                        ? "1px solid rgba(59, 130, 246, 0.3)"
                        : isCompleted
                        ? "1px solid rgba(16, 185, 129, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isCurrent ? (
                          <Play className="h-5 w-5 text-[#3B82F6]" />
                        ) : (
                          <Video className="h-5 w-5 text-[#93C5FD]" />
                        )}
                        <div className="flex flex-col">
                          <span className={`font-medium ${
                            isCurrent ? "text-[#3B82F6]" : isCompleted ? "text-green-500" : "text-white"
                          }`}>
                            {video.title}
                          </span>
                          <span className="text-sm text-[#93C5FD]">
                            {formatDuration(videoDuration)}
                          </span>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                          Completed
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Auto-play countdown overlay */}
        {autoPlayCountdown && (
          <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-4 text-white flex items-center space-x-4">
            <div>
              <p>Next video in {autoPlayCountdown}s</p>
            </div>
            <button
              onClick={cancelAutoPlay}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add auto-play toggle in video controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={autoPlayEnabled ? cancelAutoPlay : enableAutoPlay}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoPlayEnabled 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            Auto-play: {autoPlayEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayer