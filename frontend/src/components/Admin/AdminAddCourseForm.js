"use client"

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Upload, X, Plus, Check, FileVideo, Clock, AlertCircle } from "lucide-react"

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

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center mb-8">
    {Array.from({ length: totalSteps }, (_, i) => (
      <React.Fragment key={i}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            i + 1 <= currentStep
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {i + 1 <= currentStep ? <Check className="h-5 w-5" /> : i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div
            className={`w-16 h-1 mx-3 rounded-full transition-all duration-300 ${
              i + 1 < currentStep ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-200"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
)

const AdminAddCourseForm = ({ onCourseAdded }) => {
  const navigate = useNavigate()

  // Authentication & Role Check on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userJSON = localStorage.getItem("user")

    if (!token || !userJSON) {
      alert("Please login first.")
      navigate("/login")
      return
    }

    try {
      const user = JSON.parse(userJSON)
      if (user.role !== "admin") {
        alert("Access denied. Admins only.")
        navigate("/")
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      navigate("/login")
    }
  }, [navigate])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")

  // Sections state (with videos nested inside)
 const [sections, setSections] = useState([
  {
    title: "Default Section Title",  // Set default non-empty title here
    description: "",
    videos: [],
  }
])


  // Upload state
  const [videoTitle, setVideoTitle] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState("0 B/s")
  const [errorMessage, setErrorMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState("Calculating...")
  const [step, setStep] = useState(1)

  const fileInputRef = useRef(null)

  // Flatten all videos from all sections for easy access
  const allVideos = sections.flatMap(section => section.videos || [])

  const canProceedToVideos = title.trim() && description.trim() && duration > 0

  // File selection handlers
  const handleFileSelect = (file) => {
    if (!file.type.startsWith("video/")) {
      setErrorMessage("Only video files are allowed.")
      return
    }
    setErrorMessage("")
    setVideoFile(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  // Add uploaded video to first section by default
  const addVideoToSection = (video) => {
  setSections(prevSections => {
    if (!video.title || !video.videoUrl) {
  console.error("Invalid video object:", video)
  return
}

    const updatedSections = prevSections.map((section, index) => {
      if (index === 0) {
        return {
          ...section,
          videos: [...(section.videos || []), {
            title: video.title,
            videoUrl: video.videoUrl,
            description: "",
            duration: 0,
            isPreview: false,
          }]
        }
      }
      return section
    })
    return updatedSections
  })
}




  // Upload video with real-time progress & speed
  const uploadVideo = async () => {
    if (!videoFile || !videoTitle.trim()) {
      setErrorMessage("Please provide a video title and select a video file.")
      return
    }
    setErrorMessage("")
    setUploading(true)
    setUploadProgress(0)
    setUploadSpeed("0 B/s")
    setTimeLeft("Calculating...")

    const formData = new FormData()
    formData.append("video", videoFile)

    let lastLoaded = 0
    let lastTime = Date.now()
    let finalSpeedDisplayed = false
    const uploadStartTime = Date.now()

    try {
      const token = localStorage.getItem("token")

      const res = await axios.post("http://localhost:1111/api/v1/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent
          const percentCompleted = Math.round((loaded * 100) / total)
          setUploadProgress(percentCompleted)

          const now = Date.now()
          const deltaBytes = loaded - lastLoaded
          const deltaTime = (now - lastTime) / 1000

          if (percentCompleted < 100) {
            if (deltaTime > 0) {
              const speedBps = deltaBytes / deltaTime
              let speedDisplay
              if (speedBps > 1e6) speedDisplay = (speedBps / 1e6).toFixed(2) + " MB/s"
              else if (speedBps > 1e3) speedDisplay = (speedBps / 1e3).toFixed(2) + " KB/s"
              else speedDisplay = speedBps.toFixed(2) + " B/s"

              setUploadSpeed(speedDisplay)

              const bytesLeft = total - loaded
              const secondsLeft = bytesLeft / speedBps
              setTimeLeft(formatTime(secondsLeft))
            }
          } else if (!finalSpeedDisplayed) {
            const totalTimeSecs = (now - uploadStartTime) / 1000
            const avgSpeed = total / totalTimeSecs
            let avgSpeedStr = "0 B/s"
            if (avgSpeed > 1e6) avgSpeedStr = (avgSpeed / 1e6).toFixed(2) + " MB/s"
            else if (avgSpeed > 1e3) avgSpeedStr = (avgSpeed / 1e3).toFixed(2) + " KB/s"
            else avgSpeedStr = avgSpeed.toFixed(2) + " B/s"

            setUploadSpeed(avgSpeedStr)
            setTimeLeft("Upload complete")
            finalSpeedDisplayed = true
          }

          lastLoaded = loaded
          lastTime = now
        },
        timeout: 0,
      })

      addVideoToSection({
  title: videoTitle.trim(),
  videoUrl: res.data.videoUrl,
})


      setVideoFile(null)
      setVideoTitle("")
      setStep(3)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Video upload failed. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadSpeed("0 B/s")
      setTimeLeft("Calculating...")
    }
  }

  // Remove video by index from first section
  const removeVideo = (index) => {
    setSections(prevSections => {
      const updatedSections = [...prevSections]
      if (updatedSections[0].videos) {
        updatedSections[0].videos = updatedSections[0].videos.filter((_, i) => i !== index)
      }
      return updatedSections
    })
  }

  // Submit course to backend
  const handleSubmitCourse = async () => {
    if (!canProceedToVideos) {
      setErrorMessage("Please fill all course details.")
      setStep(1)
      return
    }
    if (allVideos.length === 0) {
      setErrorMessage("Please upload at least one video.")
      setStep(2)
      return
    }

    setErrorMessage("")
    setUploading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await axios.post(
        "http://localhost:1111/api/v1/courses/create",
        {
          title: title.trim(),
          description: description.trim(),
          duration: Number(duration),
          sections,
          
          // instructor: instructor.trim(),
          // price: Number(price),
          // category: category.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Course created successfully!")
      if (onCourseAdded) onCourseAdded(response.data)
      resetForm()
    } catch (error) {
      console.error("Create course error:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      }
      setErrorMessage(error.response?.data?.message || "Course creation failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDuration("")
    setSections([
      {
        title: "",
        description: "",
        videos: [],
      }
    ])
    setStep(1)
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Course
          </h2>
          <p className="text-gray-600 text-lg">Let's start by setting up your course details</p>
        </div>

        <StepIndicator currentStep={1} totalSteps={4} />

        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter an engaging course title"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Describe what students will learn in this course"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Duration (hours)</label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Estimated course duration"
              disabled={uploading}
            />
          </div>

          {errorMessage && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <button
            disabled={!canProceedToVideos || uploading}
            onClick={() => setStep(2)}
            className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
              canProceedToVideos && !uploading
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Next: Upload Videos
          </button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Upload Course Videos
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {allVideos.length} video{allVideos.length !== 1 ? "s" : ""} uploaded
            </span>
          </div>
        </div>

        <StepIndicator currentStep={2} totalSteps={4} />

        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Video Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              disabled={uploading}
            />
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileVideo className="h-10 w-10 text-blue-600" />
              </div>
              {videoFile ? (
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{videoFile.name}</p>
                  <p className="text-gray-500">{formatBytes(videoFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-gray-900">Drop your video here</p>
                  <p className="text-gray-500">or click to browse files</p>
                  <p className="text-sm text-gray-400 mt-2">Supports MP4, MOV, AVI and more</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={onFileChange}
              hidden
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-900">Uploading...</span>
                <span className="text-blue-600 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-blue-700">
                <span>Speed: {uploadSpeed}</span>
                <span>Time left: {timeLeft}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={uploadVideo}
              disabled={uploading || !videoFile || !videoTitle.trim()}
              className={`flex-1 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                uploading || !videoFile || !videoTitle.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
              }`}
            >
              <Upload className="h-5 w-5 mr-2 inline" />
              {uploading ? "Uploading..." : "Upload Video"}
            </button>

            <button
              onClick={() => {
                if (allVideos.length === 0) return alert("Please upload at least one video.")
                setStep(3)
              }}
              disabled={uploading}
              className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              Continue
            </button>
          </div>

          {allVideos.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Uploaded Videos</h3>
              <div className="space-y-3 max-h-48 overflow-auto">
                {allVideos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{v.title}</span>
                    </div>
                    <button
                      onClick={() => removeVideo(i)}
                      disabled={uploading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove video"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Add More Videos?
          </h2>
        </div>

        <StepIndicator currentStep={3} totalSteps={4} />

        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold mb-4 text-gray-900">Video uploaded successfully!</p>
            <p className="text-gray-600 text-lg">Would you like to add another video to your course?</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 rounded-xl bg-white border-2 border-blue-600 text-blue-600 font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2 inline" />
              Add Another Video
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Review & Submit
          </h2>
          <p className="text-gray-600 text-lg">Review your course details before publishing</p>
        </div>

        <StepIndicator currentStep={4} totalSteps={4} />

        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Course Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Title</p>
                  <p className="font-semibold text-blue-900">{title}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Duration</p>
                  <div className="flex items-center text-blue-900">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{duration} hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Videos</h3>
              <div className="flex items-center justify-center p-6 bg-green-100 rounded-xl">
                <FileVideo className="h-10 w-10 text-green-600 mr-4" />
                <div>
                  <p className="font-bold text-3xl text-green-600">{allVideos.length}</p>
                  <p className="text-sm text-green-700">video{allVideos.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Video List</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allVideos.map((video, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{video.title}</span>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 rounded-xl bg-yellow-100 text-yellow-800 font-semibold text-lg hover:bg-yellow-200 transition-all duration-300 transform hover:scale-105"
            >
              Add More Videos
            </button>
            <button
              onClick={handleSubmitCourse}
              disabled={uploading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {uploading ? "Creating Course..." : "Create Course"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AdminAddCourseForm
