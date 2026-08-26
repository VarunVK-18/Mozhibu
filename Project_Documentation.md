# Mozhibu - Comprehensive Project Documentation

## 1. Executive Summary
Mozhibu is a robust, full-stack digital storytelling platform built to connect authors and readers globally. It supports rich media books, audio stories, translations, and a comprehensive monetization system. With a modern, highly responsive Angular 17 interface and a scalable Node.js/Express backend, the platform provides seamless experiences across devices.

## 2. Technical Architecture

### 2.1 Stack Overview
- **Frontend:** Angular 17 (Standalone Components, Signals, new Control Flow syntax `@if`/`@for`)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Google OAuth (SSO)
- **Deployment & Hosting:** Render (Backend API), Vercel/Netlify (Frontend)

### 2.2 Core Infrastructure
- **RESTful API:** Structured API architecture with strict token-based authentication and role-based access control (RBAC).
- **Socket.io Integration:** Real-time event broadcasting for in-app notifications.
- **Media Processing:** Integration with Multer for secure media uploads, supporting covers and chapter assets.

## 3. Platform Modules & Features

### 3.1 Authentication & User Roles
The platform implements a streamlined authentication flow and flexible role management.
- **Roles:** Reader, Writer, Superadmin.
- **Auto-Onboarding:** Readers can seamlessly upgrade to Writer status with a single click, instantly unlocking the Author Studio.
- **Google Auth Integration:** Secure one-click login and registration.
- **Strict Validations:** Robust security checks for passwords, usernames, and contact information.

### 3.2 Reading Experience (Reader Portal)
Designed for immersive content consumption.
- **Dynamic Homepage:** Custom algorithmic sections for "Trending Today," "Most Read," "Editor's Picks," and "Newly Published".
- **Advanced Search & Discovery:** Deep search capabilities for filtering by genre, tags, and status.
- **Reader Engagement:** Features for bookmarking, liking, rating, and commenting on specific chapters.
- **Audio & Multilingual Support:** Native support for audio stories and title translations.

### 3.3 Author Studio (Writer Portal)
A comprehensive CMS for writers to manage their IP.
- **Story Creation:** Tools for publishing new books, complete with cover uploading, tagging, and genre selection.
- **Chapter Editor:** Rich text chapter drafting and publishing workflow.
- **Auto-Publishing:** Books are published instantly to the platform without manual admin bottlenecks.
- **Author Dashboard:** Analytics tracking views, engagement, and revenue for their published books.

### 3.4 Competition Module
An end-to-end system for platform-wide writing contests.
- **Admin Orchestration:** Admins can configure the active competition title, description, and timeline.
- **Platform Broadcasts:** Push notifications can be blasted to all writers to invite submissions.
- **Seamless Participation:** Authors can enter the competition seamlessly from the homepage; their newly published books are automatically tagged.
- **Winner Announcement:** Admins can instantly select a winner from the submitted entries, triggering a platform-wide announcement and updating the homepage banner.

### 3.5 Monetization & Revenue Engine
A flexible architecture for premium content and author compensation.
- **Subscription Plans:** Configurable premium plans for readers to unlock gated content.
- **Author Earnings:** Tracking of "Qualified Reads" to distribute subscription revenue to authors based on their engagement scores.
- **Payout System:** Authors can view their accrued earnings and request withdrawals directly from their dashboard.

### 3.6 Superadmin Control Panel
Complete oversight over the platform ecosystem.
- **User & Content Moderation:** Ability to view, suspend, or delete users and books.
- **Revenue Configuration:** Dynamic control over revenue split configurations and engagement scoring algorithms.
- **Platform Analytics:** Real-time statistical dashboard of platform health and active user metrics.
- **Communications:** Ability to send global platform broadcasts and notifications.

## 4. UI/UX & Design Philosophy
- **Modern Aesthetics:** Utilizes glassmorphism, subtle micro-animations, and dynamic hover states for a premium feel.
- **Responsive Design:** Fluid layouts ensuring parity across desktop, tablet, and mobile environments.
- **Clean Forms:** Stripped-back, placeholder-driven forms for reduced cognitive load during signup and login.
- **Visual Feedback:** Integrated toast notifications and loading states across all asynchronous actions.

## 5. Security & Stability Implementations
- **URL Sanitization:** Strict Angular `DomSanitizer` integration for handling base64 imagery securely.
- **Role Guards:** Angular Route Guards protecting admin and author routes.
- **Compiler Compliance:** Refactored components utilizing Angular 17's strict HTML entity encoding for special characters (`&#64;`).
