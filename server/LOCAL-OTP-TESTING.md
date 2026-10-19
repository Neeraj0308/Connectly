# Local OTP testing

This project now supports OTP verification locally without a domain, SMTP, or Resend.

When `NODE_ENV=development`, registration and password-reset OTPs are printed in the server terminal:

```
========================================
CONNECTLY DEVELOPMENT OTP
Purpose: registration
Email: user@example.com
OTP: 123456
Expires in: 10 minutes
========================================
```

Enter that 6-digit OTP on the Connectly verification page.

For production, set `NODE_ENV=production`, configure `RESEND_API_KEY` and `MAIL_FROM`, and verify the sending domain in Resend.
