// This would be your API route for sending emails
// Example implementation for Next.js API route

import nodemailer from "nodemailer"
import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })

    const [fields, files] = await form.parse(req)

    const {
      to: [email],
      subject: [subject],
      studentName: [studentName],
      courseTitle: [courseTitle],
      instructorName: [instructorName],
      completionDate: [completionDate],
    } = fields

    const certificateFile = files.certificate?.[0]

    // Configure your email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email HTML template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .certificate-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations, ${studentName}!</h1>
            <p>You've successfully completed your course on Moduno</p>
          </div>
          
          <div class="content">
            <h2>Course Completion Certificate</h2>
            <p>We're thrilled to inform you that you have successfully completed the following course:</p>
            
            <div class="certificate-info">
              <h3>${courseTitle}</h3>
              <p><strong>Instructor:</strong> ${instructorName}</p>
              <p><strong>Completion Date:</strong> ${completionDate}</p>
              <p><strong>Platform:</strong> Moduno Learning Platform</p>
            </div>
            
            <p>Your dedication and hard work have paid off! This certificate represents your commitment to continuous learning and professional development.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Share your achievement on social media</li>
              <li>Add this certificate to your professional portfolio</li>
              <li>Explore more courses on Moduno to continue your learning journey</li>
            </ul>
            
            <p>Your certificate is attached to this email as a PDF file. You can download and print it for your records.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://moduno.com/courses" class="button">Explore More Courses</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Moduno for your learning journey!</p>
            <p>© 2024 Moduno Learning Platform. All rights reserved.</p>
            <p>If you have any questions, please contact us at support@moduno.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email with certificate attachment
    const mailOptions = {
      from: `"Moduno Learning Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: emailHTML,
      attachments: certificateFile
        ? [
            {
              filename: certificateFile.originalFilename,
              path: certificateFile.filepath,
              contentType: "application/pdf",
            },
          ]
        : [],
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({
      success: true,
      message: "Certificate email sent successfully",
    })
  } catch (error) {
    console.error("Email sending error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send certificate email",
      error: error.message,
    })
  }
}
