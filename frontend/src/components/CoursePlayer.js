import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import PropTypes from "prop-types";
import { CheckCircle, ChevronLeft, ChevronRight, List, X } from "lucide-react";

const ProgressBar = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className || ""}`}>
    <div
      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

const CoursePlayer = ({ course, enrollment, user, onVideoComplete, onBack }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [showVideoList, setShowVideoList] = useState(true); // Show by default on desktop
  const [completedVideos, setCompletedVideos] = useState([]);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize from enrollment data
  useEffect(() => {
    if (enrollment?.progress) {
      setCurrentVideoIndex(enrollment.progress.currentVideoIndex || 0);
      setCourseCompleted(enrollment.progress.isCompleted || false);
      setCompletedVideos(Array.isArray(enrollment.progress.completedVideos) ? 
        enrollment.progress.completedVideos : []);
    }
  }, [course, enrollment]);

  const currentVideo = course?.videos?.[currentVideoIndex];
  const progressPercentage = Math.round(
    (completedVideos.length / (course?.videos?.length || 1)) * 100
  );

  const markVideoCompleted = (index, isComplete = false) => {
    const newCompletedVideos = [...new Set([...completedVideos, index])];
    const isCourseComplete = isComplete || newCompletedVideos.length === course.videos.length;
    
    setCompletedVideos(newCompletedVideos);
    setCourseCompleted(isCourseComplete);
    
    onVideoComplete(index, isCourseComplete);
  };

  const handleProgress = ({ played }) => {
    const percentage = Math.round(played * 100);
    setWatchedPercentage(percentage);

    if (percentage >= 90 && !completedVideos.includes(currentVideoIndex)) {
      markVideoCompleted(currentVideoIndex);
    }
  };

  const handleVideoEnd = () => {
    if (!completedVideos.includes(currentVideoIndex)) {
      const isLastVideo = currentVideoIndex === course.videos.length - 1;
      markVideoCompleted(currentVideoIndex, isLastVideo);
    }
  };

  const navigateVideo = (direction) => {
    const newIndex = direction === 'next' ? currentVideoIndex + 1 : currentVideoIndex - 1;
    if (newIndex >= 0 && newIndex < course.videos.length) {
      setCurrentVideoIndex(newIndex);
      setWatchedPercentage(0);
    }
  };

  const canNavigate = (direction) => {
    if (direction === 'prev') return currentVideoIndex > 0;
    if (direction === 'next') {
      if (currentVideoIndex >= course.videos.length - 1) return false;
      return completedVideos.includes(currentVideoIndex) || 
             completedVideos.includes(currentVideoIndex + 1);
    }
    return true;
  };

  if (!course || !course.videos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (course.videos.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
          <X className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
        <p className="text-gray-600 mb-6">This course doesn't contain any video content yet.</p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50">
      {/* Sidebar - Video List */}
      <div className={`${showVideoList ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Course Content</h2>
            <button 
              onClick={() => setShowVideoList(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2">
            <ProgressBar value={progressPercentage} />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{completedVideos.length} of {course.videos.length} completed</span>
              <span>{progressPercentage}%</span>
            </div>
          </div>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {course.videos.map((video, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    setCurrentVideoIndex(index);
                    if (isMobileView) setShowVideoList(false);
                  }}
                  className={`w-full text-left p-3 rounded-md flex items-center ${
                    index === currentVideoIndex 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${
                    completedVideos.includes(index) ? 'text-green-600' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
                    {completedVideos.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <span className="truncate">{video.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content - Video Player */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <button 
            onClick={() => setShowVideoList(true)}
            className="flex items-center text-blue-600"
          >
            <List className="h-5 w-5 mr-2" />
            <span>Contents</span>
          </button>
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black">
          <div className="relative h-0 pb-[56.25%]">
            <ReactPlayer
              url={currentVideo.url}
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              onEnded={handleVideoEnd}
              onProgress={handleProgress}
              playing
            />
          </div>
        </div>

        {/* Video Info and Navigation */}
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-medium mb-2">{currentVideo.title}</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Video {currentVideoIndex + 1} of {course.videos.length}
              </span>
              <span className="text-sm text-gray-600">
                {watchedPercentage}% watched
              </span>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => navigateVideo('prev')}
                disabled={!canNavigate('prev')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  canNavigate('prev') 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </button>
              
              <button
                onClick={() => navigateVideo('next')}
                disabled={!canNavigate('next')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  canNavigate('next') 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {courseCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Course Completed!</h3>
              <p className="text-gray-500 mb-6">
                Congratulations! You've successfully completed all videos in this course.
              </p>
              <div className="flex flex-col space-y-3">
                <a
                  href={`/certificate/download/${user.id}/${course._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download Certificate
                </a>
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back to Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CoursePlayer.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    videos: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  enrollment: PropTypes.shape({
    progress: PropTypes.shape({
      currentVideoIndex: PropTypes.number,
      isCompleted: PropTypes.bool,
      completedVideos: PropTypes.arrayOf(PropTypes.number),
    }),
  }),
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onVideoComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

CoursePlayer.defaultProps = {
  enrollment: {
    progress: {
      currentVideoIndex: 0,
      isCompleted: false,
      completedVideos: [],
    },
  },
};

export default CoursePlayer;