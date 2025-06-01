import { useEffect, useRef, useState } from "react";
import { Play, Award, Users, Star, Box, CheckCircle, ArrowRight, Monitor, Zap, Target, Globe, BookOpen, Clock, Download, Phone, Mail, Facebook, GraduationCap, MapPin, Calendar, Sparkles } from 'lucide-react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EnhancedHomePage = () => {
  const heroRef = useRef(null);
  const instructorRef = useRef(null);
  const workshopRef = useRef(null);
  const contactRef = useRef(null);
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // GSAP animations for each section
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 100, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
        },
      }
    );

    gsap.fromTo(
      instructorRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: instructorRef.current,
          start: "top 85%",
        },
      }
    );

    gsap.fromTo(
      workshopRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: workshopRef.current,
          start: "top 85%",
        },
      }
    );

    gsap.fromTo(
      contactRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contactRef.current,
          start: "top 85%",
        },
      }
    );

    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
      }
    );

    // Enhanced intersection observer for staggered child animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target.children,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                delay: index * 0.1,
              }
            );
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

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
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              background: `rgba(${Math.random() > 0.5 ? "59, 130, 246" : "16, 185, 129"}, 0.4)`,
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
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
          padding: "1.25rem 0",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
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
              gap: "1rem",
            }}
            data-animate
            id="nav-logo"
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                animation: "pulse 2.5s infinite",
              }}
            >
              <Box size={24} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "800",
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
                  fontSize: "0.875rem",
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
            }}
            data-animate
            id="nav-links"
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
                    fontWeight: "600",
                    fontSize: "1rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      y: -4,
                      background: "rgba(59, 130, 246, 0.15)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      y: 0,
                      background: "none",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {item}
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "3px",
                      background: "linear-gradient(90deg, #3B82F6, #10B981)",
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scaleX(1)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scaleX(0)")}
                  />
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <a
                href="/login"
                style={{
                  padding: "0.75rem 1.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    y: -4,
                    boxShadow: "0 10px 30px rgba(255, 255, 255, 0.15)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    y: 0,
                    boxShadow: "none",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
              >
                Sign In
              </a>
              <a
                href="/register"
                style={{
                  padding: "0.75rem 1.75rem",
                  background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    y: -4,
                    scale: 1.05,
                    boxShadow: "0 15px 40px rgba(59, 130, 246, 0.5)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    y: 0,
                    scale: 1,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
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
          background: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="grid-cols-1 lg:grid-cols-2"
          data-animate
          id="hero-content"
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "2rem",
                padding: "0.75rem 1.5rem",
                marginBottom: "2rem",
                backdropFilter: "blur(10px)",
                animation: "pulse 2s infinite",
              }}
            >
              <Sparkles size={18} color="white" />
              <span style={{ fontSize: "0.875rem", color: "white", fontWeight: "600" }}>
                🎉 First Website Launch & Workshop
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
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
                  background: "linear-gradient(135deg, #ffffff 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SketchUp & Lumion
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: "#d1fae5",
                lineHeight: "1.7",
                marginBottom: "3rem",
              }}
            >
              🎓 Join our inaugural 40-hour workshop and master professional 3D modeling and photorealistic rendering.
              <br />
              <strong style={{ color: "#ffffff" }}>First 3 days absolutely FREE!</strong>
            </p>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                marginBottom: "4rem",
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
                  boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    y: -4,
                    scale: 1.05,
                    boxShadow: "0 15px 40px rgba(59, 130, 246, 0.5)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    y: 0,
                    scale: 1,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
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
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "16px",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1.125rem",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    background: "rgba(255, 255, 255, 0.25)",
                    y: -4,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    background: "rgba(255, 255, 255, 0.15)",
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  });
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
              }}
              className="grid-cols-1 sm:grid-cols-3"
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
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      y: -5,
                      background: "rgba(255, 255, 255, 0.12)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      y: 0,
                      background: "rgba(255, 255, 255, 0.08)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
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
                      color: "#d1fae5",
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
              className="grid-cols-1 sm:grid-cols-2"
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                  borderRadius: "16px",
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    scale: 1.05,
                    rotateZ: 2,
                    boxShadow: "0 15px 30px rgba(59, 130, 246, 0.4)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    scale: 1,
                    rotateZ: 0,
                    boxShadow: "none",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
              >
                <Monitor size={40} style={{ margin: "0 auto 1rem", animation: "bounce 2s infinite" }} color="white" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "white" }}>
                  SketchUp Pro
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#d1fae5" }}>3D Modeling Mastery</p>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  borderRadius: "16px",
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    scale: 1.05,
                    rotateZ: -2,
                    boxShadow: "0 15px 30px rgba(16, 185, 129, 0.4)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    scale: 1,
                    rotateZ: 0,
                    boxShadow: "none",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
              >
                <Globe size={40} style={{ margin: "0 auto 1rem", animation: "spin 8s linear infinite" }} color="white" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "white" }}>
                  Lumion
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#d1fae5" }}>Photorealistic Rendering</p>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.15)",
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
                <span style={{ fontSize: "0.875rem", color: "#d1fae5" }}>Workshop Progress</span>
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "white" }}>Starting Soon!</span>
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
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <div
            data-animate
            id="instructor-header"
            style={{
              textAlign: "center",
              marginBottom: "4rem",
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
                color: "#d1fae5",
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
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
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
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                  animation: "pulse 3s infinite",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(59, 130, 246, 0.5)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    scale: 1,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
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
                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)",
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
                <div style={{ fontSize: "0.875rem", color: "#d1fae5", marginBottom: "0.5rem" }}>
                  Professional Photo Coming Soon
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  High-quality instructor photo will be added
                </div>
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
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(59, 130, 246, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(59, 130, 246, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <GraduationCap size={16} color="#3B82F6" />
                  <span style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                    HND Civil Engineering
                  </span>
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
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(16, 185, 129, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(16, 185, 129, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <MapPin size={16} color="#10B981" />
                  <span style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                    BCAS Jaffna
                  </span>
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
                  <span style={{ fontSize: "1.125rem", fontWeight: "500", color: "white" }}>
                    BSc Civil Engineering - ICBT Colombo
                  </span>
                </div>
                <p style={{ color: "#d1fae5", lineHeight: "1.6" }}>
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
                className="grid-cols-1 sm:grid-cols-2"
              >
                <div
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(59, 130, 246, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(59, 130, 246, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <Target size={24} style={{ margin: "0 auto 0.5rem", color: "#3B82F6" }} />
                  <div style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                    Specialized in
                  </div>
                  <div style={{ fontWeight: "600", color: "white" }}>
                    3D Visualization
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(16, 185, 129, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(16, 185, 129, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <Award size={24} style={{ margin: "0 auto 0.5rem", color: "#10B981" }} />
                  <div style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                    Expert in
                  </div>
                  <div style={{ fontWeight: "600", color: "white" }}>
                    Technical Drawing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Details Section */}
      <section
        id="workshop"
        ref={workshopRef}
        style={{
          padding: "6rem 2rem",
          background: "rgba(0, 0, 0, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
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
                color: "#d1fae5",
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
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
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
                  color: "#d1fae5",
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
                className="grid-cols-1 sm:grid-cols-2"
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
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(59, 130, 246, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(59, 130, 246, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <Clock size={20} color="#3B82F6" />
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                      Duration
                    </div>
                    <div style={{ fontWeight: "600", color: "white" }}>
                      40 Hours
                    </div>
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
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      scale: 1.05,
                      background: "rgba(16, 185, 129, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      scale: 1,
                      background: "rgba(16, 185, 129, 0.1)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <Award size={20} color="#10B981" />
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                      Certificate
                    </div>
                    <div style={{ fontWeight: "600", color: "white" }}>
                      Included
                    </div>
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
                      gsap.to(e.target, {
                        x: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        duration: 0.3,
                        ease: "power2.out",
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.target, {
                        x: 0,
                        background: "transparent",
                        duration: 0.3,
                        ease: "power2.out",
                      });
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
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      y: -4,
                      scale: 1.05,
                      boxShadow: "0 15px 40px rgba(59, 130, 246, 0.5)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      y: 0,
                      scale: 1,
                      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
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
                    gsap.to(e.target, {
                      y: -4,
                      background: "rgba(37, 211, 102, 0.3)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      y: 0,
                      background: "rgba(37, 211, 102, 0.2)",
                      duration: 0.3,
                      ease: "power2.out",
                    });
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
        ref={contactRef}
        style={{
          padding: "6rem 2rem",
          background: "rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
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
            data-animate
            id="contact-cards"
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
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    y: -10,
                    scale: 1.02,
                    background: "rgba(255, 255, 255, 0.12)",
                    boxShadow: `0 20px 40px rgba(${contact.color === "#3B82F6" ? "59, 130, 246" : contact.color === "#25D366" ? "37, 211, 102" : "24, 119, 242"}, 0.4)`,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    y: 0,
                    scale: 1,
                    background: "rgba(255, 255, 255, 0.08)",
                    boxShadow: "none",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
              >
                <contact.icon
                  size={40}
                  color={contact.color}
                  style={{ margin: "0 auto 1rem", display: "block" }}
                />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  {contact.title}
                </h3>
                <p style={{ fontSize: "1rem", color: "#d1fae5" }}>{contact.value}</p>
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
            <p style={{ fontSize: "1.125rem", color: "#d1fae5", marginBottom: "1rem" }}>
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
        ref={footerRef}
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
            maxWidth: "1280px",
            margin: "0 auto",
            textAlign: "center",
          }}
          data-animate
          id="footer-content"
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
              <div style={{ fontSize: "0.875rem", color: "#d1fae5" }}>
                First Launch 🚀
              </div>
            </div>
          </div>

          <p
            style={{
              color: "#d1fae5",
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
                  color: "#d1fae5",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    color: "#3B82F6",
                    background: "rgba(59, 130, 246, 0.15)",
                    y: -2,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    color: "#d1fae5",
                    background: "transparent",
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  });
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
              color: "#d1fae5",
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
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @keyframes textShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @media (max-width: 768px) {
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedHomePage;