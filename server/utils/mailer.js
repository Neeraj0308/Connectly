const sendOtpEmail = async ({ to, otp, purpose }) => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    throw new Error("RESEND_API_KEY and MAIL_FROM are required in production");
  }

  const isReset = purpose === "password_reset";
  const subject = isReset
    ? "Connectly password reset code"
    : "Connectly verification code";
  const title = isReset
    ? "Reset your password"
    : "Verify your Connectly account";
  const intro = isReset
    ? "Use the code below to reset your Connectly password."
    : "Use the code below to verify your email and finish creating your Connectly account.";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      text: `${title}\n\n${intro}\n\nYour code is: ${otp}\n\nThis code expires in 10 minutes. Never share it with anyone.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;color:#222"><h2>${title}</h2><p style="color:#666;line-height:1.6">${intro}</p><div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#fff1f5;padding:18px;text-align:center;border-radius:12px;margin:24px 0">${otp}</div><p style="color:#777;font-size:13px">This code expires in 10 minutes. Never share it with anyone.</p></div>`,
    }),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(`Email provider error: ${data}`);
  }
};

module.exports = { sendOtpEmail };
