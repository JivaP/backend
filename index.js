

import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://eliteforgefitness.com"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Contact API is running");
});

// Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS, // App password
//   },
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) console.error("❌ SMTP Connection failed:", err);
  else console.log("✅ SMTP server is ready");
});

// Contact form route
app.post("/sendMail", async (req, res) => {
  const { name, email, mobile, comments } = req.body;

  if (!name || !email || !mobile || !comments) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  try {
    // Email to admin
    const adminMailOptions = {
      from: `"Elite Forge Contact" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: "📩 New Contact Form Submission - Elite Forge",
      html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#f9f9f9;">
        <table width="100%" style="max-width:600px; margin:auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#fff;  text-align:center; padding:20px;">
          <img src="http://eliteforgefitness.com/Banner/logo.png" alt="EliteForge Logo" width="50"/>    <h1 style="margin:0; font-size:22px;color:"#000">Elite <span style="color:"#C61F1F;"
          >Forge</span></h1>
              <p style="margin:5px 0 0; font-size:14px;">New Contact Form Submission</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <h2 style="font-size:18px; margin-bottom:15px; color:#333;">Contact Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mobile:</strong> ${mobile}</p>
              <p><strong>Message:</strong><br/> ${comments}</p>
              <br/>
              // <img src="http://eliteforgefitness.com/Banner/logo.png" alt="EliteForge Logo" width="120"/>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#555;">
              © ${new Date().getFullYear()} Elite Forge. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
      `,
    };

    // Auto-reply to user
    const userMailOptions = {
      from: `"Elite Forge" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "✅ We Received Your Enquiry - Elite Forge",
      html: `
      <div style="font-family: Arial, sans-serif; padding:20px; background:#f9f9f9;">
        <table width="100%" style="max-width:600px; margin:auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#25D366; color:#fff; text-align:center; padding:20px;">
                          <img src="http://eliteforgefitness.com/Banner/logo.png" alt="EliteForge Logo" width="120"/>     <h1 style="margin:0; font-size:22px;">Thank you for contacting Elite Forge!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We have received your enquiry and will get back to you shortly.</p>
              <p><strong>Your Message:</strong> ${comments}</p>
              <br/>

            </td>
          </tr>
          <tr>
            <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#555;">
              © ${new Date().getFullYear()} Elite Forge. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.json({ success: true, message: "Message sent successfully ✅" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
