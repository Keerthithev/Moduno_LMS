import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  TrashIcon,
  PencilAltIcon,
  PlayIcon,
  XIcon,
  CheckIcon,
  PlusCircleIcon,
  UploadIcon,
} from "@heroicons/react/solid";

const placeholderThumbnail =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Editing state
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editVideos, setEditVideos] = useState([]);
  const [editSaving, setEditSaving] = useState(false);

  // Video upload state during editing
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("0 B/s");
  const [timeLeft, setTimeLeft] = useState("Calculating...");
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:1111/api/v1/courses");
      setCourses(res.data.data);
    } catch (error) {
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:1111/api/v1/courses/${id}`);
      setCourses(courses.filter((c) => c._id !== id));
    } catch (error) {
      alert("Failed to delete course");
    }
  };

  const startEditing = (course) => {
    setEditingCourseId(course._id);
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditDuration(course.duration);
    setEditVideos(course.videos);
  };

  const cancelEditing = () => {
    setEditingCourseId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDuration("");
    setEditVideos([]);
    resetUploadState();
  };

  // Upload helpers
  const resetUploadState = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadSpeed("0 B/s");
    setTimeLeft("Calculating...");
    setVideoFile(null);
    setVideoTitle("");
    setUploadError("");
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith("video/")) {
      setUploadError("Only video files are allowed.");
      return;
    }
    setUploadError("");
    setVideoFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const uploadVideo = async () => {
    if (!videoFile || !videoTitle.trim()) {
      setUploadError("Please provide a video title and select a video file.");
      return;
    }
    setUploadError("");
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
      const res = await axios.post(
        "http://localhost:1111/api/v1/upload/video",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentCompleted = Math.round((loaded * 100) / total);
            setUploadProgress(percentCompleted);

            const now = Date.now();
            const deltaBytes = loaded - lastLoaded;
            const deltaTime = (now - lastTime) / 1000; // seconds

            if (percentCompleted < 100) {
              if (deltaTime > 0) {
                const speedBps = deltaBytes / deltaTime;
                let speedDisplay;
                if (speedBps > 1e6) {
                  speedDisplay = (speedBps / 1e6).toFixed(2) + " MB/s";
                } else if (speedBps > 1e3) {
                  speedDisplay = (speedBps / 1e3).toFixed(2) + " KB/s";
                } else {
                  speedDisplay = speedBps.toFixed(2) + " B/s";
                }
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

      // Add new video to editVideos list
      setEditVideos((prev) => [
        ...prev,
        { title: videoTitle.trim(), url: res.data.videoUrl },
      ]);
      resetUploadState();
    } catch (err) {
      setUploadError(
        err.response?.data?.message || "Video upload failed. Please try again."
      );
      setUploading(false);
    }
  };

  // Format seconds helper
  const formatTime = (seconds) => {
    if (seconds === Infinity || isNaN(seconds)) return "Calculating...";
    if (seconds <= 0) return "Almost done";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
  };

  const removeVideoFromEdit = (idx) => {
    setEditVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim() || !editDuration) {
      alert("Please fill all course fields.");
      return;
    }
    if (editVideos.length === 0) {
      alert("Please add at least one video.");
      return;
    }

    setEditSaving(true);
    try {
      const updatedCourse = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        duration: Number(editDuration),
        videos: editVideos,
      };
      const res = await axios.put(
        `http://localhost:1111/api/v1/courses/${editingCourseId}`,
        updatedCourse
      );
      setCourses((prev) =>
        prev.map((course) =>
          course._id === editingCourseId ? res.data : course
        )
      );
      cancelEditing();
    } catch (error) {
      alert("Failed to update course");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-12 border-b border-gray-300 dark:border-gray-700 pb-4">
        Manage Courses
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-600 dark:text-gray-400">
          <p className="text-xl">No courses available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => {
            const isEditing = editingCourseId === course._id;
            return (
              <article
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  className="h-52 rounded-t-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${placeholderThumbnail})` }}
                  aria-label={`Course thumbnail for ${course.title}`}
                />

                <div className="p-6 flex flex-col flex-grow">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mb-3 text-2xl font-semibold text-blue-700 dark:text-blue-400 border-b border-gray-300 dark:border-gray-600 focus:outline-none"
                        placeholder="Course title"
                      />
                      <textarea
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="mb-3 text-gray-700 dark:text-gray-300 flex-grow resize-none border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none"
                        placeholder="Course description"
                      />
                      <input
                        type="number"
                        min="1"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="mb-5 font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-gray-600 focus:outline-none"
                        placeholder="Duration (hours)"
                      />

                      {/* Videos editing */}
                      <div className="mb-5">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Videos ({editVideos.length})
                        </h4>
                        {editVideos.length === 0 && (
                          <p className="text-gray-600 dark:text-gray-400">
                            No videos added.
                          </p>
                        )}
                        <ul className="max-h-48 overflow-auto border border-gray-300 dark:border-gray-700 rounded p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
                          {editVideos.map((video, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center bg-white dark:bg-gray-900 p-2 rounded shadow"
                            >
                              <span>{video.title}</span>
                              <button
                                onClick={() => removeVideoFromEdit(idx)}
                                className="text-red-600 hover:text-red-800 font-bold"
                                title="Remove video"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Video upload */}
                      <div className="mb-5">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Upload New Video
                        </h4>
                        {uploadError && (
                          <p className="mb-2 text-red-600 font-semibold">{uploadError}</p>
                        )}
                        <input
                          type="text"
                          placeholder="Video title"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          disabled={uploading}
                          className="w-full p-2 mb-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={onFileChange}
                          disabled={uploading}
                          className="mb-3"
                        />

                        {uploading && (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-4 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-center mb-1 font-semibold text-blue-700">
                              Uploading: {uploadProgress}%
                            </p>
                            <p className="text-center mb-1 text-sm text-blue-700">
                              Speed: {uploadSpeed}
                            </p>
                            <p className="text-center mb-4 text-sm text-blue-700">
                              Estimated time left: {timeLeft}
                            </p>
                          </>
                        )}

                        <button
                          onClick={uploadVideo}
                          disabled={uploading || !videoFile || !videoTitle.trim()}
                          className={`flex-1 py-3 rounded text-white font-semibold transition ${
                            uploading || !videoFile || !videoTitle.trim()
                              ? "bg-green-300 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {uploading ? (
                            <>
                              <UploadIcon className="inline-block h-5 w-5 mr-1 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Upload Video"
                          )}
                        </button>
                      </div>

                      {/* Save/Cancel buttons */}
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={saveEdit}
                          disabled={editSaving}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                        >
                          <CheckIcon className="h-5 w-5" />
                          <span>{editSaving ? "Saving..." : "Save"}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={editSaving}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        >
                          <XIcon className="h-5 w-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300 mb-5 line-clamp-4 flex-grow">
                        {course.description.length > 200
                          ? course.description.slice(0, 200) + "..."
                          : course.description}
                      </p>

                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 font-semibold mb-6">
                        <span>Duration: {course.duration}h</span>
                        <span>{course.videos.length} videos</span>
                      </div>

                      <div className="flex space-x-4 justify-end">
                        <button
                          onClick={() => startEditing(course)}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        >
                          <PencilAltIcon className="h-5 w-5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        >
                          <PlayIcon className="h-5 w-5" />
                          <span>View Videos</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal for video player */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-5"
          onClick={() => setSelectedCourse(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCourse(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
            >
              <XIcon className="h-7 w-7" />
            </button>

            <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Videos: {selectedCourse.title}
            </h3>

            {selectedCourse.videos.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No videos uploaded.</p>
            ) : (
              <div className="space-y-8">
                {selectedCourse.videos.map((video, idx) => (
                  <section key={idx} className="flex flex-col space-y-3">
                    <h4 className="font-semibold text-xl text-gray-800 dark:text-gray-200 truncate">
                      {video.title}
                    </h4>
                    <video
                      src={video.url}
                      controls
                      preload="metadata"
                      className="rounded-lg shadow-md w-full max-h-[360px]"
                    />
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseList;
