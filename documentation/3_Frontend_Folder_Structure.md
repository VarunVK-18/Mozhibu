<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">3. Frontend Folder Structure & Architecture</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
The frontend of the <strong>Mozhibu - Story</strong> platform is a massive Single Page Application (SPA) built using Angular. As the platform scales to support millions of users, the frontend codebase must remain clean, modular, and performant. To achieve this, the project strictly adheres to the <strong>LIFT principle</strong> (Locate, Identify, Flat, Try to be DRY) and utilizes an advanced lazy-loaded modular architecture. This document provides an exhaustive breakdown of the directory structure and the architectural patterns employed.
</p>

---

<h2 style="color: #28a745;">3.1 High-Level Module Architecture Strategy</h2>
<p style="line-height: 1.6;">
The Angular application is divided into three primary logical module types. This separation ensures that the initial bundle size downloaded by the user's browser is as small as possible, drastically improving First Contentful Paint (FCP) and Time to Interactive (TTI).
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Module Strategy</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Detailed Purpose & Contents</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Loading Method</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Core Module (`core/`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Contains singleton services (instantiated only once), global HTTP interceptors, application-level state management, and configuration files. It is strictly imported <strong>only once</strong> in the `AppModule`. Examples: `AuthService`, `JwtInterceptor`, `GlobalErrorHandler`.</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Eagerly loaded at startup.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Shared Module (`shared/`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">A collection of reusable, "dumb" UI components, custom pipes, and structural directives. These components do not hold complex business logic. Examples: `BookCardComponent`, `LoadingSpinner`, `TimeAgoPipe`, `PaginationComponent`.</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Imported by Feature Modules whenever needed.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Feature Modules (`features/`)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Domain-specific components bound together by their own routing. Examples include the `ReaderModule` (for viewing books), the `AuthorModule` (for writing), and the `AdminModule` (for moderation).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Lazy-loaded on demand via Angular Router.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">3.2 Exhaustive Directory Tree Breakdown</h2>

<pre style="background-color: #f4f4f4; border-left: 4px solid #0056b3; padding: 15px; font-family: monospace; color: #333; line-height: 1.5;">
Frontend/
├── src/
│   ├── app/
│   │   ├── core/                  # The Singleton Engine Room
│   │   │   ├── guards/            # Route Guards preventing unauthorized access
│   │   │   │   ├── auth.guard.ts  # Blocks unauthenticated users
│   │   │   │   └── role.guard.ts  # Checks JWT for 'writer' or 'superadmin' roles
│   │   │   ├── interceptors/      # HTTP Request/Response manipulators
│   │   │   │   ├── jwt.interceptor.ts # Injects Bearer token into outgoing requests
│   │   │   │   └── error.interceptor.ts # Catches 401s and forces logout
│   │   │   ├── models/            # Global TypeScript Interfaces (IBook, IUser)
│   │   │   └── services/          # Global Singletons
│   │   │       ├── auth.service.ts
│   │   │       └── theme.service.ts # Manages Light/Dark/Sepia mode state
│   │   │
│   │   ├── shared/                # The UI Component Library
│   │   │   ├── components/        # Reusable UI elements
│   │   │   │   ├── book-card/     # The standard book display thumbnail
│   │   │   │   ├── modal/         # Standardized popup dialogs
│   │   │   │   └── toast-alert/   # Notification snackbars
│   │   │   ├── directives/        # Custom DOM manipulators
│   │   │   │   └── click-outside.directive.ts # For closing dropdowns
│   │   │   └── pipes/             # View formatters
│   │   │       └── truncate.pipe.ts # Ellipses long book descriptions
│   │   │
│   │   ├── features/              # The Lazy-Loaded Business Domains
│   │   │   ├── auth/              # Handles Login, Register, Forgot Password
│   │   │   ├── reader/            # The core reading experience
│   │   │   │   ├── components/    # E.g., chapter-viewer, library-grid
│   │   │   │   ├── reader.module.ts
│   │   │   │   └── reader-routing.module.ts
│   │   │   ├── author/            # The writing and publishing dashboard
│   │   │   │   ├── components/    # E.g., text-editor, earnings-chart
│   │   │   │   └── services/      # Author-specific HTTP calls
│   │   │   ├── competitions/      # Browsing and entering contests
│   │   │   └── admin/             # Superadmin moderation tools
│   │   │
│   │   ├── styles/                # Global SCSS Architecture
│   │   │   ├── _variables.scss    # Master Color codes (Black, White, Blue, Green)
│   │   │   ├── _mixins.scss       # Responsive breakpoints and shadows
│   │   │   ├── _typography.scss   # Font definitions for readability
│   │   │   └── theme.scss         # CSS Variable injections for mode switching
│   │   │
│   │   ├── app.component.ts       # The Root Component (Contains RouterOutlet)
│   │   ├── app.module.ts          # The Root Module (Imports CoreModule)
│   │   └── app-routing.module.ts  # Master Routing (Configures Lazy Loading)
│   │
│   ├── assets/                    # Static Application Assets
│   │   ├── i18n/                  # Translation JSON files (en.json, ta.json)
│   │   ├── images/                # Logos, default avatars, empty state SVGs
│   │   └── icons/                 # Custom SVG icon sets
│   │
│   ├── environments/              # Build Configurations
│   │   ├── environment.ts         # Local Dev (API url: http://localhost:3000)
│   │   └── environment.prod.ts    # Production (API url: https://api.mozhibu.com)
│   │
│   └── index.html                 # The single HTML entry point
</pre>

---

<h2 style="color: #28a745;">3.3 Core Implementation Patterns</h2>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #0056b3; margin-top: 0;">State Management & RxJS Unidirectional Data Flow</h3>
  <p style="color: #333; line-height: 1.6;">
    Due to the complexity of the reading experience, state is managed utilizing RxJS `BehaviorSubjects` encapsulated within specialized Services.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>Unidirectional Flow:</strong> Components never mutate state directly. They call a method on a Service, the Service makes the HTTP call, and then updates the `BehaviorSubject`. Components subscribe to these observables and update their views automatically via the `async` pipe.</li>
    <li><strong>Optimistic UI Updates:</strong> When a user clicks "Like" on a book, the `BookService` immediately increments the local like count observable, updating the UI instantly. The HTTP request resolves in the background. If the request fails, the UI rolls back. This ensures a snappy, native-like user experience.</li>
  </ul>
</div>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #0056b3; margin-top: 0;">Routing Security via Advanced Guards</h3>
  <p style="color: #333; line-height: 1.6;">
    Angular Route Guards (`CanActivate`, `CanLoad`) are the primary defense against unauthorized access to client-side routes.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>`AuthGuard`:</strong> Intercepts routes requiring a logged-in user. If the user's `Token` is missing or expired, it saves their intended URL to local storage and redirects them to the `/login` screen.</li>
    <li><strong>`RoleGuard`:</strong> Decodes the JWT payload. If a Reader attempts to navigate to `/admin`, the `RoleGuard` prevents the `AdminModule` from even being downloaded from the server, instantly routing them to a "403 Forbidden" component.</li>
  </ul>
</div>

<div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
  <h3 style="color: #28a745; margin-top: 0;">Theming Engine & SCSS Architecture</h3>
  <p style="color: #333; line-height: 1.6;">
    The styling architecture relies on CSS Variables (`--var`) mapped to SCSS variables. This allows the theme to be swapped at runtime via JavaScript without reloading the page.
  </p>
  <pre style="background-color: #f4f4f4; padding: 10px; color: #333; border-left: 4px solid #28a745;">
// _variables.scss
$brand-primary: #0056b3;   // Mozhibu Blue
$brand-success: #28a745;   // Mozhibu Green
$text-dark: #000000;       // True Black
$bg-light: #ffffff;        // True White

// theme.scss (Runtime mapping)
:root {
  --app-bg: #{$bg-light};
  --app-text: #{$text-dark};
}
[data-theme="dark"] {
  --app-bg: #121212;
  --app-text: #e0e0e0;
}
  </pre>
</div>

</div>
