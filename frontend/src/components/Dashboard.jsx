import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user: authUser } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    newUsersThisMonth: 0,
    activeEnrollments: 0,
    courseCompletionRate: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    if (authUser.role === 'admin') {
      setIsAdmin(true);
      fetchAdminStats();
    }
  }, [authUser, navigate]);

  const fetchAdminStats = async () => {
    try {
      console.log("Fetching admin stats...");
      const response = await axiosInstance.get("/dashboard/admin/stats");
      console.log("Admin stats response:", response.data);
      
      if (response.data.success) {
        const stats = response.data.data;
        setAdminStats({
          totalUsers: stats.totalUsers || 0,
          totalCourses: stats.totalCourses || 0,
          newUsersThisMonth: stats.newUsersThisMonth || 0,
          activeEnrollments: stats.activeEnrollments || 0,
          courseCompletionRate: stats.courseCompletionRate || 0,
          activeStudents: stats.activeStudents || 0
        });
      } else {
        console.error("Invalid admin stats response:", response.data);
        toast.error("Failed to load admin statistics");
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B2545]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[#93C5FD]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{
        background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
      }}>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {isAdmin ? (
            <AdminDashboard 
              stats={adminStats}
              onCourseAdded={fetchAdminStats}
            />
          ) : (
            <StudentDashboard
              // ... student props ...
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 