import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Signed out successfully");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-opacity-90 flex flex-col"
        style={{
          background: "rgba(11, 37, 69, 0.95)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}>
        {/* Logo */}
        <div className="flex items-center h-20 px-6"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
              }}>
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{
                background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>MODUNO</h1>
              <p className="text-xs text-[#93C5FD]">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard"
            className="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)]">
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link to={isAdmin ? "/courselist" : "/studentcourselist"}
            className="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)]">
            <BookOpen className="h-5 w-5 mr-3" />
            {isAdmin ? "Courses" : "My Courses"}
          </Link>
          {isAdmin && (
            <Link to="/users"
              className="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)]">
              <Users className="h-5 w-5 mr-3" />
              Users
            </Link>
          )}
        </nav>

        {/* Bottom Section with Profile and Sign Out */}
        <div className="mt-auto">
          {/* Profile Section */}
          <div className="p-4"
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
            <div className="flex items-center space-x-3 p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}>
              <div className="h-10 w-10 rounded-xl text-white flex items-center justify-center text-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                <p className="text-xs text-[#93C5FD] truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 text-[#93C5FD] hover:bg-[rgba(59,130,246,0.1)]">
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 