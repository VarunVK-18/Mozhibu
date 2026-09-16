<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">4. Middleware & Backend Folder Structure</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
The Node.js (Express) backend for <strong>Mozhibu - Story</strong> is the critical engine powering the entire ecosystem. Because the platform must handle simultaneous high-volume read traffic (Readers fetching chapters) and complex, CPU-intensive transactional logic (Monetization payouts, Competition leaderboards), the codebase is organized using a strict Layered Architecture Pattern (Controller-Service-Model). This exhaustive separation of concerns ensures that routing logic, business logic, and database interactions are isolated, making the API highly testable, maintainable, and easy to scale across multiple development teams.
</p>

---

<h2 style="color: #28a745;">4.1 Backend Architecture & The Layered Pattern Strategy</h2>
<p style="line-height: 1.6;">
The API is designed as a monolithic repository composed of distinct logical layers. Every incoming HTTP request must pass through a standardized, secure pipeline of middleware before it is allowed to interact with the core business logic.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Architectural Layer</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Exhaustive Responsibility</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Primary Architectural Benefit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Routes Layer (`/routes`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Maps HTTP methods (GET, POST, PUT, DELETE) and URL paths to specific Controller functions. It acts as the traffic cop, attaching route-level middleware (like `requireAuth` or `upload.single`) before the controller is invoked.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Provides a centralized map of the entire API surface area.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Middleware Layer (`/middleware`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Intercepts requests globally or locally to validate JWT tokens, enforce IP-based rate limits via Redis, sanitize incoming JSON bodies against injection attacks, and parse multi-part file uploads using Multer.</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Keeps controllers DRY (Don't Repeat Yourself) by centralizing security and parsing logic.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Controller Layer (`/controllers`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">The Express-aware layer. It extracts parameters, query strings, and body payloads from the `req` object, calls the appropriate Service function, and formats the response back into standard HTTP JSON with the correct Status Code (200, 400, etc.).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Isolates HTTP transport logic from the actual business logic.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Service Layer (`/services`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">The core brain of the application. Executes complex algorithms (e.g., recursive payout calculations), interacts with external SaaS APIs (Stripe, AWS S3, Firebase), and commands the Models to fetch or save data. It is completely unaware of HTTP requests or responses.</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Highly testable. Services can be invoked by cron jobs or HTTP controllers interchangeably.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Data (Model) Layer (`/models`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Defines exact Mongoose schemas, database validation rules, lifecycle hooks (pre-save, post-update), and complex database aggregation pipelines.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Abstracts raw database interactions and ensures data integrity before insertion.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">4.2 Exhaustive Directory Tree Breakdown</h2>

<pre style="background-color: #f4f4f4; border-left: 4px solid #28a745; padding: 15px; font-family: monospace; color: #333; line-height: 1.5;">
Backend/
├── src/
│   ├── config/                # Environment Variables, Secrets & Connections
│   │   ├── db.js              # Mongoose instance configuration and replica set logic
│   │   ├── redis.js           # Redis client instantiation and connection pooling
│   │   └── stripe.js          # Stripe SDK initialization with secret keys
│   │
│   ├── middleware/            # Custom Express Pipeline Interceptors
│   │   ├── auth.js            # JWT verification, Token decoding, Role verification
│   │   ├── errorHandler.js    # Global try/catch interceptor to prevent Node crashes
│   │   ├── rateLimiter.js     # IP-based abuse prevention storing hit counts in Redis
│   │   ├── sanitize.js        # Express-validator chains for XSS/NoSQL injection prevention
│   │   └── upload.js          # Multer configurations for parsing image buffers
│   │
│   ├── models/                # Mongoose Schemas (The Persistence Layer)
│   │   ├── Book.js            # Defines book metadata, status enums, array of likes
│   │   ├── User.js            # Defines roles, encrypted monetization data, follow arrays
│   │   ├── Competition.js     # Defines active contests, tags, and start/end dates
│   │   ├── Chapter.js         # Defines chapter text, word counts, and lock status
│   │   └── ReadingProgress.js # High-write model tracking exact user reading percentage
│   │
│   ├── controllers/           # HTTP Request/Response Handlers
│   │   ├── authController.js  # login(), register(), verifyEmail(), forgotPassword()
│   │   ├── bookController.js  # getBooks(), createBook(), likeBook(), reportBook()
│   │   ├── payoutController.js# triggerMonthlyPayouts(), getAuthorEarnings()
│   │   └── webhookController.js# stripeWebhookHandler() (Validates Stripe signatures)
│   │
│   ├── services/              # Pure Business Logic Modules
│   │   ├── emailService.js    # Wraps Nodemailer/SendGrid logic for transactional emails
│   │   ├── paymentService.js  # Wraps Stripe API calls (Charge, Subscribe, Transfer)
│   │   ├── s3Service.js       # Logic for compressing and uploading buffers to AWS S3
│   │   └── readingService.js  # Algorithm calculating 'Qualified Reads' based on time spent
│   │
│   ├── routes/                # Express Router Definitions
│   │   ├── api/               # API versioning (v1)
│   │   │   ├── auth.js        # router.post('/login', authController.login)
│   │   │   ├── books.js       # router.post('/', requireAuth, upload.single('cover'), bookCtrl)
│   │   │   ├── users.js       # router.get('/:id', userController.getProfile)
│   │   │   └── webhooks.js    # Bypasses JSON parser to preserve raw body for Stripe signatures
│   │   │
│   │   └── index.js           # Mounts all API routes to the main app
│   │
│   ├── utils/                 # Helper functions (Pure functions)
│   │   ├── hashers.js         # bcrypt password hashing utilities
│   │   ├── logger.js          # Winston/Morgan logging configurations
│   │   └── dateHelpers.js     # Standardized timezone manipulation
│   │
│   └── server.js              # Entry point: Express app instantiation and port binding
│
├── tests/                     # Jest Test Suites
├── .env                       # Environment variables (Excluded from Git)
└── package.json               # Dependencies and scripts (npm start, npm run dev)
</pre>

---

<h2 style="color: #28a745;">4.3 Deep Dive into Critical Middleware Architectures</h2>

<p style="line-height: 1.6;">
Middlewares form the defensive shield of the backend API. They ensure that requests reaching the Controller layer are clean, authenticated, and safe to process.
</p>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #0056b3; margin-top: 0;">1. The Authentication & Authorization Pipeline (`auth.js`)</h3>
  <p style="color: #333; line-height: 1.6;">
    This middleware is responsible for the platform's security. It extracts the `Bearer Token` from the HTTP Authorization header. It uses the `jsonwebtoken` library to cryptographically verify the signature against the server's `JWT_SECRET`. 
  </p>
  <p style="color: #333; line-height: 1.6;">
    If valid, the user's `_id` and `role` are decoded and appended to the `req` object (e.g., `req.user`). This allows downstream controllers to know exactly who is making the request without querying the database. It also provides wrapper functions like `authorizeRoles('writer', 'superadmin')` to easily block standard readers from accessing publisher or admin endpoints.
  </p>
</div>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #0056b3; margin-top: 0;">2. Global Error Handling Strategy (`errorHandler.js`)</h3>
  <p style="color: #333; line-height: 1.6;">
    In standard Node.js applications, an unhandled Promise rejection will crash the entire server process. To prevent this, controllers use `next(err)` to pass errors to a centralized middleware block positioned at the very end of the routing pipeline.
  </p>
  <p style="color: #333; line-height: 1.6;">
    This middleware catches all errors (Mongoose validation errors, missing fields, Stripe failures). It logs the full stack trace to the server terminal (or a service like Sentry) for developers, but sanitizes the error message sent to the client to avoid leaking database schema details or stack traces in production, returning a consistent JSON structure `{ success: false, error: "Human readable message" }`.
  </p>
</div>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #0056b3; margin-top: 0;">3. High-Performance File Uploads (`upload.js`)</h3>
  <p style="color: #333; line-height: 1.6;">
    When an author uploads a high-resolution book cover, the request is multipart/form-data. This middleware utilizes `multer` to intercept the stream. It validates MIME file extensions (allowing only JPEG/PNG), enforces strict file size limits (e.g., Max 5MB to prevent memory exhaustion), and streams the buffer directly into the `S3Service` without temporarily saving it to the local Node server disk, preventing server storage overflow.
  </p>
</div>

</div>
