import React, { useEffect, useState } from "react";
import { Users, Plus, Search, Edit, Trash2, X, Ban, Check, User } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const UsersPage = ({ darkMode }) => {
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

  // Fetch users with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:1111/api/v1/admin/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
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

  // Handle user deletion with email notification
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const userToDelete = users.find(u => u._id === userId);
        
        await axios.delete(`http://localhost:1111/api/v1/admin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(users.filter(user => user._id !== userId));
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

    const newBanStatus = response.data.data.isBanned; // ✅ actual value from backend

    // ✅ update users list using backend-provided value
    const updatedUsers = users.map(u => 
      u._id === userId ? { ...u, isBanned: newBanStatus } : u
    );
    setUsers(updatedUsers);

    const action = newBanStatus ? "User banned successfully" : "User unbanned successfully";
    toast.success(action);

    // ✅ now send correct status in email
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-b-4 border-blue-100"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border mx-6 my-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              User Management
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {users.length} users
            </span>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className={`relative flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
            <Search className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} ml-2`}>Filter:</span>
            <select 
              className={`text-sm rounded-md px-2 py-1 ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="admin">Admins</option>
              <option value="student">Students</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  User
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Role
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Joined
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          user.isBanned ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                            {user.isBanned && (
                              <span className="ml-2 text-xs text-red-500">(Banned)</span>
                            )}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 text-red-800' 
                          : new Date(user.subscriptionExpiry) > new Date() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      } ${darkMode ? 'bg-opacity-20' : ''}`}>
                        {user.isBanned 
                          ? 'Banned' 
                          : new Date(user.subscriptionExpiry) > new Date() 
                            ? 'Active' 
                            : 'Expired'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      } ${darkMode ? 'bg-opacity-20' : ''}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                        <div className="text-xs">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className={`p-2 rounded-md ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'}`}
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleBanUser(user._id)}
                        className={`p-2 rounded-md ${user.isBanned 
                          ? (darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100') 
                          : (darkMode ? 'text-yellow-400 hover:bg-gray-600' : 'text-yellow-600 hover:bg-gray-100')}`}
                        title={user.isBanned ? "Unban user" : "Ban user"}
                      >
                        {user.isBanned ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className={`p-2 rounded-md ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'}`}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className={`text-center py-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                      <Users className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        No users found
                      </h3>
                      <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {searchTerm ? "Try a different search term" : "Add your first user to get started"}
                      </p>
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="mt-4 flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 mx-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className={`flex items-center justify-between mt-4 px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredUsers.length)}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                disabled
              >
                Previous
              </button>
              <button
                className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex justify-center items-center">
          <div className={`relative rounded-lg shadow-2xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              aria-label="Close modal"
              className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
              onClick={() => setShowAddUserModal(false)}
            >
              <X size={24} />
            </button>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <User className="inline-block mr-2 h-5 w-5" />
              Add New User
            </h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
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

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex justify-center items-center">
          <div className={`relative rounded-lg shadow-2xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              aria-label="Close modal"
              className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
              onClick={() => setShowEditModal(false)}
            >
              <X size={24} />
            </button>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Edit className="inline-block mr-2 h-5 w-5" />
              Edit User
            </h2>
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className={`rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    checked={currentUser.isBanned}
                    onChange={(e) => setCurrentUser({...currentUser, isBanned: e.target.checked})}
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Banned</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
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
    </div>
  );
};

export default UsersPage;