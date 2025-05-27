// import React, { useEffect, useState , useRef} from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import {
//   ArrowLeft, User as UserIcon, BookOpen, Award, Clock, Star, 
//   Loader2, Settings, Lock, Mail, Edit, Home, Users, 
//   TrendingUp, Calendar, ChevronDown, LogOut, X, Menu,
//   CheckCircle, BarChart2, Bookmark, Plus, Play, Moon , Sun
// } from 'lucide-react';
// import ModunoLogo from '../components/ModunoLogo';
// // Add this import at the top of your file with other imports
// import { jwtDecode } from 'jwt-decode';


// const Profile = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
//   const profileBtnRef = useRef();

//   useEffect(() => {
//   const fetchProfileData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const userData = JSON.parse(localStorage.getItem('user'));
      
//       if (!token || !userData) {
//         navigate('/login');
//         return;
//       }

//       // Validate user ID - moved inside fetchProfileData
//       if (!userData._id) {
//         console.error('Invalid user data in localStorage:', userData);
        
//         // Try to get ID from token
//         const decoded = jwtDecode(token);
//         if (decoded?.id) {
//           userData._id = decoded.id;
//         } else {
//           navigate('/login');
//           return;
//         }
//       }

//       // First load essential data
//       const [profileRes, statsRes, coursesRes] = await Promise.all([
//         axios.get('http://localhost:1111/api/v1/profile', {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         axios.get('http://localhost:1111/api/v1/profile/stats', {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         axios.get('http://localhost:1111/api/v1/profile/courses', {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//       ]);

//       setUser(profileRes.data.data);
//       setStats(statsRes.data.data);
//       setCourses(coursesRes.data.data);
      
//       // Then try to load upcoming classes separately
//       try {
//         const upcomingRes = await axios.get(
//           `http://localhost:1111/api/v1/classes/upcoming/user/${userData._id}`, 
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setUpcomingClasses(upcomingRes.data.data || []);
//       } catch (upcomingError) {
//         console.error('Failed to fetch upcoming classes:', upcomingError);
//         setUpcomingClasses([]); // Set empty array as fallback
//       }

//     } catch (error) {
//       console.error('Failed to fetch profile data:', error);
//       toast.error('Failed to load profile data');
//       if (error.response?.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchProfileData();
// }, [navigate]);


//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };
// console.log('Current state:', { user, stats, courses });
//   if (loading || !user || !stats) {
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//     </div>
//   );
// }





//   // Stats Card Component
//   const StatsCard = ({ title, value, icon: Icon, color, change }) => {
//     const colorClasses = {
//       blue: "bg-blue-50 text-blue-600",
//       green: "bg-green-50 text-green-600",
//       purple: "bg-purple-50 text-purple-600",
//       orange: "bg-orange-50 text-orange-600",
//       indigo: "bg-indigo-50 text-indigo-600"
//     };

//     const iconBgClasses = {
//       blue: "bg-blue-100",
//       green: "bg-green-100",
//       purple: "bg-purple-100",
//       orange: "bg-orange-100",
//       indigo: "bg-indigo-100"
//     };

//    return (
//     <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-500">{title}</p>
//           <h3 className="text-2xl font-bold mt-1">{value}</h3>
//           {!isAdmin && change && ( // Only show change for students
//             <p className={`text-xs mt-2 ${
//               change.startsWith('+') ? 'text-green-500' : 'text-gray-500'
//             }`}>
//               {change}
//             </p>
//           )}
//         </div>
//           <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
//             <Icon className="h-5 w-5" />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Course Card Component
//   const CourseCard = ({ course }) => {
//     return (
//       <div className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
//         darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
//       }`}>
//         <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
//           {course.progress === 100 && (
//             <div className="absolute top-2 right-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center border border-green-100">
//               <CheckCircle className="h-3 w-3 mr-1" /> Completed
//             </div>
//           )}
//         </div>
//         <div className="p-5">
//           <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'} mb-1 line-clamp-2`}>{course.title}</h3>
//           <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>by {course.instructor || "Moduno Instructor"}</p>
          
//           <div className="mb-4">
//             <div className="flex justify-between text-sm mb-1">
//               <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
//               <span className="font-medium">{course.progress}%</span>
//             </div>
//             <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//               <div 
//                 className={`h-2 rounded-full ${
//                   course.isCompleted ? 'bg-green-500' : 'bg-blue-500'
//                 }`} 
//                 style={{ width: `${course.progress}%` }}
//               />
//             </div>
//           </div>
          
//           <div className="flex justify-between items-center">
//             <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               <Clock className="h-4 w-4 mr-1" />
//               <span>{Math.round(course.duration / 60) || '8'} hours</span>
//             </div>
//             <Link
//               to={`/course/${course.id}`}
//               className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
//                 darkMode 
//                   ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                   : 'bg-blue-600 text-white hover:bg-blue-700'
//               }`}
//             >
//               <Play className="h-4 w-4 mr-2" />
//               {course.isCompleted ? 'Review' : course.progress > 0 ? 'Continue' : 'Start'}
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//       {/* Mobile Sidebar */}
//       {mobileMenuOpen && (
//         <div className="fixed inset-0 z-40 md:hidden">
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
//           <div className={`fixed inset-y-0 left-0 w-64 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform ease-in-out duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
//             <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
//               <ModunoLogo size={32} darkMode={darkMode} />
//               <button
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`p-2 rounded-md ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
//               >
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//             <nav className="mt-5 px-2 space-y-1">
//               <Link
//                 to="/dashboard"
//                 className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                   darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 <Home className="mr-3 h-5 w-5" />
//                 Dashboard
//               </Link>
//               <Link
//                 to="/profile"
//                 className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                   darkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600'
//                 }`}
//               >
//                 <UserIcon className="mr-3 h-5 w-5" />
//                 Profile
//               </Link>
//               <Link
//                 to={user.role === 'admin' ? "/courselist" : "/studentcourselist"}
//                 className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                   darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 <BookOpen className="mr-3 h-5 w-5" />
//                 {user.role === 'admin' ? "Courses" : "My Courses"}
//               </Link>
//               {user.role !== 'admin' && (
//                 <Link
//                   to="/progress"
//                   className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                     darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <TrendingUp className="mr-3 h-5 w-5" />
//                   Progress
//                 </Link>
//               )}
//               {user.role === 'admin' && (
//                 <Link
//                   to="/users"
//                   className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                     darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Users className="mr-3 h-5 w-5" />
//                   Users
//                 </Link>
//               )}
//               <Link
//                 to="/settings"
//                 className={`group flex items-center px-2 py-3 rounded-md font-medium ${
//                   darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 <Settings className="mr-3 h-5 w-5" />
//                 Settings
//               </Link>
//             </nav>
//           </div>
//         </div>
//       )}

//       {/* Desktop Sidebar */}
//       <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//         <div className={`flex items-center h-20 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} space-x-4`}>
//           <ModunoLogo size={48} darkMode={darkMode} />
//           <div className="flex flex-col justify-center">
//             <span className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} tracking-wider`}>Moduno</span>
//             <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} tracking-wide`} style={{ letterSpacing: "0.04em" }}>
//               Build Your Dreams in Real
//             </span>
//           </div>
//         </div>
//         <nav className="flex flex-col flex-grow pt-8 px-3 space-y-2">
//           <Link 
//             to="/dashboard" 
//             className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//               darkMode 
//                 ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                 : 'text-gray-600 hover:bg-gray-100'
//             }`}
//           >
//             <Home className="h-5 w-5 mr-3" />
//             Dashboard
//           </Link>
//           <Link 
//             to="/profile" 
//             className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//               darkMode 
//                 ? 'bg-gray-700 text-white hover:bg-gray-600' 
//                 : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//             }`}
//           >
//             <UserIcon className="h-5 w-5 mr-3" />
//             Profile
//           </Link>
//           <Link 
//             to={user.role === 'admin' ? "/courselist" : "/studentcourselist"} 
//             className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//               darkMode 
//                 ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                 : 'text-gray-600 hover:bg-gray-100'
//             }`}
//           >
//             <BookOpen className="h-5 w-5 mr-3" />
//             {user.role === 'admin' ? "Courses" : "My Courses"}
//           </Link>
//           {user.role !== 'admin' && (
//             <Link 
//               to="/progress" 
//               className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//                 darkMode 
//                   ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               <TrendingUp className="h-5 w-5 mr-3" />
//               Progress
//             </Link>
//           )}
//           {user.role === 'admin' && (
//             <Link 
//               to="/users" 
//               className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//                 darkMode 
//                   ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               <Users className="h-5 w-5 mr-3" />
//               Users
//             </Link>
//           )}
//           <Link 
//             to="/settings" 
//             className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
//               darkMode 
//                 ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                 : 'text-gray-600 hover:bg-gray-100'
//             }`}
//           >
//             <Settings className="h-5 w-5 mr-3" />
//             Settings
//           </Link>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <div className="md:pl-64 flex flex-col min-h-screen">
//         {/* Top Navigation */}
//         <header className={`sticky top-0 z-10 flex h-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm items-center px-4 md:px-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//           <button
//             aria-label="Open menu"
//             className={`md:hidden rounded-md p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} focus:outline-none`}
//             onClick={() => setMobileMenuOpen(true)}
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="flex-1"></div>

//           {/* Dark Mode Toggle */}
//           <button
//             aria-label="Toggle dark mode"
//             onClick={() => setDarkMode(!darkMode)}
//             className={`mr-4 p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} focus:outline-none`}
//           >
//             {darkMode ? (
//               <Sun className="text-yellow-400" size={20} />
//             ) : (
//               <Moon className="text-gray-700" size={20} />
//             )}
//           </button>

//           {/* Profile Dropdown */}
//           <div className="relative" ref={profileBtnRef}>
//             <button
//               type="button"
//               aria-label="Open user menu"
//               className={`flex items-center rounded-full transition-colors ${
//                 darkMode 
//                   ? 'bg-gray-700 hover:bg-gray-600' 
//                   : 'bg-gray-100 hover:bg-gray-200'
//               } px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
//               onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//             >
//               <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center text-lg font-bold">
//                 {user.name ? user.name[0].toUpperCase() : "U"}
//               </div>
//               <span className={`ml-2 ${darkMode ? 'text-white' : 'text-gray-700'} font-semibold hidden md:inline`}>
//                 {user.name || "User"}
//               </span>
//               <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
//                 profileDropdownOpen ? 'transform rotate-180' : ''
//               } ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden md:inline`} />
//             </button>
            
//             {profileDropdownOpen && (
//               <div 
//                 className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50 animate-dropdownIn ${
//                   darkMode 
//                     ? 'bg-gray-800 border-gray-700' 
//                     : 'bg-white border-gray-200'
//                 } border`}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
//                   <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {user.name || "User"}
//                   </p>
//                   <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {user.email}
//                   </p>
//                 </div>
//                 <Link
//                   to="/profile"
//                   className={`block px-4 py-2 text-sm transition-colors ${
//                     darkMode 
//                       ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                   onClick={() => setProfileDropdownOpen(false)}
//                 >
//                   <UserIcon className="inline-block mr-2 h-4 w-4" />
//                   Your Profile
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
//                     darkMode 
//                       ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <LogOut className="inline-block mr-2 h-4 w-4" />
//                   Sign out
//                 </button>
//               </div>
//             )}
//           </div>
//         </header>

//         {/* Profile Content */}
//         <main className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//           {/* Welcome Section */}
//           <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-8 text-white mb-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold mb-2">Welcome, {user.name || "User"}!</h1>
//                 <p className="text-blue-100 text-lg">
//                   {user.role === 'admin' 
//                     ? "Manage your profile and account settings" 
//                     : "Track your learning progress and achievements"}
//                 </p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => setActiveTab('profile')}
//                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                     activeTab === 'profile' 
//                       ? 'bg-white text-blue-600 hover:bg-blue-50' 
//                       : 'bg-blue-700 text-white hover:bg-blue-600'
//                   }`}
//                 >
//                   Profile
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('courses')}
//                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                     activeTab === 'courses' 
//                       ? 'bg-white text-blue-600 hover:bg-blue-50' 
//                       : 'bg-blue-700 text-white hover:bg-blue-600'
//                   }`}
//                 >
//                   My Courses
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('settings')}
//                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                     activeTab === 'settings' 
//                       ? 'bg-white text-blue-600 hover:bg-blue-50' 
//                       : 'bg-blue-700 text-white hover:bg-blue-600'
//                   }`}
//                 >
//                   Settings
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Profile Overview */}
//           {activeTab === 'profile' && (
//             <div className="space-y-6">
//               {/* Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 <StatsCard
//                   title="Enrolled Courses"
//                   value={stats.enrolledCourses}
//                   change={`${stats.enrolledCoursesChange || 0} this month`}
//                   icon={BookOpen}
//                   color="blue"
//                 />
//                 <StatsCard
//                   title="Completed Courses"
//                   value={stats.coursesCompleted}
//                   change={`${stats.completedCoursesChange || 0} this month`}
//                   icon={Award}
//                   color="green"
//                 />
//                 <StatsCard
//                   title="Study Hours"
//                   value={stats.studyHours}
//                   change={`${stats.studyHoursChange || 0}% this week`}
//                   icon={Clock}
//                   color="purple"
//                 />
//                 <StatsCard
//                   title="Certificates"
//                   value={stats.certificates || 0}
//                   change={`${stats.certificatesChange || 0} this month`}
//                   icon={Star}
//                   color="orange"
//                 />
//               </div>

//               {/* Recent Courses */}
//               <div className={`rounded-xl p-6 shadow-sm mb-8 ${
//                 darkMode 
//                   ? 'bg-gray-800 border-gray-700' 
//                   : 'bg-white border-gray-200'
//               } border`}>
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className={`text-2xl font-bold ${
//                     darkMode ? 'text-white' : 'text-gray-900'
//                   }`}>
//                     Recent Courses
//                   </h2>
//                   <Link 
//                     to="/courses" 
//                     className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
//                       darkMode 
//                         ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
//                         : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'
//                     } border`}
//                   >
//                     View All Courses
//                   </Link>
//                 </div>
                
//                 {courses.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {courses.slice(0, 3).map((course) => (
//                       <CourseCard 
//                         key={course.id}
//                         course={course}
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className={`text-center py-8 rounded-lg ${
//                     darkMode ? 'bg-gray-700' : 'bg-gray-50'
//                   }`}>
//                     <BookOpen className={`mx-auto h-12 w-12 ${
//                       darkMode ? 'text-gray-400' : 'text-gray-500'
//                     }`} />
//                     <h3 className={`mt-4 text-lg font-medium ${
//                       darkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}>
//                       You haven't enrolled in any courses yet
//                     </h3>
//                     <p className={`mt-2 ${
//                       darkMode ? 'text-gray-400' : 'text-gray-600'
//                     }`}>
//                       Browse courses to begin learning
//                     </p>
//                     <Link
//                       to="/courses"
//                       className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//                     >
//                       Browse Courses
//                     </Link>
//                   </div>
//                 )}
//               </div>

//               {/* Upcoming Classes */}
//               <div className={`rounded-xl p-6 shadow-sm ${
//                 darkMode 
//                   ? 'bg-gray-800 border-gray-700' 
//                   : 'bg-white border-gray-200'
//               } border`}>
//                 <div className="flex items-center gap-2 mb-6">
//                   <Calendar className={`h-5 w-5 ${
//                     darkMode ? 'text-blue-400' : 'text-blue-600'
//                   }`} />
//                   <h2 className={`text-xl font-bold ${
//                     darkMode ? 'text-white' : 'text-gray-900'
//                   }`}>
//                     Upcoming Classes
//                   </h2>
//                 </div>
                
//                 {upcomingClasses.length > 0 ? (
//                   <div className="space-y-4">
//                     {upcomingClasses.map((classItem) => (
//                       <div 
//                         key={classItem._id} 
//                         className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
//                           darkMode 
//                             ? 'bg-gray-700 hover:bg-gray-600' 
//                             : 'bg-gray-50 hover:bg-gray-100'
//                         }`}
//                       >
//                         <div>
//                           <h3 className={`font-medium ${
//                             darkMode ? 'text-white' : 'text-gray-900'
//                           }`}>
//                             {classItem.title}
//                           </h3>
//                           <p className={`text-sm ${
//                             darkMode ? 'text-gray-300' : 'text-gray-600'
//                           }`}>
//                             with {classItem.instructor}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className={`font-medium ${
//                             darkMode ? 'text-blue-400' : 'text-blue-600'
//                           }`}>
//                             {new Date(classItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </p>
//                           <button
//                             className={`mt-1 px-3 py-1 rounded-lg font-medium text-sm transition-colors ${
//                               darkMode 
//                                 ? 'bg-gray-600 text-white hover:bg-gray-500' 
//                                 : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
//                             }`}
//                           >
//                             Join Class
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className={`text-center py-8 rounded-lg ${
//                     darkMode ? 'bg-gray-700' : 'bg-gray-50'
//                   }`}>
//                     <Calendar className={`mx-auto h-12 w-12 ${
//                       darkMode ? 'text-gray-400' : 'text-gray-500'
//                     }`} />
//                     <h3 className={`mt-4 text-lg font-medium ${
//                       darkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}>
//                       No upcoming classes
//                     </h3>
//                     <p className={`mt-2 ${
//                       darkMode ? 'text-gray-400' : 'text-gray-600'
//                     }`}>
//                       Check back later for scheduled sessions
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* My Courses Tab */}
//           {activeTab === 'courses' && (
//             <div className={`rounded-xl p-6 shadow-sm ${
//               darkMode 
//                 ? 'bg-gray-800 border-gray-700' 
//                 : 'bg-white border-gray-200'
//             } border`}>
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className={`text-2xl font-bold ${
//                   darkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   My Courses
//                 </h2>
//                 <Link 
//                   to="/courses" 
//                   className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
//                     darkMode 
//                       ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
//                       : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'
//                   } border`}
//                 >
//                   Browse More Courses
//                 </Link>
//               </div>
              
//               {courses.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {courses.map((course) => (
//                     <CourseCard 
//                       key={course.id}
//                       course={course}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className={`text-center py-8 rounded-lg ${
//                   darkMode ? 'bg-gray-700' : 'bg-gray-50'
//                 }`}>
//                   <BookOpen className={`mx-auto h-12 w-12 ${
//                     darkMode ? 'text-gray-400' : 'text-gray-500'
//                   }`} />
//                   <h3 className={`mt-4 text-lg font-medium ${
//                     darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     You haven't enrolled in any courses yet
//                   </h3>
//                   <p className={`mt-2 ${
//                     darkMode ? 'text-gray-400' : 'text-gray-600'
//                   }`}>
//                     Browse courses to begin learning
//                   </p>
//                   <Link
//                     to="/courses"
//                     className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
//                   >
//                     Browse Courses
//                   </Link>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Settings Tab */}
//           {activeTab === 'settings' && (
//             <SettingsForm user={user} darkMode={darkMode} />
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// const SettingsForm = ({ user, darkMode }) => {
//   const [formData, setFormData] = useState({
//     name: user.name,
//     email: user.email,
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [avatarPreview, setAvatarPreview] = useState(null);
//   const [avatarFile, setAvatarFile] = useState(null);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAvatarFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const formDataToSend = new FormData();
      
//       if (avatarFile) {
//         formDataToSend.append('avatar', avatarFile);
//       }
//       formDataToSend.append('name', formData.name);
//       formDataToSend.append('email', formData.email);

//       const res = await axios.put('http://localhost:1111/api/v1/profile', formDataToSend, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       toast.success('Profile updated successfully');
//       // Update local user data if needed
//       localStorage.setItem('user', JSON.stringify(res.data.data));
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       toast.error(error.response?.data?.message || 'Failed to update profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.newPassword !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.put('http://localhost:1111/api/v1/profile/password', {
//         currentPassword: formData.currentPassword,
//         newPassword: formData.newPassword
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Password updated successfully');
//       setFormData({
//         ...formData,
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       });
//     } catch (error) {
//       console.error('Error updating password:', error);
//       toast.error(error.response?.data?.message || 'Failed to update password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden ${
//       darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//     } border`}>
//       <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//         <nav className="flex -mb-px">
//           <button
//             onClick={() => setActiveTab('profile')}
//             className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//               activeTab === 'profile' 
//                 ? darkMode 
//                   ? 'border-blue-500 text-blue-400' 
//                   : 'border-blue-500 text-blue-600'
//                 : darkMode 
//                   ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Profile Information
//           </button>
//           <button
//             onClick={() => setActiveTab('password')}
//             className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//               activeTab === 'password' 
//                 ? darkMode 
//                   ? 'border-blue-500 text-blue-400' 
//                   : 'border-blue-500 text-blue-600'
//                 : darkMode 
//                   ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Change Password
//           </button>
//           <button
//             onClick={() => setActiveTab('notifications')}
//             className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//               activeTab === 'notifications' 
//                 ? darkMode 
//                   ? 'border-blue-500 text-blue-400' 
//                   : 'border-blue-500 text-blue-600'
//                 : darkMode 
//                   ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' 
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Notifications
//           </button>
//         </nav>
//       </div>

//       <div className="p-6">
//         {activeTab === 'profile' && (
//           <form onSubmit={handleProfileSubmit}>
//             <div className="space-y-6">
//               <div className="flex flex-col items-center">
//                 <div className="relative mb-4">
//                   <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-md">
//                     {avatarPreview ? (
//                       <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white">
//                         {user.name ? user.name[0].toUpperCase() : 'U'}
//                       </div>
//                     )}
//                   </div>
//                   <label 
//                     htmlFor="avatar-upload"
//                     className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100"
//                   >
//                     <Edit className="w-5 h-5 text-gray-700" />
//                     <input
//                       id="avatar-upload"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleAvatarChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
//                   Click on the icon to change your profile picture
//                 </p>
//               </div>

//               <div>
//                 <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Full Name
//                 </label>
//                 <div className="mt-1 relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <UserIcon className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white' 
//                         : 'border-gray-300 text-gray-900'
//                     }`}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Email Address
//                 </label>
//                 <div className="mt-1 relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white' 
//                         : 'border-gray-300 text-gray-900'
//                     }`}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
//                       Saving...
//                     </>
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}

//         {activeTab === 'password' && (
//           <form onSubmit={handlePasswordSubmit}>
//             <div className="space-y-6">
//               <div>
//                 <label htmlFor="currentPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Current Password
//                 </label>
//                 <div className="mt-1 relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="password"
//                     name="currentPassword"
//                     id="currentPassword"
//                     value={formData.currentPassword}
//                     onChange={handleChange}
//                     className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white' 
//                         : 'border-gray-300 text-gray-900'
//                     }`}
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="newPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   New Password
//                 </label>
//                 <div className="mt-1 relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="password"
//                     name="newPassword"
//                     id="newPassword"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white' 
//                         : 'border-gray-300 text-gray-900'
//                     }`}
//                     required
//                     minLength="6"
//                   />
//                 </div>
//                 <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   Password must be at least 6 characters
//                 </p>
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Confirm New Password
//                 </label>
//                 <div className="mt-1 relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     id="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
//                       darkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white' 
//                         : 'border-gray-300 text-gray-900'
//                     }`}
//                     required
//                     minLength="6"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
//                       Updating...
//                     </>
//                   ) : (
//                     'Update Password'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}

//         {activeTab === 'notifications' && (
//           <div className="space-y-6">
//             <div>
//               <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Email Notifications
//               </h3>
//               <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                 Manage how you receive notifications via email
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                       Course Updates
//                     </h4>
//                     <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Get notified about new content and updates in your enrolled courses
//                     </p>
//                   </div>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input type="checkbox" className="sr-only peer" defaultChecked />
//                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                   </label>
//                 </div>
//               </div>

//               <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                       Class Reminders
//                     </h4>
//                     <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Receive reminders about upcoming live classes
//                     </p>
//                   </div>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input type="checkbox" className="sr-only peer" defaultChecked />
//                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                   </label>
//                 </div>
//               </div>

//               <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
//                       Promotional Offers
//                     </h4>
//                     <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Receive occasional offers and promotions
//                     </p>
//                   </div>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input type="checkbox" className="sr-only peer" />
//                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Save Preferences
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;