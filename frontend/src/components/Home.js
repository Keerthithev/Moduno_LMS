"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Award, Users, Star, Box, CheckCircle, ArrowRight, Monitor, Zap, Target, Globe, BookOpen, Clock, Download, Phone, Mail, Facebook, GraduationCap, MapPin, Calendar, Sparkles } from 'lucide-react'

const EnhancedHomePage = () => {
  const heroRef = useRef(null)
  const instructorRef = useRef(null)
  const featuresRef = useRef(null)
  const [isVisible, setIsVisible] = useState({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Enhanced intersection observer with stagger animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible((prev) => ({
                ...prev,
                [entry.target.id]: true,
              }))
            }, index * 100)
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B2545 0%, #172A57 50%, #1E3A8A 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: `rgba(${Math.random() > 0.5 ? "59, 130, 246" : "16, 185, 129"}, 0.3)`,
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(11, 37, 69, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1rem 0",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              animation: "slideInLeft 0.8s ease-out",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                animation: "pulse 2s infinite",
              }}
            >
              <Box size={20} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}
              >
                MODUNO
              </h1>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#93C5FD",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                }}
              >
                First Launch 🚀
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              animation: "slideInRight 0.8s ease-out",
            }}
          >
            <div style={{ display: "flex", gap: "1.5rem" }} className="hidden md:flex">
              {["Workshop", "Instructor", "Contact"].map((item, index) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#93C5FD",
                    cursor: "pointer",
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    animation: `fadeInDown 0.8s ease-out ${index * 0.1}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(59, 130, 246, 0.1)"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <a
                href="/login"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 8px 25px rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "none"
                }}
              >
                Sign In
              </a>
              <a
                href="/register"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px) scale(1.05)"
                  e.target.style.boxShadow = "0 12px 35px rgba(59, 130, 246, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)"
                  e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.3)"
                }}
              >
                Join Workshop
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "8rem 2rem 4rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          <div
            data-animate
            id="hero-content"
            style={{
              opacity: isVisible["hero-content"] ? 1 : 0,
              transform: isVisible["hero-content"] ? "translateX(0)" : "translateX(-100px)",
              transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "2rem",
                padding: "0.75rem 1.5rem",
                marginBottom: "2rem",
                backdropFilter: "blur(10px)",
                animation: "glow 2s ease-in-out infinite alternate",
              }}
            >
              <Sparkles size={18} color="#3B82F6" />
              <span style={{ fontSize: "0.875rem", color: "#93C5FD", fontWeight: "600" }}>
                🎉 First Website Launch & Workshop
              </span>
            </div>

            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "900",
                lineHeight: "1.1",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 50%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "textShine 3s ease-in-out infinite",
              }}
            >
              Master 3D Design
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "bounce 2s infinite",
                }}
              >
                SketchUp & Lumion
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: "#93C5FD",
                lineHeight: "1.7",
                marginBottom: "3rem",
                animation: "fadeInUp 1s ease-out 0.5s both",
              }}
            >
              🎓 Join our inaugural 40-hour workshop and master professional 3D modeling and photorealistic rendering.
              <br />
              <strong style={{ color: "#10B981" }}>First 3 days absolutely FREE!</strong>
            </p>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                marginBottom: "4rem",
                animation: "fadeInUp 1s ease-out 0.7s both",
              }}
            >
              <a
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1.25rem 2.5rem",
                  background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                  borderRadius: "16px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "1.125rem",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 8px 30px rgba(59, 130, 246, 0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-4px) scale(1.05)"
                  e.target.style.boxShadow = "0 15px 40px rgba(59, 130, 246, 0.5)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)"
                  e.target.style.boxShadow = "0 8px 30px rgba(59, 130, 246, 0.4)"
                }}
              >
                <Zap size={20} />
                Start Learning Now
                <ArrowRight size={20} />
              </a>

              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1.25rem 2rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1.125rem",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)"
                  e.target.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                }}
              >
                <Play size={20} />
                Watch Preview
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "2rem",
                animation: "fadeInUp 1s ease-out 0.9s both",
              }}
            >
              {[
                { number: "40", label: "Hours", color: "#10B981" },
                { number: "FREE", label: "3 Days", color: "#3B82F6" },
                { number: "CERT", label: "Included", color: "#F59E0B" },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-5px)"
                    e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.background = "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: stat.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.number}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#93C5FD",
                      fontWeight: "500",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            data-animate
            id="hero-visual"
            style={{
              opacity: isVisible["hero-visual"] ? 1 : 0,
              transform: isVisible["hero-visual"] ? "translateX(0)" : "translateX(100px)",
              transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
            }}
          >
            <div
              style={{
                position: "relative",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                padding: "3rem",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                transform: `perspective(1000px) rotateY(${(mousePosition.x - 50) * 0.1}deg) rotateX(${(mousePosition.y - 50) * 0.05}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                    borderRadius: "16px",
                    padding: "2rem",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    animation: "float 6s ease-in-out infinite",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05) rotateZ(2deg)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1) rotateZ(0deg)"
                  }}
                >
                  <Monitor size={40} style={{ margin: "0 auto 1rem", animation: "bounce 2s infinite" }} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>SketchUp Pro</h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>3D Modeling Mastery</p>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    borderRadius: "16px",
                    padding: "2rem",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    animation: "float 6s ease-in-out infinite 3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05) rotateZ(-2deg)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1) rotateZ(0deg)"
                  }}
                >
                  <Globe size={40} style={{ margin: "0 auto 1rem", animation: "spin 8s linear infinite" }} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Lumion</h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>Photorealistic Rendering</p>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", color: "#93C5FD" }}>Workshop Progress</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Starting Soon!</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, #3B82F6 0%, #10B981 100%)",
                      borderRadius: "6px",
                      animation: "shimmer 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section
        id="instructor"
        ref={instructorRef}
        style={{
          padding: "6rem 2rem",
          background: "rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            data-animate
            id="instructor-header"
            style={{
              textAlign: "center",
              marginBottom: "4rem",
              opacity: isVisible["instructor-header"] ? 1 : 0,
              transform: isVisible["instructor-header"] ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease-out",
            }}
          >
            <h2
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                marginBottom: "1rem",
                background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Meet Your Expert Instructor
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                color: "#93C5FD",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Learn from a qualified civil engineering professional with hands-on industry experience
            </p>
          </div>

          <div
            data-animate
            id="instructor-card"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "4rem",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
              padding: "3rem",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              opacity: isVisible["instructor-card"] ? 1 : 0,
              transform: isVisible["instructor-card"] ? "scale(1)" : "scale(0.9)",
              transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
            }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  animation: "pulse 3s infinite",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <GraduationCap size={80} color="white" />
                <div
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
                    animation: "shine 3s infinite",
                  }}
                />
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "1rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "#93C5FD", marginBottom: "0.5rem" }}>
                  Professional Photo Coming Soon
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>High-quality instructor photo will be added</div>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Banusha Balasubramaniyam
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(59, 130, 246, 0.1)",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <GraduationCap size={16} color="#3B82F6" />
                  <span style={{ fontSize: "0.875rem", color: "#93C5FD" }}>HND Civil Engineering</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <MapPin size={16} color="#10B981" />
                  <span style={{ fontSize: "0.875rem", color: "#93C5FD" }}>BCAS Jaffna</span>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  marginBottom: "2rem",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    color: "#10B981",
                  }}
                >
                  Current Education
                </h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <BookOpen size={20} color="#3B82F6" />
                  <span style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                    BSc Civil Engineering - ICBT Colombo
                  </span>
                </div>
                <p style={{ color: "#93C5FD", lineHeight: "1.6" }}>
                  Currently pursuing advanced studies in Civil Engineering, bringing fresh academic knowledge combined
                  with practical 3D visualization skills to help students master SketchUp and Lumion.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <Target size={24} style={{ margin: "0 auto 0.5rem", color: "#3B82F6" }} />
                  <div style={{ fontSize: "0.875rem", color: "#93C5FD" }}>Specialized in</div>
                  <div style={{ fontWeight: "600", color: "white" }}>3D Visualization</div>
                </div>
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <Award size={24} style={{ margin: "0 auto 0.5rem", color: "#10B981" }} />
                  <div style={{ fontSize: "0.875rem", color: "#93C5FD" }}>Expert in</div>
                  <div style={{ fontWeight: "600", color: "white" }}>Technical Drawing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Details Section */}
      <section
        id="workshop"
        style={{
          padding: "6rem 2rem",
          background: "rgba(0, 0, 0, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                marginBottom: "1rem",
                background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Our First Workshop Experience
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                color: "#93C5FD",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              We're excited to welcome you to our inaugural 3D Modeling & Rendering Workshop using SketchUp & Lumion!
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "2rem",
              marginBottom: "4rem",
            }}
          >
            <div
              data-animate
              id="workshop-card"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                padding: "3rem",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                opacity: isVisible["workshop-card"] ? 1 : 0,
                transform: isVisible["workshop-card"] ? "translateY(0)" : "translateY(50px)",
                transition: "all 1s ease-out",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #3B82F6 0%, #10B981 100%)",
                }}
              />

              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "2rem",
                  animation: "pulse 2s infinite",
                }}
              >
                <Sparkles size={32} color="white" />
              </div>

              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                3D Modeling & Rendering Workshop
              </h3>

              <p
                style={{
                  color: "#93C5FD",
                  marginBottom: "2rem",
                  lineHeight: "1.7",
                  fontSize: "1.125rem",
                }}
              >
                Master SketchUp and Lumion to create stunning 3D models and photorealistic renders. Get certified upon
                completion and enjoy our special launch offer!
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem",
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <Clock size={20} color="#3B82F6" />
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#93C5FD" }}>Duration</div>
                    <div style={{ fontWeight: "600", color: "white" }}>40 Hours</div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <Award size={20} color="#10B981" />
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#93C5FD" }}>Certificate</div>
                    <div style={{ fontWeight: "600", color: "white" }}>Included</div>
                  </div>
                </div>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 2rem 0",
                }}
              >
                {[
                  "🎓 Certificate of Participation",
                  "⏰ 40 Hours - Beginner to Professional",
                  "🎁 First 3 Days - Absolutely FREE",
                  "👥 Invite Friends & Colleagues Welcome",
                  "📅 Start Date Shared ASAP",
                  "💬 WhatsApp Community Support",
                ].map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      color: "#d1fae5",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)"
                      e.target.style.transform = "translateX(10px)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent"
                      e.target.style.transform = "translateX(0)"
                    }}
                  >
                    <CheckCircle size={16} color="#10B981" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "1rem" }}>
                <a
                  href="/register"
                  style={{
                    flex: 1,
                    padding: "1rem",
                    background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: "600",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)"
                    e.target.style.boxShadow = "0 12px 35px rgba(59, 130, 246, 0.4)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.3)"
                  }}
                >
                  Enroll Now
                </a>
                <a
                  href="https://chat.whatsapp.com/JGZ7KPvlpgJ11r5TaE3dNB"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "1rem",
                    background: "rgba(37, 211, 102, 0.2)",
                    border: "1px solid rgba(37, 211, 102, 0.3)",
                    borderRadius: "12px",
                    color: "#25D366",
                    fontWeight: "600",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(37, 211, 102, 0.3)"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(37, 211, 102, 0.2)"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  💬 Join Group
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        style={{
          padding: "6rem 2rem",
          background: "rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #ffffff 0%, #93C5FD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Get In Touch
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              marginBottom: "3rem",
            }}
          >
            {[
              {
                icon: Mail,
                title: "Email Us",
                value: "moduno58@gmail.com",
                href: "mailto:moduno58@gmail.com",
                color: "#3B82F6",
              },
              {
                icon: Phone,
                title: "WhatsApp",
                value: "0742145537",
                href: "https://wa.me/94742145537",
                color: "#25D366",
              },
              {
                icon: Facebook,
                title: "Facebook",
                value: "Moduno PvtLtd",
                href: "#",
                color: "#1877F2",
              },
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                style={{
                  display: "block",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(20px)",
                  textDecoration: "none",
                  color: "white",
                  transition: "all 0.4s ease",
                  animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-10px) scale(1.02)"
                  e.target.style.background = "rgba(255, 255, 255, 0.12)"
                  e.target.style.boxShadow = `0 20px 40px rgba(${contact.color === "#3B82F6" ? "59, 130, 246" : contact.color === "#25D366" ? "37, 211, 102" : "24, 119, 242"}, 0.3)`
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)"
                  e.target.style.background = "rgba(255, 255, 255, 0.08)"
                  e.target.style.boxShadow = "none"
                }}
              >
                <contact.icon
                  size={40}
                  color={contact.color}
                  style={{ margin: "0 auto 1rem", display: "block" }}
                />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{contact.title}</h3>
                <p style={{ color: "#93C5FD", fontSize: "1rem" }}>{contact.value}</p>
              </a>
            ))}
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              padding: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ fontSize: "1.125rem", color: "#93C5FD", marginBottom: "1rem" }}>
              📲 For any questions or further details, feel free to contact us on WhatsApp: 0742145537
            </p>
            <p style={{ fontSize: "1rem", color: "#64748b" }}>
              Join our WhatsApp group for updates and community support
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "4rem 2rem 2rem",
          background: "rgba(0, 0, 0, 0.5)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite",
              }}
            >
              <Box size={24} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  background: "linear-gradient(45deg, #3B82F6, #10B981, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}
              >
                MODUNO
              </h1>
              <div style={{ fontSize: "0.875rem", color: "#93C5FD" }}>First Launch 🚀</div>
            </div>
          </div>

          <p
            style={{
              color: "#93C5FD",
              marginBottom: "2rem",
              fontSize: "1.125rem",
            }}
          >
            Empowering the next generation of 3D designers
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {["Privacy Policy", "Terms of Service", "Contact", "Workshop Details"].map((link, index) => (
              <a
                key={index}
                href="#"
                style={{
                  color: "#93C5FD",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#3B82F6"
                  e.target.style.background = "rgba(59, 130, 246, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#93C5FD"
                  e.target.style.background = "transparent"
                }}
              >
                {link}
              </a>
            ))}
          </div>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginBottom: "1rem",
            }}
          >
            © 2025 Moduno Pvt Ltd. All rights reserved.
          </p>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#93C5FD",
              fontStyle: "italic",
            }}
          >
            🎉 Celebrating our first website launch and inaugural workshop! Thank you for being part of our journey.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes textShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @media (max-width: 768px) {
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedHomePage
