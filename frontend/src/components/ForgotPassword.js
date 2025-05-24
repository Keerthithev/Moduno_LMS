import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Mail, AlertCircle, Loader2, CheckCircle, 
  ArrowLeft, Lock, Key, ChevronLeft 
} from 'lucide-react';
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

  useEffect(() => {
    // Simple fade-in animation using CSS transitions
    if (formRef.current) {
      formRef.current.style.opacity = '0';
      formRef.current.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        formRef.current.style.transition = 'all 0.6s ease-out';
        formRef.current.style.opacity = '1';
        formRef.current.style.transform = 'translateY(0)';
      }, 100);
    }
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
      const res = await axios.post('http://localhost:1111/api/v1/forgot-password', { email });
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
      const res = await axios.post('http://localhost:1111/api/v1/resend-otp', { email });
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
  
  // Validate inputs
  if (!email || !otp || otp.length !== 6) {
    setError('Please enter a valid email and 6-digit OTP');
    toast.error('Please enter a valid email and 6-digit OTP');
    return;
  }

  setLoading(true);
  
  try {
    const res = await axios.post('http://localhost:1111/api/v1/verify-otp', 
      { 
        email: email.toLowerCase().trim(), 
        code: otp.trim()  // Changed from 'otp' to 'code' to match backend expectation
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
  
  // Validate inputs
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

    const res = await axios.post('http://localhost:1111/api/v1/reset-password', 
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
    
    // Clear the reset token after successful reset
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
    
    // If token is invalid, reset the flow
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
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.75rem'
              }}>Reset your password</h2>
              <p style={{
                color: '#93C5FD',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                Enter your email address to receive a verification code
              </p>
            </div>

            <form onSubmit={handleSendOtp} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="email" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD',
                    marginBottom: '0.5rem'
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '1rem'
                  }}>
                    <Mail size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      height: '3rem',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none',
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
                  padding: '0.875rem 0',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: '1.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : 'Send OTP'}
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
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.75rem'
              }}>Verify OTP</h2>
              <p style={{
                color: '#93C5FD',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="otp" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD',
                    marginBottom: '0.5rem'
                  }}
                >
                  Verification Code
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '1rem'
                  }}>
                    <Key size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength="6"
                    pattern="\d{6}"
                    value={otp}
                     onChange={(e) => {
    // Only allow numbers and ensure max length
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  }}
                    placeholder="123456"
                    style={{
                      width: '100%',
                      height: '3rem',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none',
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
                  padding: '0.875rem 0',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1,
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
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.75rem'
              }}>Set New Password</h2>
              <p style={{
                color: '#93C5FD',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="newPassword" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD',
                    marginBottom: '0.5rem'
                  }}
                >
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '1rem'
                  }}>
                    <Lock size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength="8"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      height: '3rem',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="confirmPassword" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD',
                    marginBottom: '0.5rem'
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '1rem'
                  }}>
                    <Lock size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength="8"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      height: '3rem',
                      paddingLeft: '2.75rem',
                      paddingRight: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
        style={{
          /* your button styles */
          opacity: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8) ? 0.7 : 1,
          cursor: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8) ? 'not-allowed' : 'pointer'
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
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)',
      padding: '1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div ref={formRef} style={{
        width: '100%',
        maxWidth: '28rem',
        padding: '1rem'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '0.75rem',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box size={20} color="white" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              background: 'linear-gradient(to right, #3B82F6, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              MODUNO LMS
            </h1>
          </div>
        </Link>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          color: 'white'
        }}>
          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(5, 150, 105, 0.1)',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              borderRadius: '0.5rem',
              color: '#93C5FD',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle size={18} style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>{message}</span>
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '0.5rem',
              color: '#fca5a5',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {renderStep()}

          {step === 1 && (
            <Link to="/login" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#93C5FD',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem'
            }}>
              <ArrowLeft size={16} />
              Back to login
            </Link>
          )}
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#d1fae5'
          }}>
            © 2025 Moduno Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;