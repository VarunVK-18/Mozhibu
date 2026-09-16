# 5. Exhaustive Database Architecture & Schema Design

The Mozhibu platform relies on **MongoDB** (hosted on MongoDB Atlas via a dedicated M30 cluster) as its primary, highly-available data store. A NoSQL, document-oriented database was explicitly chosen over a traditional SQL database due to the inherently hierarchical and unstructured nature of literary content, where books can have varying numbers of Chapters, varying tags, and complex nested metadata that map perfectly to document structures. This document details every schema, indexing strategy, and optimization technique in use.

---

## 5.1 Core Architectural Data Principles

### Normalized vs. Denormalized Data (Referencing vs. Embedding)
In Mozhibu, we utilize a strictly enforced hybrid approach to balance read performance with database storage limits:

1. **Referencing (Normalization - The SQL Way):** 
   We use database references to link large, distinct entities that grow infinitely. For instance, a `Chapter` is a separate record that holds a reference pointer to its parent `Book`. 
   - *Why?* If a book has 2,000 chapters, embedding all that text inside the `Book` record would quickly crash the server due to size limits. Referencing keeps the `Book` record extremely lightweight (under 10KB), allowing the home page to load thousands of book covers instantly.
   
2. **Embedding (Denormalization - The NoSQL Way):** 
   Small, highly-coupled, and limited data is embedded directly inside the record.
   - *Example:* A User's reading preferences (e.g., "Fantasy", "Sci-Fi") are stored as a simple list directly inside the User's profile since they are always needed the moment the user logs in.

### Atomic Operations for High Concurrency
To prevent data race conditions when thousands of users read or interact with the same book simultaneously, the system NEVER fetches a record, modifies a value, and saves it back manually. 
Instead, we strictly use database-level atomic operators which guarantee accuracy during massive traffic spikes:
- **Incrementing:** Used to safely tick up `views`, `likes`, or `coins` by exactly 1 without overriding other users' actions.
- **Pushing / Pulling:** Used to safely add or remove a book from a user's library without creating duplicates.

---

## 5.2 Comprehensive Schema Logic

The following sections explain the exact structure and validation rules for our database collections, translated from code into plain logic.

### 5.2.1 The `User` Collection 

The `User` collection is the master record for authentication, demographics, and platform currency.

**Key Data Fields & Logic:**
- **Identity:** Requires a strictly formatted, unique email address. Passwords are securely hashed (scrambled) and are never exposed to the frontend APIs.
- **OAuth Integration:** Tracks if the user logged in via Google, Facebook, or traditional email. 
- **Demographics:** Requires a Name and Date of Birth (mandatory for financial monetization to ensure legal compliance).
- **Platform Ecosystem:** Tracks the user's role (Reader, Author, Admin) and maintains lists pointing to their Saved and Liked books.
- **Monetization:** Tracks the user's total Coin wallet balance (which is mathematically prevented from ever dropping below zero) and holds encrypted banking details for Authors requesting payouts.

**Automation Logic:** Before any User record is saved to the database, a background process intercepts the save, checks if the password was modified, and heavily encrypts it to prevent unauthorized access.

### 5.2.2 The `Book` Collection

The `Book` collection acts as a lightweight metadata wrapper for chapters. It is heavily queried to generate the visual discovery feeds on the Home Page.

**Key Data Fields & Logic:**
- **Core Information:** Requires a Title, Synopsis (max 2000 characters), Cover Image URL, and Language. 
- **Relationships:** Must contain a strict reference pointing back to the specific User who authored it.
- **Categorization:** Books are strictly categorized by a primary Genre and can contain a list of search Tags.
- **Analytics:** Contains high-performance counters for Views, Likes, and total Chapter Count.

**Automation Logic:** The database automatically builds a highly optimized "Text Index" combining the Title and Synopsis. This allows the search bar to instantly find matching books across millions of records without scanning them one by one.

### 5.2.3 The `Chapter` Collection

The `Chapter` collection contains the heavy payload data (the actual story text) and handles the financial paywalls.

**Key Data Fields & Logic:**
- **Relationships:** Must contain strict references back to the parent Book and the Author.
- **Content:** Holds the Chapter Title, the rich-text HTML story content, and a calculated word count.
- **Sequencing:** Contains an `order` number (e.g., 1, 2, 3) which defines the reading flow. The database mathematically enforces that no two chapters in the same book can share the same order number.
- **Monetization Gate:** Flags whether the chapter is "Premium" and, if so, exactly how many Coins it costs to unlock.

### 5.2.4 The `ReadingProgress` Collection

This collection tracks exactly where a user is in a book, powering the "Pick up where you left off" feature.

**Key Data Fields & Logic:**
- **Tracking:** Holds pointers to the User, the Book, and the current Chapter they are on.
- **Granularity:** Tracks their scroll percentage (0 to 100%) so they resume reading at the exact paragraph they left off.
- **Enforcement:** The database strictly enforces that a single User can only have ONE progress marker per Book, preventing duplicate bookmarks.

---

## 5.3 Financial & Operational Schemas

### 5.3.1 The `Transaction` Ledger
An immutable collection. Once a record is inserted here, it is **never** allowed to be updated or deleted. This provides a cryptographically sound, permanent audit trail of all platform currency.

**Key Data Fields & Logic:**
- **Ledger Entries:** Tracks the exact amount exchanged (which can be positive or negative) and the currency type (Coins, USD, INR).
- **Categorization:** Categorizes the transaction as either purchasing coins, unlocking a chapter, author earnings, or a fiat payout.
- **External Linking:** For real-money purchases, it permanently stores the Stripe Payment ID to easily cross-reference discrepancies with our bank accounts.

### 5.3.2 The `Settings` Singleton
Instead of hardcoding global variables in server files (which requires shutting down the server to change), we use a "Singleton" record in the database. 

**Key Data Fields & Logic:**
- **Uniqueness:** The system forces this collection to only ever contain exactly one record.
- **Variables:** Holds dynamic values like Contact Emails, Maintenance Mode toggles, Coin-to-USD conversion rates, and the Author Revenue Share percentage (e.g., Authors keep 70%). This allows Superadmins to tweak the platform economy live from the dashboard without touching code.

---

## 5.4 Advanced Database Optimization Techniques

### Extreme Read Performance
When generating the Home Page (which fetches Trending, Popular, and New books), asking the database to load hundreds of fully interactive records causes massive memory usage and slows down the server. 

**Optimization Logic:** 
Every read-only query in Mozhibu strips away all the interactive database logic and asks for "Lean" raw data. This simple architectural rule drops memory consumption by 90% and allows the server to handle 5x more concurrent users.

### Complex Financial Analytics
To calculate complex statistics for the Author Studio (e.g., "Total earnings grouped by month for a specific book"), we entirely bypass the main application server. 

**Optimization Logic:** 
We push the mathematical heavy lifting directly to the database servers using data pipelines. The database server rapidly groups, filters, and sums the financial data, returning only a tiny summary package to the main server. This prevents our web servers from crashing when analyzing millions of financial transactions.