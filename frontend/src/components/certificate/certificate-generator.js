"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Mail, Award, Calendar, Shield } from "lucide-react"

// Certificate Component
const Certificate = ({ student, course, completionDate, certificateRef }) => {
  return (
    <div
      ref={certificateRef}
      className="w-[800px] h-[600px] bg-white relative overflow-hidden"
      style={{ fontFamily: "serif" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-blue-300 rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 border-4 border-purple-300 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-indigo-300 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-18 h-18 border-4 border-blue-300 rounded-full"></div>
        </div>
      </div>

      {/* Border */}
      <div className="absolute inset-4 border-4 border-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg">
        <div className="absolute inset-2 border-2 border-gray-300 rounded-lg">
          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MODUNO
                </h1>
                <p className="text-sm text-gray-600 font-medium">Learning Platform</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">CERTIFICATE OF COMPLETION</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="px-12 py-6 text-center">
            <p className="text-lg text-gray-700 mb-6">This is to certify that</p>

            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h3>
              <p className="text-lg text-gray-600">@{student.username || student.email?.split("@")[0]}</p>
            </div>

            <p className="text-lg text-gray-700 mb-2">has successfully completed the workshop</p>

            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h4>
              <p className="text-gray-700">
                Duration: {course.duration} hours • {course.videos?.length} lessons
              </p>
            </div>

            <p className="text-lg text-gray-700 mb-6">conducted by</p>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900">Banusha Balasubramanyam</h4>
              <p className="text-gray-700 font-medium">HND in BCAS • BSc Hons in ICBT</p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-12 right-12">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Instructor Signature</p>
                <p className="text-xs text-gray-500 mt-1">Banusha Balasubramanyam</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Completed on{" "}
                    {new Date(completionDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="text-right">
                <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Platform Seal</p>
                <p className="text-xs text-gray-500 mt-1">MODUNO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Certificate Generator Component
const CertificateGenerator = ({ student, course, onClose }) => {
  const certificateRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const completionDate = new Date().toISOString()

  // Security: Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Print Screen
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s") ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault()
        alert("Screenshots and downloads are disabled for security purposes.")
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    // Disable drag and drop
    document.addEventListener("dragstart", (e) => e.preventDefault())

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("dragstart", (e) => e.preventDefault())
    }
  }, [])

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 297 // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

        // Add metadata
        pdf.setProperties({
          title: `Certificate - ${course.title}`,
          subject: `Course Completion Certificate for ${student.name}`,
          author: "Moduno Learning Platform",
          creator: "Moduno LMS",
        })

        const fileName = `Moduno_Certificate_${student.name.replace(/\s+/g, "_")}_${course.title.replace(/\s+/g, "_")}.pdf`
        pdf.save(fileName)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating certificate. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const sendEmail = async () => {
    setEmailSending(true)
    try {
      // Generate PDF blob for email attachment
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 297
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

        const pdfBlob = pdf.output("blob")

        // Create FormData for email sending
        const formData = new FormData()
        formData.append("to", student.email)
        formData.append("subject", `🎉 Congratulations! Your Moduno Course Certificate - ${course.title}`)
        formData.append("studentName", student.name)
        formData.append("courseTitle", course.title)
        formData.append("instructorName", "Banusha Balasubramanyam")
        formData.append("completionDate", new Date().toLocaleDateString())
        formData.append("certificate", pdfBlob, `Moduno_Certificate_${student.name.replace(/\s+/g, "_")}.pdf`)

        // Send email via API
        const response = await fetch("/api/send-certificate-email", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          setEmailSent(true)
          alert("Certificate sent to your email successfully!")
        } else {
          throw new Error("Failed to send email")
        }
      }
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Error sending email. Please try downloading the certificate instead.")
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Course Completion Certificate</h2>
              <p className="text-gray-600">Congratulations on completing {course.title}!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Security Notice */}
        <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
          <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Screenshots and screen recording are disabled to protect certificate authenticity. Use the download or
              email options below to save your certificate.
            </p>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="transform scale-75 origin-top">
              <Certificate
                student={student}
                course={course}
                completionDate={completionDate}
                certificateRef={certificateRef}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF Certificate
                </>
              )}
            </button>

            <button
              onClick={sendEmail}
              disabled={emailSending || emailSent}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {emailSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Sending Email...
                </>
              ) : emailSent ? (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Email Sent ✓
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Email Certificate
                </>
              )}
            </button>
          </div>

          {/* Email Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Certificate will be sent to: <span className="font-medium">{student.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateGenerator
