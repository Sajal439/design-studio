# Production Debugging Checklist

If the Quote Request or Consultation form is not working in production (Vercel), please verify the following:

## 1. Environment Variables in Vercel
Go to **Vercel Dashboard → Settings → Environment Variables** and ensure these are set:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | **Production** PostgreSQL URL (Not `localhost`) |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | Your Resend API Key |
| `ADMIN_EMAIL` | Your email address |

## 2. Database Schema
Ensure the production database has the same schema as your local one.
Run this locally (pointing to your production DB):
```bash
npx prisma db push
```

## 3. Check Logs
If the above are correct, please go to the **Vercel Logs** tab, trigger the error again by submitting the form, and send me any error messages you see.
