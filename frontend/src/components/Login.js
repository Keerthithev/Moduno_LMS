"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Box, Zap, Sparkles, Play, Award, Users, Star, CheckCircle, ArrowRight, Monitor, Target, Globe, BookOpen, Clock, GraduationCap, MapPin } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('login');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const showcaseRef = useRef(null);
  const loginRef = useRef(null);

  // Workshop stats data
  const workshopStats = [
    { number: "40+", label: "Hours Training", icon: <Clock size={24} />, color: "#3B82F6" },
    { number: "FREE", label: "3 Days Trial", icon: <Sparkles size={24} />, color: "#10B981" },
    { number: "100%", label: "Practical", icon: <Monitor size={24} />, color: "#F59E0B" },
    { number: "CERT", label: "Included", icon: <Award size={24} />, color: "#EC4899" }
  ];

  // Instructor features
  const instructorFeatures = [
    { text: "HND Qualified Civil Engineer", icon: <GraduationCap size={18} /> },
    { text: "BCAS Jaffna Alumni", icon: <MapPin size={18} /> },
    { text: "3D Visualization Specialist", icon: <Target size={18} /> },
    { text: "Current BSc Student at ICBT", icon: <BookOpen size={18} /> }
  ];

  useEffect(() => {
    // Animation on mount
    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Add floating particles to background
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.background = `rgba(${Math.random() > 0.5 ? "59, 130, 246" : "16, 185, 129"}, 0.3)`;
      particle.style.borderRadius = '50%';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '0';
      document.body.appendChild(particle);
      particles.push(particle);
    }

    // Intersection observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    if (showcaseRef.current) {
      observer.observe(showcaseRef.current);
    }
    if (loginRef.current) {
      observer.observe(loginRef.current);
    }

    return () => {
      particles.forEach(p => p.remove());
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axiosInstance.post('/login', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await axiosInstance.post('/google-login', 
        { token: credentialResponse.credential }
      );

      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Authentication failed. Please try again.');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "white",
      display: "flex",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}></div>

      {/* Left Panel - Workshop Showcase */}
      <div ref={showcaseRef} style={{
        flex: 1,
        padding: "3rem",
        display: "none",
        flexDirection: "column",
        justifyContent: "center",
        opacity: 0,
        transform: "translateX(-50px)",
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        '@media (min-width: 1024px)': {
          display: "flex"
        }
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Workshop Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "2rem",
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "2rem",
            padding: "0.75rem 1.5rem",
            width: "fit-content",
            animation: "glow 2s ease-in-out infinite alternate"
          }}>
            <Sparkles size={18} color="#3B82F6" />
            <span style={{ fontSize: "0.875rem", color: "#93C5FD", fontWeight: "600" }}>
              🎉 Inaugural Workshop Launch
            </span>
          </div>

          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "800",
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Master SketchUp & Lumion
          </h2>
          
          <p style={{ 
            fontSize: "1.125rem", 
            color: "#93C5FD",
            marginBottom: "2.5rem",
            lineHeight: "1.6"
          }}>
            Join our 40-hour intensive workshop and transform your 3D visualization skills with professional training.
          </p>

          {/* Workshop Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "2.5rem"
          }}>
            {workshopStats.map((stat, index) => (
              <div 
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`
                }}
              >
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.5rem"
                }}>
                  <div style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "700", 
                    color: stat.color
                  }}>
                    {stat.number}
                  </div>
                </div>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#93C5FD"
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Instructor Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            marginBottom: "2rem"
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "white"
            }}>
              <span style={{ 
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Expert Instructor
              </span>
            </h3>
            
            <div style={{ 
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                animation: "pulse 3s infinite"
              }}>
                <GraduationCap size={28} color="white" />
              </div>
              <div>
                <h4 style={{ 
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "0.25rem",
                  color: "white"
                }}>
                  Banusha Balasubramaniyam
                </h4>
                <p style={{ 
                  fontSize: "0.875rem",
                  color: "#93C5FD"
                }}>
                  Civil Engineer & 3D Specialist
                </p>
              </div>
            </div>

            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0
            }}>
              {instructorFeatures.map((feature, index) => (
                <li 
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0",
                    fontSize: "0.95rem",
                    color: "#d1fae5"
                  }}
                >
                  <div style={{ color: "#3B82F6" }}>
                    {feature.icon}
                  </div>
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>

          <button style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.5rem",
            background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
            margin: "0 auto"
          }}>
            <Play size={18} />
            Watch Workshop Preview
          </button>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        minHeight: "100vh"
      }}>
        <div ref={loginRef} style={{
          width: "100%",
          maxWidth: "450px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "3rem",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
          opacity: 0,
          transform: "translateX(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
          zIndex: 10
        }}>
          {/* Logo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
              animation: "pulse 2s infinite"
            }}>
              <Box size={20} color="white" />
            </div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}>
              MODUNO
            </h1>
          </div>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Welcome Back
            </h2>
            <p style={{ color: "#93C5FD", fontSize: "0.95rem" }}>
              Sign in to continue your 3D learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "0.75rem 1rem",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "12px",
              marginBottom: "1.5rem"
            }}>
              <AlertCircle size={18} color="#fca5a5" style={{ marginRight: "0.5rem" }} />
              <span style={{ color: "#fca5a5", fontSize: "0.875rem" }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#93C5FD",
                marginBottom: "0.5rem"
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#3B82F6"
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem 0.875rem 2.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#93C5FD",
                marginBottom: "0.5rem"
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#3B82F6"
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem 0.875rem 2.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease"
                  }}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              fontSize: "0.875rem"
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{
                    width: "1rem",
                    height: "1rem",
                    accentColor: "#10B981",
                    background: "rgba(255, 255, 255, 0.05)",
                    cursor: "pointer"
                  }}
                />
                <span style={{ color: "#93C5FD" }}>Remember me</span>
              </label>
              <Link to="/forgot-password" style={{
                color: "#93C5FD",
                textDecoration: "none",
                fontWeight: "500",
                transition: "all 0.2s ease"
              }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                marginBottom: "1.5rem"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            margin: "1.5rem 0",
            color: "#93C5FD"
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }}></div>
            <span style={{ padding: "0 1rem", fontSize: "0.75rem", fontWeight: "500" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }}></div>
          </div>

          {/* Social Login */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem"
          }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => setError('Google login failed')}
              theme="filled_blue"
              size="large"
              shape="pill"
            />
          </div>

          {/* Sign Up Link */}
          <p style={{
            textAlign: "center",
            color: "#93C5FD",
            fontSize: "0.875rem",
            marginTop: "1.5rem"
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: "#3B82F6",
              fontWeight: "600",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}>
              Sign up now
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;