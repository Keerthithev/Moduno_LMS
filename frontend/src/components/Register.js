import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Mail, Lock, User, AlertCircle, Loader2, Facebook, Check } from 'lucide-react';

const Register = () => {
     const login = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate API call for demo - replace with your actual registration logic
    try {
       const res = await axios.post('http://localhost:1111/api/v1/register', formData);
      login(res.data.token, res.data.user);
      setTimeout(() => {
        console.log('Registration attempt:', formData);
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    console.log(`Login with ${provider}`);
    // Here you would implement actual social login
    setTimeout(() => {
      setLoading(false);
      // Redirect after successful login
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)',

      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Left Side (Hidden on mobile) */}
      <div style={{
        flex: '1',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 2rem',
        background: 'rgba(0, 0, 0, 0.2)',
        '@media (min-width: 1024px)': {
          display: 'flex'
        }
      }} className="hidden lg:flex">
        <div style={{ maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '8px',
          background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)', // Dark blue gradient

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <Box size={24} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
               background: 'linear-gradient(to right, #3B82F6, #ffffff)', // Blue to white gradient

                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                MODUNO LMS
              </h1>
            </div>
          </div>

          <h2 style={{ 
            fontSize: '2.5rem', 
            color: 'white', 
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '1.5rem'
          }}>Join our first batch of<br />3D design students</h2>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#93C5FD', // Light blue
 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Register now to get a 50% discount on our premium 3D rendering courses and kickstart your design career.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'white',
              marginBottom: '1rem'
            }}>Why join Moduno LMS?</h3>
            <ul style={{ 
              padding: 0, 
              margin: 0, 
              listStyleType: 'none'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  padding: '0.25rem',
                  background: 'rgba(5, 150, 105, 0.2)',
                  borderRadius: '50%',
                  marginRight: '0.75rem',
                  marginTop: '0.125rem'
                }}>
                  <Check size={12} color="#4ade80" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#d1fae5' }}>
                  Learn SketchUp and Lumion from professionals
                </span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  padding: '0.25rem',
                  background: 'rgba(5, 150, 105, 0.2)',
                  borderRadius: '50%',
                  marginRight: '0.75rem',
                  marginTop: '0.125rem'
                }}>
                  <Check size={12} color="#4ade80" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#d1fae5' }}>
                  Get hands-on experience with real 3D projects
                </span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  padding: '0.25rem',
                  background: 'rgba(5, 150, 105, 0.2)',
                  borderRadius: '50%',
                  marginRight: '0.75rem',
                  marginTop: '0.125rem'
                }}>
                  <Check size={12} color="#4ade80" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#d1fae5' }}>
                  Build a professional 3D rendering portfolio
                </span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  padding: '0.25rem',
                  background: 'rgba(5, 150, 105, 0.2)',
                  borderRadius: '50%',
                  marginRight: '0.75rem',
                  marginTop: '0.125rem'
                }}>
                  <Check size={12} color="#4ade80" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#d1fae5' }}>
                  Earn course completion certificate
                </span>
              </li>
            </ul>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              height: '4px',
              width: '4px',
              borderRadius: '50%',
              background: '#4ade80'
            }}></div>
            <div style={{
              height: '4px',
              width: '4px',
              borderRadius: '50%',
              background: '#4ade80'
            }}></div>
            <div style={{
              height: '4px',
              width: '4px',
              borderRadius: '50%',
              background: '#4ade80'
            }}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div ref={formRef} style={{
          width: '100%',
          maxWidth: '400px',
        }}>
          {/* Mobile Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '8px',
            background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)', // Dark blue gradient

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <Box size={20} color="white" />
              </div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                background: 'linear-gradient(to right, #3B82F6, #ffffff)', // Blue to white gradient

                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                MODUNO LMS
              </h1>
            </div>
          </div>

          {/* Registration Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>Create your account</h2>
              <p style={{ color: '#93C5FD', // Light blue
 fontSize: '0.875rem' }}>
                Join our first batch with 50% discount
              </p>
            </div>

            {/* Social Login Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <button 
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Facebook size={20} color="#1877F2" />
                Facebook
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0'
            }}>
              <div style={{
                height: '1px',
                flex: '1',
                background: 'rgba(255, 255, 255, 0.1)'
              }}></div>
              <span style={{
                padding: '0 1rem',
                color: '#93C5FD', // Light blue

                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>Or continue with</span>
              <div style={{
                height: '1px',
                flex: '1',
                background: 'rgba(255, 255, 255, 0.1)'
              }}></div>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                <span style={{ fontSize: '0.875rem' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="name" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD', // Light blue

                    marginBottom: '0.5rem'
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '1rem'
                  }}>
                    <User size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
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
                  htmlFor="email" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD', // Light blue

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
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
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
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="password" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD', // Light blue

                    marginBottom: '0.5rem'
                  }}
                >
                  Password
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
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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

              <div style={{ 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <input
                  id="terms"
                  type="checkbox"
                  required
                  style={{
                    width: '1rem',
                    height: '1rem',
                    accentColor: '#10b981',
                    background: 'rgba(255, 255, 255, 0.05)',
                    marginTop: '0.25rem'
                  }}
                />
                <label htmlFor="terms" style={{ 
                  fontSize: '0.875rem',
                  color: '#93C5FD', // Light blue

                  lineHeight: '1.4'
                }}>
                  I agree to the <Link to="/terms" style={{ color: '#4ade80', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#4ade80', textDecoration: 'none' }}>Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem 0',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #0B2545 0%, #172A57 100%)', // Dark blue gradient

                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>

            <p style={{ 
              textAlign: 'center', 
              color: '#93C5FD', // Light blue
 
              fontSize: '0.875rem', 
              margin: 0 
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#93C5FD', // Light blue
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register