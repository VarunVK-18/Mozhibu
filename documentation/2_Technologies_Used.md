<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">2. Comprehensive Technologies Used & Justifications</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
The technological foundation of the <strong>Mozhibu - Story</strong> platform is carefully curated to achieve three primary goals: extreme high performance under heavy read load, rapid horizontal scalability, and unparalleled developer ergonomics. By maintaining a strict JavaScript/TypeScript ecosystem across both the frontend and backend, the project benefits from shared paradigms, unified tooling, and an extensive open-source package ecosystem. This document exhaustively details every technology chosen and the specific architectural reasoning behind those choices.
</p>

---

<h2 style="color: #28a745;">2.1 Frontend Technology Stack (Client-Side)</h2>
<p style="line-height: 1.6;">
The client-side application must deliver a highly interactive, fluid Single Page Application (SPA) experience. When a reader is deeply engrossed in a story, page reloads or jittery scrolling will instantly break immersion. Therefore, the architecture emphasizes modularity, aggressive caching, and reactive programming.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Core Technology</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Version / Spec</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Deep Architectural Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Angular (Framework)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">15+</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        Unlike React (which is a library), Angular provides a rigid, opinionated, batteries-included framework perfect for large enterprise applications. 
        <ul>
          <li><strong>Dependency Injection:</strong> Allows for highly testable singleton services (e.g., `AuthService`).</li>
          <li><strong>Lazy Loading:</strong> The `Author Dashboard` code is never downloaded by a user who is only a `Reader`, saving megabytes of bandwidth.</li>
          <li><strong>AOT Compilation:</strong> Ahead-of-Time compilation ensures templates are parsed during build time, resulting in blazing fast rendering in the browser.</li>
        </ul>
      </td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">TypeScript</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Strict Mode Enabled</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        Ensures compile-time type safety across the massive frontend codebase. By strictly typing the API responses (using Interfaces like `IBook`, `IUser`, `IEarnings`), runtime errors are drastically reduced. If the backend changes a field from `views` to `viewCount`, the TypeScript compiler instantly flags the breaking change on the frontend.
      </td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">RxJS (Reactive Extensions)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">7.x</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        The backbone of asynchronous operations in Angular. RxJS is used extensively for:
        <ul>
          <li><strong>Debouncing:</strong> When a user types in the search bar, RxJS waits 300ms after they stop typing before hitting the API, preventing server overload.</li>
          <li><strong>State Management:</strong> `BehaviorSubjects` hold the current user state and active theme, emitting changes instantly to all subscribed components without prop-drilling.</li>
        </ul>
      </td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">SCSS / SASS (Styling)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Preprocessor</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        CSS preprocessors enable variables, nesting, and mixins. This is absolutely critical for the platform's multi-theme reader interface. By defining `$bg-color` and `$text-color` as variables, switching from Light Mode to Dark Mode to Sepia Mode is handled effortlessly across hundreds of components.
      </td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">2.2 Backend Technology Stack (Server-Side)</h2>
<p style="line-height: 1.6;">
The backend acts as the central brain of Mozhibu - Story. It processes thousands of concurrent requests ranging from simple JSON retrieval to executing complex, CPU-intensive algorithms for Author Payouts and Leaderboard ranking.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #28a745; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Core Technology</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Version / Spec</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Deep Architectural Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">Node.js (Runtime)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">18.x LTS</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        Node.js utilizes a non-blocking, event-driven architecture (the Event Loop). Because Mozhibu - Story is highly I/O bound (reading from DB, sending to client) rather than CPU bound, Node.js can handle tens of thousands of concurrent readers on a single server instance without thread starvation.
      </td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">Express.js (Framework)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">4.x</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        A minimalist web framework providing robust routing and middleware support. We utilize Express to construct RESTful endpoints. Its middleware pipeline allows us to easily inject Authentication, Rate Limiting, and Error Handling globally before any business logic is executed.
      </td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">Mongoose (ODM)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">8.x</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        Object Data Modeling (ODM) library for MongoDB and Node.js. Mongoose provides a straight-forward, schema-based solution to model application data. 
        <ul>
          <li><strong>Validation:</strong> Ensures a Book cannot be saved without an Author ID.</li>
          <li><strong>Hooks:</strong> Automatically hashes user passwords `pre-save` to the database.</li>
          <li><strong>Population:</strong> Easily replaces an `authorId` string with the full Author object in a single query.</li>
        </ul>
      </td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">JSON Web Tokens (JWT)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">RFC 7519</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        Used for stateless authentication. When a user logs in, the server generates a signed token containing their ID and Role. Because the token is self-contained, the backend servers don't need to look up session data in the database for every single request, enabling infinite horizontal scaling of the Node.js instances.
      </td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">2.3 Database and Caching Layer (Persistence)</h2>
<p style="line-height: 1.6;">
Data persistence requires a system capable of handling highly variable, unstructured data (e.g., chapters of varying lengths, user settings) while maintaining strict performance SLAs.
</p>

<div style="border-left: 5px solid #0056b3; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #0056b3; margin-top: 0;">MongoDB (Primary NoSQL Store)</h3>
  <p style="color: #333; line-height: 1.5;">
    MongoDB was selected specifically due to its BSON document model. In a storytelling platform, documents (books) often embed arrays of sub-documents (reports, likes) or require deep linking (chapters). A traditional SQL database would require massive, slow `JOIN` tables for these operations. MongoDB's NoSQL structure accommodates rapid schema evolution without complex migration scripts locking the tables.
  </p>
</div>

<div style="border-left: 5px solid #28a745; padding-left: 15px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #28a745; margin-top: 0;">Redis (In-Memory Cache)</h3>
  <p style="color: #333; line-height: 1.5;">
    While MongoDB is fast, retrieving the same "Top 10 Books" leaderboard 5,000 times a minute would cripple the database. Redis acts as an ultra-high-speed, in-memory caching layer operating in microseconds.
  </p>
  <ul style="color: #333; line-height: 1.5;">
    <li><strong>Token Blacklisting:</strong> Caching invalidated JWT tokens upon user logout.</li>
    <li><strong>Rate Limiting:</strong> Preventing DDoS attacks by tracking API request counts per IP.</li>
    <li><strong>Sorted Sets:</strong> Maintaining real-time leaderboards for Competitions.</li>
  </ul>
</div>

---

<h2 style="color: #28a745;">2.4 Third-Party Cloud Integrations & SaaS</h2>
<p style="line-height: 1.6;">
To maintain enterprise-grade security, scalability, and compliance, Mozhibu - Story delegates specific specialized tasks to industry-leading SaaS providers.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #333; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">SaaS Provider</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Integration Depth & Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Stripe (Payments API)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Handles all financial transactions. Mozhibu never stores raw credit card numbers. Stripe handles Reader subscription recurring billing (via Webhooks). Stripe Connect is utilized to programmatically route payouts to Author bank accounts globally.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">AWS S3 / Cloudinary</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Binary object storage for heavy media assets. Used for storing Book Cover images, User Avatars, and potentially future audio book files. These assets are served via a Global CDN to ensure fast load times in any country.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Firebase Cloud Messaging (FCM)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Pushes real-time Web Push and Mobile Push notifications. Used to alert users immediately about new chapter releases from authors they follow, competition results, and moderation warnings.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Nodemailer / SendGrid</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Transactional email service. Responsible for delivering critical communications that require guaranteed delivery, such as Welcome emails, secure Password Reset tokens, and monthly earnings breakdown reports to Authors.</td>
    </tr>
  </tbody>
</table>

</div>
