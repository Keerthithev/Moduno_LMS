import React, { useEffect, useState } from "react";
import { 
  Users, Plus, Search, Edit, Trash2, X, Ban, Check, User,
  Mail, Calendar, Shield, UserPlus, UserCheck, UserX,
  Download
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from './shared/DashboardLayout';

// Enhanced Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color, description }) => {
  const colorStyles = {
    blue: { bg: "rgba(59, 130, 246, 0.3)", border: "rgba(59, 130, 246, 0.3)", icon: "#3B82F6" },
    green: { bg: "rgba(16, 185, 129, 0.3)", border: "rgba(16, 185, 129, 0.3)", icon: "#10B981" },
    purple: { bg: "rgba(139, 92, 246, 0.3)", border: "rgba(139, 92, 246, 0.3)", icon: "#8B5CF6" },
    orange: { bg: "rgba(245, 158, 11, 0.3)", border: "rgba(245, 158, 11, 0.3)", icon: "#F59E0B" },
    indigo: { bg: "rgba(99, 102, 241, 0.3)", border: "rgba(99, 102, 241, 0.3)", icon: "#6366F1" }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: `1px solid ${colorStyles[color].border}`,
        backdropFilter: "blur(20px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#93C5FD]">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
            {change && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${colorStyles[color].bg}] text-white`}>
                {change}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-[#93C5FD]">{description}</p>}
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    newUsersThisMonth: 0
  });

  // Fetch users with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:1111/api/v1/admin/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
      
      // Calculate stats
      const allUsers = response.data.data;
      const activeUsers = allUsers.filter(user => !user.isBanned).length;
      const bannedUsers = allUsers.filter(user => user.isBanned).length;
      const thisMonth = new Date().getMonth();
      const newUsers = allUsers.filter(user => {
        const userMonth = new Date(user.createdAt).getMonth();
        return userMonth === thisMonth;
      }).length;

      setStats({
        totalUsers: allUsers.length,
        activeUsers,
        bannedUsers,
        newUsersThisMonth: newUsers
      });

    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Send email notification
  const sendUserNotification = async (email, action, details = {}) => {
    try {
      let subject, message;
      
      switch(action) {
        case 'create':
          subject = 'Your account has been created';
          message = `Hello ${details.name},\n\nYour account has been successfully created with the following details:\n\nEmail: ${details.email}\nRole: ${details.role}\n\nThank you for joining us!`;
          break;
        case 'update':
          subject = 'Your account has been updated';
          message = `Hello ${details.name},\n\nYour account details have been updated:\n\nEmail: ${details.email}\nRole: ${details.role}\nStatus: ${details.isBanned ? 'Banned' : 'Active'}\n\nIf you didn't request these changes, please contact support immediately.`;
          break;
        case 'delete':
          subject = 'Your account has been deleted';
          message = `Hello,\n\nYour account with email ${email} has been deleted from our system.\n\nIf this was a mistake, please contact our support team.`;
          break;
        case 'ban':
          subject = `Your account has been ${details.isBanned ? 'banned' : 'unbanned'}`;
          message = `Hello ${details.name},\n\nYour account has been ${details.isBanned ? 'banned' : 'unbanned'} by an administrator.\n\n${details.isBanned ? 'You will no longer be able to access the platform.' : 'Your access has been restored.'}`;
          break;
        default:
          return;
      }

      await axios.post("http://localhost:1111/api/v1/admin/send-email", {
        email,
        subject,
        message
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  };

  // Handle user deletion with email notification and immediate stats update
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const userToDelete = users.find(u => u._id === userId);
        
        await axios.delete(`http://localhost:1111/api/v1/admin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update users list
        const updatedUsers = users.filter(user => user._id !== userId);
        setUsers(updatedUsers);

        // Update stats immediately
        const activeUsers = updatedUsers.filter(user => !user.isBanned).length;
        const bannedUsers = updatedUsers.filter(user => user.isBanned).length;
        const thisMonth = new Date().getMonth();
        const newUsers = updatedUsers.filter(user => {
          const userMonth = new Date(user.createdAt).getMonth();
          return userMonth === thisMonth;
        }).length;

        setStats(prevStats => ({
          ...prevStats,
          totalUsers: updatedUsers.length,
          activeUsers,
          bannedUsers,
          newUsersThisMonth: newUsers
        }));
        
        toast.success("User deleted successfully");
        
        // Send deletion email
        if (userToDelete) {
          await sendUserNotification(userToDelete.email, 'delete');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
        console.error("Delete user error:", error);
      }
    }
  };

  // Handle ban/unban with email notification
  const handleBanUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const user = users.find(u => u._id === userId);

      const response = await axios.put(
        `http://localhost:1111/api/v1/admin/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newBanStatus = response.data.data.isBanned;

      // Update users list
      const updatedUsers = users.map(u => 
        u._id === userId ? { ...u, isBanned: newBanStatus } : u
      );
      setUsers(updatedUsers);

      // Update stats immediately
      const activeUsers = updatedUsers.filter(user => !user.isBanned).length;
      const bannedUsers = updatedUsers.filter(user => user.isBanned).length;
      const thisMonth = new Date().getMonth();
      const newUsers = updatedUsers.filter(user => {
        const userMonth = new Date(user.createdAt).getMonth();
        return userMonth === thisMonth;
      }).length;

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: updatedUsers.length,
        activeUsers,
        bannedUsers,
        newUsersThisMonth: newUsers
      }));

      const action = newBanStatus ? "User banned successfully" : "User unbanned successfully";
      toast.success(action);

      // Send email notification
      if (user) {
        await sendUserNotification(user.email, 'ban', {
          name: user.name,
          isBanned: newBanStatus
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
      console.error("Ban user error:", error);
    }
  };

  // Handle adding user with email notification
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:1111/api/v1/admin/",
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers([...users, response.data.data]);
      setShowAddUserModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "student"
      });
      toast.success("User added successfully");
      
      // Send welcome email
      await sendUserNotification(response.data.data.email, 'create', {
        name: response.data.data.name,
        email: response.data.data.email,
        role: response.data.data.role
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
      console.error("Add user error:", error);
    }
  };

  // Handle editing user with email notification
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:1111/api/v1/admin/${currentUser._id}`,
        currentUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        user._id === currentUser._id ? response.data.data : user
      ));
      
      setShowEditModal(false);
      setCurrentUser(null);
      toast.success("User updated successfully");
      
      // Send update email
      await sendUserNotification(response.data.data.email, 'update', {
        name: response.data.data.name,
        email: response.data.data.email,
        role: response.data.data.role,
        isBanned: response.data.data.isBanned
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
      console.error("Edit user error:", error);
    }
  };

  // Filter users based on search term and filter selection
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ? true :
      filter === "active" ? !user.isBanned && new Date(user.subscriptionExpiry) > new Date() :
      filter === "banned" ? user.isBanned :
      filter === "admin" ? user.role === "admin" :
      filter === "student" ? user.role === "student" : true;
    
    return matchesSearch && matchesFilter;
  });

  const openEditModal = (user) => {
    setCurrentUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned
    });
    setShowEditModal(true);
  };

  // Add new function for CSV export
  const exportToCSV = () => {
    try {
      // Filter users based on current search and filter
      const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" ? true :
                            filter === "active" ? !user.isBanned :
                            filter === "banned" ? user.isBanned :
                            filter === user.role;
        return matchesSearch && matchesFilter;
      });

      // Define CSV headers
      const headers = [
        "Name",
        "Email",
        "Role",
        "Status",
        "Joined Date",
        "Last Login"
      ];

      // Convert users data to CSV format
      const csvData = filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.isBanned ? "Banned" : "Active",
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A"
      ]);

      // Add headers to the beginning of the CSV data
      csvData.unshift(headers);

      // Convert to CSV string
      const csvString = csvData
        .map(row => 
          row.map(cell => {
            // Handle cells that contain commas by wrapping in quotes
            if (cell && cell.toString().includes(',')) {
              return `"${cell}"`;
            }
            return cell;
          }).join(',')
        )
        .join('\n');

      // Create blob and download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Users exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen bg-[#0B2545]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-[#93C5FD]">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
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
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl p-8 mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  }}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2" style={{
                    background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    User Management
                  </h1>
                  <p className="text-[#93C5FD] text-lg">
                    Manage and monitor your platform users
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white hover:from-[#1E40AF] hover:to-[#059669] shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add New User
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              description="Platform users"
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers}
              icon={UserCheck}
              color="green"
              description="Currently active"
            />
            <StatsCard
              title="Banned Users"
              value={stats.bannedUsers}
              icon={UserX}
              color="orange"
              description="Restricted access"
            />
            <StatsCard
              title="New Users"
              value={stats.newUsersThisMonth}
              icon={UserPlus}
              color="purple"
              description="This month"
            />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="admin">Admins</option>
              <option value="student">Students</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden backdrop-blur-sm">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-300">Joined</th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white font-bold">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isBanned 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleBanUser(user._id)}
                        className={user.isBanned ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}
                      >
                        {user.isBanned ? <Check className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal - Similar styling to Add User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;