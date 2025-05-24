import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatTime = (seconds) => {
  if (seconds === Infinity || isNaN(seconds)) return "Calculating...";
  if (seconds <= 0) return "Almost done";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
};

const AdminAddCourseForm = ({ onCourseAdded }) => {
  const navigate = useNavigate();

  // Authentication & Role Check on mount
  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    if (!userJSON) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    const user = JSON.parse(userJSON);
    if (user.role !== "admin") {
      alert("Access denied. Admins only.");
      navigate("/");
      return;
    }
  }, [navigate]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [videos, setVideos] = useState([]);

  // Upload state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("0 B/s");
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("Calculating...");

  const [step, setStep] = useState(1);

  const fileInputRef = useRef(null);

  const canProceedToVideos = title.trim() && description.trim() && duration > 0;

  // File selection handlers
  const handleFileSelect = (file) => {
    if (!file.type.startsWith("video/")) {
      setErrorMessage("Only video files are allowed.");
      return;
    }
    setErrorMessage("");
    setVideoFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Upload video with real-time progress & speed
  const uploadVideo = async () => {
    if (!videoFile || !videoTitle.trim()) {
      setErrorMessage("Please provide a video title and select a video file.");
      return;
    }
    setErrorMessage("");
    setUploading(true);
    setUploadProgress(0);
    setUploadSpeed("0 B/s");
    setTimeLeft("Calculating...");

    const formData = new FormData();
    formData.append("video", videoFile);

    let lastLoaded = 0;
    let lastTime = Date.now();
    let finalSpeedDisplayed = false;
    const uploadStartTime = Date.now();

    try {
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      const token = user?.token || "";

      const res = await axios.post(
        "http://localhost:1111/api/v1/upload/video",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentCompleted = Math.round((loaded * 100) / total);
            setUploadProgress(percentCompleted);

            const now = Date.now();
            const deltaBytes = loaded - lastLoaded;
            const deltaTime = (now - lastTime) / 1000;

            if (percentCompleted < 100) {
              if (deltaTime > 0) {
                const speedBps = deltaBytes / deltaTime;
                let speedDisplay;
                if (speedBps > 1e6) speedDisplay = (speedBps / 1e6).toFixed(2) + " MB/s";
                else if (speedBps > 1e3) speedDisplay = (speedBps / 1e3).toFixed(2) + " KB/s";
                else speedDisplay = speedBps.toFixed(2) + " B/s";

                setUploadSpeed(speedDisplay);

                const bytesLeft = total - loaded;
                const secondsLeft = bytesLeft / speedBps;
                setTimeLeft(formatTime(secondsLeft));
              }
            } else if (!finalSpeedDisplayed) {
              const totalTimeSecs = (now - uploadStartTime) / 1000;
              const avgSpeed = total / totalTimeSecs;
              let avgSpeedStr = "0 B/s";
              if (avgSpeed > 1e6) avgSpeedStr = (avgSpeed / 1e6).toFixed(2) + " MB/s";
              else if (avgSpeed > 1e3) avgSpeedStr = (avgSpeed / 1e3).toFixed(2) + " KB/s";
              else avgSpeedStr = avgSpeed.toFixed(2) + " B/s";

              setUploadSpeed(avgSpeedStr);
              setTimeLeft("Upload complete");
              finalSpeedDisplayed = true;
            }

            lastLoaded = loaded;
            lastTime = now;
          },
          timeout: 0,
        }
      );

      setVideos((prev) => [...prev, { title: videoTitle.trim(), url: res.data.videoUrl }]);
      setVideoFile(null);
      setVideoTitle("");
      setStep(3);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Video upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed("0 B/s");
      setTimeLeft("Calculating...");
    }
  };

  // Submit course
  const handleSubmitCourse = async () => {
    if (!canProceedToVideos) {
      setErrorMessage("Please fill all course details.");
      setStep(1);
      return;
    }
    if (videos.length === 0) {
      setErrorMessage("Please upload at least one video.");
      setStep(2);
      return;
    }
    setErrorMessage("");

    try {
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      const token = user?.token || "";

      const res = await axios.post(
        "http://localhost:1111/api/v1/courses/create",
        {
          title: title.trim(),
          description: description.trim(),
          duration: Number(duration),
          videos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course created successfully!");
      if (onCourseAdded) onCourseAdded(res.data);
      setTitle("");
      setDescription("");
      setDuration("");
      setVideos([]);
      setStep(1);
    } catch (error) {
      console.error("Create course error:", error.response || error);
      setErrorMessage(error.response?.data?.message || "Course creation failed.");
    }
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Add New Course</h2>

        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Course Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course title"
          disabled={uploading}
        />

        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course description"
          disabled={uploading}
        />

        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Duration (hours)
        </label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-3 mb-6 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course duration in hours"
          disabled={uploading}
        />

        {errorMessage && <p className="mb-4 text-red-600 font-semibold">{errorMessage}</p>}

        <button
          disabled={!canProceedToVideos || uploading}
          onClick={() => setStep(2)}
          className={`w-full py-3 rounded text-white font-semibold ${
            canProceedToVideos && !uploading
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          } transition`}
        >
          Next: Upload Videos
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">
          Upload Videos ({videos.length} uploaded)
        </h2>

        {errorMessage && <p className="mb-4 text-red-600 font-semibold">{errorMessage}</p>}

        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Video Title
        </label>
        <input
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Enter video title"
          className="w-full p-3 mb-4 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        />

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="mb-4 border-4 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-6 text-center cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-800 transition"
          onClick={() => fileInputRef.current.click()}
        >
          {videoFile ? (
            <p className="font-semibold">{videoFile.name}</p>
          ) : (
            <p>Drag & drop video here or click to select file</p>
          )}
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
          <>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center mb-1 font-semibold text-blue-700">Uploading: {uploadProgress}%</p>
            <p className="text-center mb-1 text-sm text-blue-700">
              {formatBytes((uploadProgress / 100) * (videoFile?.size || 0))} / {formatBytes(videoFile?.size || 0)}
            </p>
            <p className="text-center mb-1 text-sm text-blue-700">Speed: {uploadSpeed}</p>
            <p className="text-center mb-4 text-sm text-blue-700">Estimated time left: {timeLeft}</p>
          </>
        )}

        <div className="flex space-x-4">
          <button
            onClick={uploadVideo}
            disabled={uploading || !videoFile || !videoTitle.trim()}
            className={`flex-1 py-3 rounded text-white font-semibold transition ${
              uploading || !videoFile || !videoTitle.trim()
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>

          <button
            onClick={() => {
              if (videos.length === 0) return alert("Please upload at least one video.");
              setStep(3);
            }}
            disabled={uploading}
            className="flex-1 py-3 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
          >
            Skip Upload
          </button>
        </div>

        {videos.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Uploaded Videos:</h3>
            <ul className="max-h-48 overflow-auto border border-gray-300 dark:border-gray-700 rounded p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
              {videos.map((v, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white dark:bg-gray-900 p-2 rounded shadow"
                >
                  <span>{v.title}</span>
                  <button
                    onClick={() => removeVideo(i)}
                    disabled={uploading}
                    className="text-red-600 hover:text-red-800 font-bold"
                    title="Remove video"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900 text-center">
        <p className="mb-6 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Do you want to upload another video?
        </p>
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => setStep(2)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold transition"
          >
            Yes
          </button>
          <button
            onClick={() => setStep(4)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded font-semibold transition"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Review & Submit</h2>

        <section className="mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Course Title</h3>
          <p>{title}</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
          <p>{description}</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration</h3>
          <p>{duration} hours</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Videos ({videos.length})</h3>
          <ul className="list-disc ml-5 space-y-1">
            {videos.map((v, i) => (
              <li key={i}>{v.title}</li>
            ))}
          </ul>
        </section>

        {errorMessage && <p className="mb-4 text-red-600 font-semibold">{errorMessage}</p>}

        <div className="flex space-x-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 py-3 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          >
            Add More Videos
          </button>
          <button
            onClick={handleSubmitCourse}
            className="flex-1 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Submit Course
          </button>
          <button
            onClick={() => {
              setVideos([]);
              setStep(1);
            }}
            className="flex-1 py-3 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminAddCourseForm;
