const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorHandler');
const asyncHandler = require('../middlewares/catchAsyncError');

// @desc    Get admin dashboard statistics
// @route   GET /api/v1/dashboard/admin/stats
exports.getAdminStats = asyncHandler(async (req, res, next) => {
    try {
        console.log('Fetching admin dashboard stats...');

        // Basic Stats
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        console.log('Total Users:', totalUsers);

        const totalCourses = await Course.countDocuments();
        console.log('Total Courses:', totalCourses);

        // New Users This Month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth },
            role: { $ne: 'admin' }
        });
        console.log('New Users This Month:', newUsersThisMonth);

        // Enrollment Stats
        const totalEnrollments = await Enrollment.countDocuments();
        const activeEnrollments = await Enrollment.countDocuments({
            'progress.isCompleted': false
        });
        console.log('Active Enrollments:', activeEnrollments);

        const completedEnrollments = await Enrollment.countDocuments({
            'progress.isCompleted': true
        });

        // Course Completion Rate
        const courseCompletionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        // Active Students (users with at least one enrollment)
        const uniqueStudents = await Enrollment.distinct('user');
        const activeStudents = uniqueStudents.length;

        const stats = {
            totalUsers,
            totalCourses,
            newUsersThisMonth,
            activeEnrollments,
            courseCompletionRate,
            activeStudents,
            totalEnrollments,
            completedEnrollments
        };

        console.log('Admin Dashboard Stats:', stats);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error in admin stats:', error);
        return next(new ErrorResponse('Error fetching admin statistics', 500));
    }
});

// @desc    Get student dashboard statistics
// @route   GET /api/v1/dashboard/student/stats/:userId
exports.getStudentStats = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId || req.user._id;

    // Validate user access
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId.toString()) {
        return next(new ErrorResponse('Not authorized to access these stats', 403));
    }

    // Get all enrollments for the user
    const enrollments = await Enrollment.find({ user: userId })
        .populate({
            path: 'course',
            select: 'title duration sections videos thumbnail category'
        });

    // Calculate basic stats
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress?.isCompleted).length;
    const inProgressCourses = totalEnrolled - completedCourses;

    // Calculate total watch time (in minutes)
    const totalWatchTime = enrollments.reduce((total, enrollment) => {
        return total + (enrollment.progress?.watchTime || 0);
    }, 0);

    // Get recent activity
    const recentActivity = await Enrollment.find({ user: userId })
        .sort({ 'progress.lastUpdated': -1 })
        .limit(5)
        .populate('course', 'title thumbnail');

    // Calculate progress for each course
    const courseProgress = enrollments.map(enrollment => {
        const course = enrollment.course;
        const totalVideos = course.sections?.reduce((total, section) => 
            total + (section.videos?.length || 0), 0) || course.videos?.length || 0;
        
        const completedVideos = enrollment.progress?.completedVideos?.length || 0;
        const progressPercentage = totalVideos > 0 
            ? Math.round((completedVideos / totalVideos) * 100) 
            : 0;

        return {
            courseId: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            category: course.category,
            progress: progressPercentage,
            lastWatched: enrollment.progress?.lastWatched
        };
    });

    res.status(200).json({
        success: true,
        data: {
            totalEnrolled,
            completedCourses,
            inProgressCourses,
            totalWatchTime: Math.round(totalWatchTime / 60), // Convert to hours
            courseProgress,
            recentActivity,
            stats: {
                completionRate: totalEnrolled > 0 
                    ? Math.round((completedCourses / totalEnrolled) * 100) 
                    : 0,
                averageProgress: courseProgress.reduce((sum, course) => sum + course.progress, 0) / (courseProgress.length || 1)
            }
        }
    });
});
