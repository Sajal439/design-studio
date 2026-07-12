# Security & Data Privacy: HomeCraft AI
**Application Security Protocols and Access Compliance**

---

## 1. Authentication Security

### 1.1 JWT Cookie Configuration
Session state is secured using stateless JSON Web Tokens (JWT) signed via the HMAC-SHA256 algorithm. Cookies are dispatched with strict attributes to prevent client-side hijacking:

```
Set-Cookie: session=<JWT_TOKEN>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```
- **HttpOnly:** Prevents Cross-Site Scripting (XSS) attacks from reading the session token.
- **Secure:** Enforces transport encryption (HTTPS).
- **SameSite=Strict:** Restricts cross-site request leakage, preventing Cross-Site Request Forgery (CSRF).

---

## 2. API Rate Limiting (Redis Sliding Window)

To defend against Denial of Service (DoS) and brute force login attempts, we implement a sliding window rate limiter backed by Redis.

- **Endpoints Configured:**
  - `POST /api/auth/login`: Max **5 attempts** per 10 minutes per IP.
  - `POST /api/rooms/{roomId}/generate`: Max **3 submissions** per minute per user ID (throttling GPU costs).
  - All other API routes: Max **60 requests** per minute per IP.

---

## 3. Safe File Upload Protocol

Allowing raw file uploads represents a high-risk attack vector (remote code execution, pixel floods). HomeCraft AI implements a multi-stage validation pipeline:

```
Incoming Upload File
       │
       ▼
[Check File Size] ──(>10MB)──▶ [Reject (413 Payload Too Large)]
       │
       ▼
[Validate Extension] ──(Not jpeg/png)──▶ [Reject (415 Unsupported Media)]
       │
       ▼
[Magic Number Byte Check] ──(Failed Header)──▶ [Reject (400 Bad Request)]
       │
       ▼
[EXIF Metadata Stripping] ──(Remove GPS/Camera specs)──▶ [Cloudinary Upload]
```

- **Magic Numbers Validation:** Read the first 4 bytes of the binary stream to ensure they match true JPEG (`FF D8 FF`) or PNG (`89 50 4E 47`) headers, bypassing fake extension renames.
- **EXIF Stripping:** Clean geographic tags, timestamp markers, and device details from images using processing libraries (Sharp in Next.js, Pillow in Python) prior to Cloudinary synchronization.
