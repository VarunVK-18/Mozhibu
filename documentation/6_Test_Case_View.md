<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">6. Exhaustive Test Case View & Quality Assurance</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
To maintain the stability, security, and reliability of the <strong>Mozhibu - Story</strong> platform, a comprehensive, multi-tiered testing strategy is strictly enforced before any code is deployed to production. This involves E2E (End-to-End) testing for the Angular frontend (using Cypress), Integration testing for the Express API routes (using Supertest), and Unit testing for the core business logic services (using Jest). The theoretical test cases below represent the standard Quality Assurance (QA) protocols executed in the CI/CD pipeline.
</p>

---

<h2 style="color: #28a745;">6.1 Authentication, Authorization, & Security Boundaries</h2>
<p style="line-height: 1.6;">
Testing the security boundaries is paramount. These tests ensure users can only access their permitted resources and that malicious actors cannot escalate their privileges.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Test Case ID</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Exhaustive Scenario Description</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Expected System Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-AUTH-001</td>
      <td style="padding: 12px; border: 1px solid #ddd;">User attempts login with valid credentials (Email and correct password).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Server decrypts hash, matches password, returns 200 OK with a cryptographically signed JWT. Frontend saves token to `localStorage` and routes to Dashboard.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-AUTH-002</td>
      <td style="padding: 12px; border: 1px solid #ddd;">User attempts login with an invalid password (Brute force simulation: 15 attempts in 1 minute).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Server returns 401 Unauthorized for the first 5 attempts. After 5, the Redis Rate Limiter intercepts the request and returns 429 Too Many Requests. IP is temporarily banned.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-AUTH-003</td>
      <td style="padding: 12px; border: 1px solid #ddd;">A user with the 'Reader' role forcibly manipulates their browser URL to access the `/admin` moderation endpoint.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Frontend Angular `RoleGuard` decodes the JWT, sees 'Reader', cancels the routing, and redirects to 403 Forbidden. The Admin JS chunk is never downloaded.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">6.2 Content Publishing & Edge-Case Workflow</h2>
<p style="line-height: 1.6;">
Ensuring the authoring tools function flawlessly under edge-case conditions, as they are the lifeblood of the platform's content generation.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #333; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Test Case ID</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Exhaustive Scenario Description</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Expected System Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-PUB-001</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Author submits a new Book payload missing the mandatory `genre` field (bypassing frontend validation via Postman).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Express-validator middleware catches the missing field before hitting the controller. Returns 400 Bad Request with an array of validation errors. Book is NOT saved to DB.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-PUB-002</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Author uploads a cover image that is actually a disguised `.exe` file masked as a `.png`.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Multer upload middleware inspects the file's Magic Bytes (MIME type signature), realizes it is not an image, and rejects the upload with a 415 Unsupported Media Type error.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-PUB-003</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Author successfully publishes a Chapter containing 15,000 words.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Chapter is saved. Mongoose `pre-save` hook calculates the exact word count and updates the parent Book's total word count. FCM push notification is triggered to all followers.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">6.3 Monetization, Payouts, & Financial Integrity</h2>
<p style="line-height: 1.6;">
Testing the complex algorithms that handle financial transactions, ensuring authors are paid correctly and readers cannot bypass paywalls.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Test Case ID</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Exhaustive Scenario Description</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Expected System Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-MON-001</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Free Reader directly calls the API endpoint for Chapter 10 (which is marked `isPremium = true`).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Backend verifies the user's `isPremium` status in the JWT. Since it is false, the backend strips the `content` field from the JSON response and returns a 403 Forbidden with a "Paywall" flag.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-MON-002</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Stripe Webhook fires indicating successful subscription payment, but the signature header is invalid or missing.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Backend webhook controller fails cryptographically verifying the Stripe signature. Aborts the operation to prevent spoofed payments. Returns 400 Bad Request.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-MON-003</td>
      <td style="padding: 12px; border: 1px solid #ddd;">End-of-month Cron job triggers the Payout Calculation for an author with zero valid bank details.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Earnings are calculated correctly, but the `status` is set to `pending_setup`. The author receives an automated email requesting KYC completion. Funds are held in escrow.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">6.4 High-Traffic Competitions Module</h2>
<p style="line-height: 1.6;">
Ensuring the high-traffic events operate without logic errors during critical deadlines.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #333; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Test Case ID</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Exhaustive Scenario Description</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Expected System Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-CMP-001</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Author attempts to submit a book exactly 1 second after the Competition `endDate` (Network latency simulation).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Backend relies on standardized UTC Server Time, ignoring client-side timestamps. The submission is rejected. UI shows "Competition has ended".</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">TC-CMP-002</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Two users "Like" a competition entry at the exact same millisecond (Race condition simulation).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">MongoDB's atomic `$addToSet` operator ensures both User IDs are appended to the `likes` array perfectly, and the total count reflects the correct number without overwriting.</td>
    </tr>
  </tbody>
</table>

</div>
