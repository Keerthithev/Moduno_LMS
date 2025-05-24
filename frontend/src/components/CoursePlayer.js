// src/components/Student/CoursePlayer.js
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import PropTypes from "prop-types";

const CoursePlayer = ({ course, enrollment,user, onVideoComplete, onBack }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(enrollment?.progress.currentVideoIndex || 0);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(enrollment?.progress.isCompleted || false);

  useEffect(() => {
    // Reset on course change
    setCurrentVideoIndex(enrollment?.progress.currentVideoIndex || 0);
    setCourseCompleted(enrollment?.progress.isCompleted || false);
    setShowNextPrompt(false);
  }, [course, enrollment]);

  const handleVideoEnd = () => {
    onVideoComplete(currentVideoIndex);

    if (currentVideoIndex + 1 < course.videos.length) {
      setShowNextPrompt(true);
    } else {
      // Course fully completed
      setCourseCompleted(true);
    }
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((idx) => idx + 1);
    setShowNextPrompt(false);
  };

  const currentVideo = course.videos[currentVideoIndex];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{course.title}</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>

      {!courseCompleted ? (
        <>
          <ReactPlayer
            url={currentVideo.url}
            controls
            width="100%"
            height="360px"
            onEnded={handleVideoEnd}
          />
          <p className="mt-2 text-gray-700 dark:text-gray-300">{currentVideo.title}</p>

          {showNextPrompt && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleNextVideo}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
              >
                Next Video
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4 text-green-700">🎉 Congratulations! You have completed the course.</h3>
          <p className="mb-4">Download your certificate below:</p>
          <a
            href={`http://localhost:1111/api/v1/certificate/download/${user.id}/${course._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          >
            Download Certificate
          </a>
        </div>
      )}
    </div>
  );
};

CoursePlayer.propTypes = {
  course: PropTypes.object.isRequired,
  enrollment: PropTypes.object.isRequired,
  onVideoComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CoursePlayer;
