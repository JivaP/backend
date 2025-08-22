// 📂 index.js
import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(
    cors({
        origin: "http://localhost:5173", // allow your React frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(bodyParser.json());

// ✅ Health check route
app.get("/", (req, res) => {
    res.send("🚀 Contact API is running");
});

// 📩 Contact API Route
app.post("/sendMail", async (req, res) => {
    const { name, email, mobile, comments } = req.body;

    // Validation
    if (!name || !email || !mobile || !comments) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    try {
        // ✅ Setup transporter (using Gmail with App Password)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER, // Your Gmail
                pass: process.env.MAIL_PASS, // Your App Password
            },
        });

        // ✅ Email details
        const mailOptions = {
            from: `"CelebIndiaVision Contact" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO || process.env.MAIL_USER,
            subject: "📩 New Contact Form Submission - CelebIndiaVision",
            html: `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" 
             style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <tr>
          <td style="background: #111; color: #fff; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 22px;">CelebIndiaVision</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">New Contact Form Submission</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <h2 style="font-size: 18px; margin-bottom: 15px; color: #333;">Contact Details</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Mobile:</strong> ${mobile}</p>
            <p style="margin: 8px 0;"><strong>Comments:</strong><br/> ${comments}</p>
          </td>
        </tr>
        <tr>
          <td style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #555;">
            © ${new Date().getFullYear()} CelebIndiaVision. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `,
        };


        // ✅ Send email
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Message sent successfully ✅" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
