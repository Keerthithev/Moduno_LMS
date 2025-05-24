import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Box } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%);
  font-family: 'Inter', system-ui, sans-serif;
  color: white;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: none;
  flex-direction: column;
  justify-content: center;
  padding: 0 2rem;
  background: rgba(0, 0, 0, 0.2);
  
  @media (min-width: 1024px) {
    display: flex;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.6s ease-out forwards;
  opacity: 0;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  color: white;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 1rem;
  color: #4ade80;
`;

const Input = styled.input`
  width: 100%;
  height: 3rem;
  padding-left: 2.75rem;
  padding-right: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem 0;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #0B2545 0%, #172A57 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  opacity: ${props => props.loading ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.loading ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.loading ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'};
  }
  
  &:active {
    transform: ${props => props.loading ? 'none' : 'translateY(0)'};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  margin-bottom: 1.5rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before, &::after {
    content: '';
    height: 1px;
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DividerText = styled.span`
  padding: 0 1rem;
  color: #93C5FD;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const SocialButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LinkedInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #0077B5;
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #006097;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PulseBox = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #0B2545 0%, #172A57 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  animation: ${pulse} 2s infinite;
`;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const persistAuthData = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  useEffect(() => {
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
    
    try {
      const res = await axios.post('http://localhost:1111/api/v1/login', formData);
      persistAuthData(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:1111/api/v1/google-login', {
        token: credentialResponse.credential,
      });
      persistAuthData(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed. Please try another method.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Google authentication could not be completed.');
    setLoading(false);
    console.error('Google login failed');
  };

  const handleLinkedInLogin = () => {
    const scope = 'r_liteprofile r_emailaddress';
    const linkedInClientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID || '86b3jq9v47dhtt';
    const linkedInRedirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI || 
      'http://localhost:2222/api/v1/auth/linkedin/callback';
    
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedInClientId}&redirect_uri=${encodeURIComponent(linkedInRedirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = linkedInAuthUrl;
  };

  return (
    <Container>
      <LeftPanel>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <PulseBox>
              <Box size={24} color="white" />
            </PulseBox>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(to right, #3B82F6, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              MODUNO LMS
            </h1>
          </div>

          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '1.5rem'
          }}>
            Welcome back to<br />Your 3D Learning Journey
          </h2>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#93C5FD',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Access your premium SketchUp and Lumion courses with exclusive learning materials and mentorship.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#4ade80', 
                marginBottom: '0.5rem'
              }}>
                SketchUp
              </div>
              <p style={{ fontSize: '0.875rem', color: '#93C5FD', margin: 0 }}>
                Professional 3D Modeling
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#4ade80', 
                marginBottom: '0.5rem'
              }}>
                Lumion
              </div>
              <p style={{ fontSize: '0.875rem', color: '#93C5FD', margin: 0 }}>
                Photorealistic Rendering
              </p>
            </div>
          </div>

          <blockquote style={{
            borderLeft: '3px solid #4ade80',
            paddingLeft: '1rem',
            fontStyle: 'italic',
            color: '#d1fae5'
          }}>
            "Moduno's 3D rendering courses helped me transform my design career and land major clients."
            <footer style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#a7f3d0'
            }}>— Recent Graduate</footer>
          </blockquote>
        </div>
      </LeftPanel>

      <RightPanel>
        <FormContainer ref={formRef}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }} className="lg:hidden">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PulseBox style={{ width: '2.5rem', height: '2.5rem', marginRight: '0.75rem' }}>
                <Box size={20} color="white" />
              </PulseBox>
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
          </div>

          <LoginCard>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                Sign in to your account
              </h2>
              <p style={{ color: '#93C5FD', fontSize: '0.875rem' }}>
                Enter your credentials to access your dashboard
              </p>
            </div>

            <SocialButtonsContainer>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="filled_blue"
                    size="large"
                  />
                </div>
              </div>
              
              <LinkedInButton onClick={handleLinkedInLogin}>
                <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M34 20.333V34h-7.25v-12.5c0-3-1-5-3.5-5s-4 1.5-4 4.833V34H12.5V12.5h7v2.75h.1c1-1.8 3.3-3.5 6.8-3.5 7.25 0 8.6 4.7 8.6 10.583zM4.25 0a4.25 4.25 0 1 0 0 8.5A4.25 4.25 0 0 0 4.25 0zM0 34h8.5V12.5H0V34z" fill="white"/>
                </svg>
                LinkedIn
              </LinkedInButton>
            </SocialButtonsContainer>

            <Divider>
              <DividerText>Or continue with</DividerText>
            </Divider>

            {error && (
              <ErrorMessage>
                <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                <span style={{ fontSize: '0.875rem' }}>{error}</span>
              </ErrorMessage>
            )}

            <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
              <InputContainer>
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
                  <InputIcon>
                    <Mail size={18} />
                  </InputIcon>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </InputContainer>
              
              <InputContainer>
                <label 
                  htmlFor="password" 
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#93C5FD',
                    marginBottom: '0.5rem'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </InputContainer>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    id="remember"
                    type="checkbox"
                    style={{
                      width: '1rem',
                      height: '1rem',
                      accentColor: '#10b981',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                  <label htmlFor="remember" style={{ color: '#d1fae5' }}>
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" style={{
                  color: '#93C5FD',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease'
                }}>
                  Forgot password?
                </Link>
              </div>

              <SubmitButton type="submit" disabled={loading} loading={loading}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </SubmitButton>
            </form>

            <p style={{ 
              textAlign: 'center', 
              color: '#93C5FD',
              fontSize: '0.875rem', 
              margin: 0 
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{
                color: '#93C5FD',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Create account
              </Link>
            </p>
          </LoginCard>
        </FormContainer>
      </RightPanel>
    </Container>
  );
};

export default Login;