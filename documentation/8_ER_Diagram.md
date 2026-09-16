<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">8. Exhaustive ER Diagram & Data Modeling Deep Dive</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
This section provides a granular, macroscopic look at the data architecture powering <strong>Mozhibu - Story</strong>. Unlike SQL, NoSQL requires careful consideration of access patterns to avoid devastating `$lookup` performance bottlenecks. Below is the master Entity Relationship diagram illustrating how the 20+ MongoDB collections interact via Mongoose `ObjectId` references, followed by a comprehensive breakdown of the core transactional models and their specific field constraints.
</p>

---

<h2 style="color: #28a745;">8.1 Comprehensive Collection Relationships (The Global Map)</h2>

```mermaid
erDiagram
    USERS ||--o{ BOOKS : "authors (1:N)"
    USERS ||--o{ CHAPTERS : "reads/unlocks (M:N)"
    USERS ||--o{ REVIEWS : "authors (1:N)"
    USERS ||--o{ SUBSCRIPTION_PLANS : "subscribes via (1:1 per month)"
    USERS ||--o{ READING_PROGRESS : "tracks progress of (1:N)"
    USERS ||--o{ AUTHOR_EARNINGS : "receives payouts (1:N)"
    USERS ||--o{ USERS : "follows (M:N via arrays)"
    
    BOOKS ||--o{ CHAPTERS : "contains (1:N)"
    BOOKS ||--o{ REVIEWS : "receives (1:N)"
    BOOKS ||--o{ READING_PROGRESS : "monitored by (1:N)"
    
    COMPETITIONS ||--o{ BOOKS : "winnerBookIds (1:N)"
    COMPETITIONS ||--o{ COMPETITION_ENTRIES : "hosts (1:N)"
    
    COMPETITION_ENTRIES }o--|| BOOKS : "links to"
    COMPETITION_ENTRIES }o--|| USERS : "submitted by"

    BOOKS {
        ObjectId _id PK
        ObjectId author FK
        string title
        string genre
        string status
        boolean isPremium
        number views
        number likesCount
        array tags
    }

    CHAPTERS {
        ObjectId _id PK
        ObjectId book FK
        string title
        text content
        number wordCount
        boolean isLocked
        number orderIndex
    }

    USERS {
        ObjectId _id PK
        string username
        string role
        boolean isPremium
        object monetization
        array favoriteGenres
        number followersCount
    }

    AUTHOR_EARNINGS {
        ObjectId _id PK
        ObjectId author FK
        number amount
        string month
        string status
        ObjectId transactionId FK
    }

    SUBSCRIPTION_PLANS {
        ObjectId _id PK
        string name
        number price
        number durationDays
        boolean isActive
    }
    
    READING_PROGRESS {
        ObjectId _id PK
        ObjectId user FK
        ObjectId book FK
        ObjectId lastReadChapter FK
        number percentage
        datetime lastUpdated
    }
```

---

<h2 style="color: #28a745;">8.2 Core Collections Deep Dive & Indexing Justifications</h2>

<p style="line-height: 1.6;">
Each model below represents a Mongoose Schema. Field definitions are strict, utilizing Mongoose validation to reject dirty data before it reaches the MongoDB BSON serialization layer.
</p>

<div style="border-left: 5px solid #0056b3; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #0056b3; margin-top: 0;">1. The `ReadingProgress` Collection (High-Velocity Writes)</h3>
  <p style="color: #333; line-height: 1.6;">
    This is the most highly written-to collection in the entire database. It tracks exactly where a reader is within a book. It is crucial for two reasons: saving the user's place in the app, and calculating "Qualified Reads" which dictate complex author payouts.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>`user`</strong>: Reference to the User `ObjectId`. (Indexed)</li>
    <li><strong>`book`</strong>: Reference to the Book `ObjectId`. (Indexed)</li>
    <li><strong>`lastReadChapter`</strong>: Updates asynchronously via a debounced API call as the user scrolls through the frontend application.</li>
    <li><strong>`percentage`</strong>: Used by the UI to render visual progress bars (e.g., "75% complete") on the Reader's library page.</li>
    <li><strong>Compound Index:</strong> A unique compound index on `{ user: 1, book: 1 }` exists to ensure a single user can only have one progress tracker per book, triggering an `upsert` (Update or Insert) on the backend.</li>
  </ul>
</div>

<div style="border-left: 5px solid #28a745; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #28a745; margin-top: 0;">2. The `AuthorEarnings` Collection (Analytical / Batch Processing)</h3>
  <p style="color: #333; line-height: 1.6;">
    Unlike the real-time `ReadingProgress`, this collection is populated via massive batch processing. It is calculated recursively by a Node.js Cron job running at the end of each month. It aggregates data from `ReadingProgress`, total `SubscriptionPlans` revenue pool, and active `MonthlyAdRevenue`.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>`author`</strong>: The User ID of the writer receiving the payout.</li>
    <li><strong>`amount`</strong>: The precise calculated total stored as an integer (in cents/paise) to completely avoid JavaScript floating-point rounding errors (e.g., storing `10050` instead of `$100.50`).</li>
    <li><strong>`status`</strong>: Enum (`calculated`, `pending_transfer`, `paid`, `failed`). This acts as a state machine for the payout workflow.</li>
    <li><strong>`month`</strong>: Stored as a string (e.g., "2026-09") for rapid historical dashboard queries.</li>
  </ul>
</div>

<div style="border-left: 5px solid #333; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #333; margin-top: 0;">3. The `User` Collection (The Central Hub)</h3>
  <p style="color: #333; line-height: 1.6;">
    The `User` collection manages the authorization and personalization context for every session. Due to MongoDB's flexibility, it utilizes embedded sub-documents heavily.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>`role`</strong>: Enforces strict RBAC (`reader`, `writer`, `superadmin`).</li>
    <li><strong>`savedBooks` & `following`</strong>: Arrays of `ObjectIds`. Instead of a massive JOIN table to see who follows whom, MongoDB arrays allow for instant lookup. (e.g., `User.findById(id).populate('following')`).</li>
    <li><strong>`monetization`</strong>: An embedded sub-document (`accountName`, `accountNumber`). In Mongoose, these fields are marked with `select: false` so that a standard `User.findOne()` never accidentally returns sensitive bank details to the frontend unless explicitly requested via `.select('+monetization')`.</li>
  </ul>
</div>

</div>
