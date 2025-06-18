"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft, Lock, Key, ChevronLeft, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVisible, setIsVisible] = useState(false);

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

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => {
      particles.forEach(p => p.remove());
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('https://moduno-lms.onrender.com/api/v1/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
      setResendDisabled(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('https://moduno-lms.onrender.com/api/v1/resend-otp', { email });
      setMessage(res.data.message);
      setResendDisabled(true);
      toast.success('New OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Error resending OTP');
      toast.error(err.response?.data?.message || 'Error resending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !otp || otp.length !== 6) {
      setError('Please enter a valid email and 6-digit OTP');
      toast.error('Please enter a valid email and 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post('https://moduno-lms.onrender.com/api/v1/verify-otp', 
        { 
          email: email.toLowerCase().trim(), 
          code: otp.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      localStorage.setItem('resetToken', res.data.data.resetToken);
      setMessage(res.data.message);
      setStep(3);
      toast.success('OTP verified successfully');
    } catch (err) {
      console.error('OTP verification error:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Invalid OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }; 

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    
    try {
      const resetToken = localStorage.getItem('resetToken');
      if (!resetToken) {
        throw new Error('Session expired. Please start the password reset process again.');
      }

      const res = await axios.post('https://moduno-lms.onrender.com/api/v1/reset-password', 
        { 
          resetToken,
          newPassword 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      localStorage.removeItem('resetToken');
      
      setMessage(res.data.message);
      toast.success('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error resetting password';
      setError(errorMsg);
      toast.error(errorMsg);
      
      if (errorMsg.includes('token') || errorMsg.includes('expired')) {
        localStorage.removeItem('resetToken');
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Reset Your Password
              </h2>
              <p style={{ 
                color: '#93C5FD',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Enter your email to receive a verification code
              </p>
            </div>

            <form onSubmit={handleSendOtp} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#93C5FD',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#3B82F6'
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                  marginBottom: '1.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Send OTP
                  </>
                )}
              </button>
            </form>
          </>
        );
      case 2:
        return (
          <>
            <button
              onClick={() => setStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#93C5FD',
                cursor: 'pointer',
                marginBottom: '1rem',
                padding: '0.5rem 0'
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Verify OTP
              </h2>
              <p style={{ 
                color: '#93C5FD',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#93C5FD',
                  marginBottom: '0.5rem'
                }}>
                  Verification Code
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#3B82F6'
                  }}>
                    <Key size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    pattern="\d{6}"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    placeholder="123456"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                  marginBottom: '1rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: '#93C5FD', fontSize: '0.875rem' }}>
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendDisabled ? '#64748b' : '#3B82F6',
                      cursor: resendDisabled ? 'default' : 'pointer',
                      fontWeight: '600',
                      padding: 0
                    }}
                  >
                    {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </form>
          </>
        );
      case 3:
        return (
          <>
            <button
              onClick={() => setStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#93C5FD',
                cursor: 'pointer',
                marginBottom: '1rem',
                padding: '0.5rem 0'
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Set New Password
              </h2>
              <p style={{ 
                color: '#93C5FD',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#93C5FD',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#3B82F6'
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength="8"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#93C5FD',
                  marginBottom: '0.5rem'
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#3B82F6'
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength="8"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                  marginBottom: '1.5rem',
                  opacity: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8) ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Resetting password...
                  </>
                ) : message ? 'Password reset!' : 'Reset Password'}
              </button>
            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "2rem"
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

      {/* Main Card */}
      <div ref={formRef} style={{
        width: "100%",
        maxWidth: "450px",
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "3rem",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
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

        {/* Messages */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            color: "#93C5FD",
            marginBottom: "1.5rem"
          }}>
            <CheckCircle size={18} style={{ marginRight: "0.75rem", flexShrink: 0 }} />
            <span style={{ fontSize: "0.875rem" }}>{message}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: "12px",
            color: "#fca5a5",
            marginBottom: "1.5rem"
          }}>
            <AlertCircle size={18} style={{ marginRight: "0.75rem", flexShrink: 0 }} />
            <span style={{ fontSize: "0.875rem" }}>{error}</span>
          </div>
        )}

        {/* Current Step */}
        {renderStep()}

        {/* Back to Login Link */}
        {step === 1 && (
          <Link to="/login" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "#93C5FD",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginTop: "1.5rem"
          }}>
            <ArrowLeft size={16} />
            Back to login
          </Link>
        )}
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

export default ForgotPassword;