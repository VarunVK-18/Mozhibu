<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">7. Exhaustive API & Routing Architecture</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
The <strong>Mozhibu - Story</strong> Backend API is built strictly upon RESTful principles, utilizing predictable resource-oriented URLs, standard HTTP methods, and normalized JSON payloads. All endpoints are prefixed with `/api/v1/` to ensure backward compatibility for legacy mobile clients when future structural changes are inevitably introduced. This document exhaustively catalogs the routing architecture, protection levels, and expected payload models.
</p>

---

<h2 style="color: #28a745;">7.1 Authentication, Identity, & User Management</h2>
<p style="line-height: 1.6;">
These endpoints are the gateway to the application. They handle user registration, OAuth handshakes, JWT issuance, and secure profile management.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Method</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Endpoint Route & Parameters</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Protection Level</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Detailed Behavior & Constraints</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">POST</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/auth/register</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Public (Rate Limited)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Expects `email`, `password`, `mobile`. Hashes the password via bcrypt (Salt Rounds: 10). Generates a Verification Token and triggers SendGrid. Returns a signed JWT valid for 24 hours.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">POST</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/auth/login</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Public (Strict Rate Limit)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Authenticates user against MongoDB. If successful, strips sensitive data from the user object and returns it alongside the JWT. If the account is marked `status: 'suspended'`, aborts with 403.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">GET</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/users/me</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Bearer Token</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Decodes the token's `_id`. Queries the DB to retrieve the authenticated user's profile, including their `isPremium` status and deep-populated arrays like `savedBooks` and `following`.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">PUT</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/users/me/monetization</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #0056b3;">Bearer Token + 'writer' Role</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Updates the encrypted payout bank details (`accountNumber`, `ifscCode`). Fails automatically if the JWT role is strictly 'reader'.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">7.2 Content Delivery (Books & Chapters)</h2>
<p style="line-height: 1.6;">
These endpoints form the core of the Reader experience. They are highly optimized, utilizing pagination and selective field projection to minimize database load.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #333; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Method</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Endpoint Route & Query Strings</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Protection Level</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Detailed Behavior & Constraints</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">GET</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/books?genre=SciFi&page=1&limit=20</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Public</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Fetches published books. Uses Mongoose `.skip()` and `.limit()` for pagination. Applies filters based on query parameters. Excludes books with status 'draft' or 'suspended'.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">POST</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/books</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #0056b3;">Bearer Token + Multer</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Accepts `multipart/form-data`. Uploads the cover image to S3, retrieves the CDN URL, and creates a new Book document tied to the `req.user._id` as the author.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">GET</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/books/:bookId/chapters/:chapterId</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Public / Premium Check</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Fetches the actual text content of a chapter. <strong>Critical Logic:</strong> If `chapter.isLocked == true`, the middleware checks the `req.user.isPremium` flag. If false, it strips the `content` field and returns 403.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">POST</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace;">/api/v1/books/:id/like</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Bearer Token</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Executes an atomic `$addToSet` operation in MongoDB to push the `req.user._id` into the Book's `likes` array, preventing duplicate likes inherently. Updates the Engagement Score in the background.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">7.3 Exhaustive Request/Response Modeling</h2>

<p style="line-height: 1.6;">
To ensure the Frontend TypeScript models match the Backend precisely, all responses are wrapped in a standard Envelope format (`success`, `data`, `message`).
</p>

<div style="border-left: 5px solid #0056b3; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #0056b3; margin-top: 0;">Example: GET `/api/v1/users/me`</h3>
  <pre style="background-color: #fff; border: 1px solid #ddd; padding: 10px; color: #333;">
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "64f9b8a3e4b0d...",
    "email": "reader@example.com",
    "role": "reader",
    "isPremium": true,
    "favoriteGenres": ["Fantasy", "Thriller"],
    "savedBooks": [
      {
        "_id": "64fa12b...",
        "title": "The Silent Echo",
        "author": { "_id": "64fa88...", "username": "JohnDoe" }
      }
    ],
    "createdAt": "2026-01-15T08:00:00Z"
  }
}
  </pre>
</div>

---

<h2 style="color: #28a745;">7.4 HTTP Status Code & Error Standardization</h2>
<p style="line-height: 1.6;">
The API rigorously adheres to HTTP standards. The global `errorHandler.js` middleware ensures these codes are never deviated from, preventing the dreaded "200 OK with an error payload inside" anti-pattern.
</p>

<ul style="color: #333; line-height: 1.6; font-size: 1.05em;">
  <li><strong style="color: #28a745; background-color: #e6ffe6; padding: 2px 5px; border-radius: 3px;">200 OK / 201 Created:</strong> Successful operations. 201 is specifically reserved for POST requests that generate a new Database Document.</li>
  <li><strong style="color: #0056b3; background-color: #e6f2ff; padding: 2px 5px; border-radius: 3px;">400 Bad Request:</strong> Validation failed. Sent when `express-validator` detects missing fields, or when business logic constraints are violated (e.g., trying to publish a book with 0 chapters).</li>
  <li><strong style="color: #0056b3; background-color: #e6f2ff; padding: 2px 5px; border-radius: 3px;">401 Unauthorized:</strong> Missing, malformed, or expired JWT token. This status code acts as a strict signal for the Angular frontend to clear `localStorage` and route the user to `/login`.</li>
  <li><strong style="color: #0056b3; background-color: #e6f2ff; padding: 2px 5px; border-radius: 3px;">403 Forbidden:</strong> The token is valid, but the user's `role` lacks privileges. (e.g., A Reader trying to access the `/admin/payouts` endpoint).</li>
  <li><strong style="color: #333; background-color: #f2f2f2; padding: 2px 5px; border-radius: 3px;">404 Not Found:</strong> The requested resource (Book, Chapter, Competition) was deleted or the ObjectID provided is invalid.</li>
  <li><strong style="color: #333; background-color: #f2f2f2; padding: 2px 5px; border-radius: 3px;">429 Too Many Requests:</strong> Redis rate limiter triggered, preventing brute-force and DDoS attacks.</li>
  <li><strong style="color: red; background-color: #ffe6e6; padding: 2px 5px; border-radius: 3px;">500 Internal Server Error:</strong> A catastrophic backend failure (e.g., MongoDB connection dropped). Stack traces are stripped from the response in production.</li>
</ul>

</div>
