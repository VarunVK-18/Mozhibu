<h1>8. Comprehensive Entity Relationship Diagram (ERD)</h1>

<p>
While MongoDB is fundamentally a NoSQL, schema-less document database, the Mozhibu platform architecture strictly enforces SQL-like relational integrity at the application layer using <strong>Mongoose `ObjectId` references</strong>. Because of the sheer size and complexity of the platform (spanning Content, Monetization, Subscriptions, Governance, and User Analytics), the relational mapping is extensive. 
</p>
<p>
The following document provides an exhaustive, attribute-level mapping of every collection in the database, defining exactly how data intersects between the Reader, the Author, and the System.
</p>

---

<h2>8.1 Master System ER Diagram</h2>

The diagram below maps all major collections. Pay close attention to the multiplicity (e.g., `||--o{` indicates a One-to-Many relationship, `||--o|` indicates a One-to-One or Zero).

```mermaid
erDiagram
    %% Core Content Entities & Authorship
    USER ||--o{ BOOK : "writes (authorId)"
    USER ||--o{ CHAPTER : "authors (authorId)"
    BOOK ||--|{ CHAPTER : "contains (bookId)"

    %% Reader Engagement
    USER ||--o{ BOOK : "saves to library"
    USER ||--o{ BOOK : "likes"
    USER ||--o{ READING_PROGRESS : "generates"
    BOOK ||--o{ READING_PROGRESS : "tracked_by"
    CHAPTER ||--o| READING_PROGRESS : "last_read_position"

    %% Financial & Monetization Ecosystem
    USER ||--o{ TRANSACTION : "initiates (userId)"
    CHAPTER ||--o{ TRANSACTION : "unlocked_by (relatedChapterId)"
    USER ||--o{ PAYOUT_REQUEST : "requests (authorId)"
    USER ||--o| SUBSCRIPTION : "holds active (userId)"

    %% System & Governance
    USER ||--o{ FEEDBACK : "submits (userId)"

    %% ==========================================
    %% Exhaustive Schema Attribute Definitions
    %% ==========================================

    USER {
        ObjectId _id PK "Auto-generated"
        string email UK "Unique, Indexed, Lowercase"
        string password "Encrypted via bcrypt (Select: false)"
        string mobile UK "Unique, Sparse Index"
        Date dob "Mandatory for monetization"
        string role "Enum: reader, author, admin, superadmin"
        string authProvider "Enum: local, google, facebook"
        string providerId "OAuth Subject ID"
        string name
        string penName UK "Unique Author Handle"
        boolean isOnboarded "Flag for profile completion"
        array savedBooks "Array of Book ObjectIds"
        array likedBooks "Array of Book ObjectIds"
        number coins "Wallet Balance (Min: 0)"
        string stripeCustomerId "For Stripe Webhooks"
        Date createdAt "Timestamp"
    }

    BOOK {
        ObjectId _id PK
        ObjectId authorId FK "Refers to USER"
        string title "Indexed (Text)"
        string synopsis "Indexed (Text)"
        string coverImage "Cloudinary URL"
        string language "Default: 'en'"
        string genre "Indexed"
        array tags "Array of Strings"
        boolean isPublished "Default: false"
        boolean isCompleted "Default: false"
        number views "Atomic counter ($inc)"
        number likes "Atomic counter ($inc)"
        number chapterCount "Cached total"
        Date createdAt "Timestamp"
    }

    CHAPTER {
        ObjectId _id PK
        ObjectId bookId FK "Refers to BOOK"
        ObjectId authorId FK "Refers to USER"
        number order "Sequence Number (e.g. 1, 2, 3)"
        string title
        string content "Rich HTML Payload (No Limit)"
        number wordCount "Calculated on save"
        boolean isPremium "Requires coins?"
        number cost "Cost in coins (if Premium)"
        string status "Enum: draft, published, archived"
        Date publishedAt
    }

    READING_PROGRESS {
        ObjectId _id PK
        ObjectId userId FK "Refers to USER"
        ObjectId bookId FK "Refers to BOOK"
        ObjectId chapterId FK "Refers to CHAPTER"
        number percentage "0 to 100"
        Date lastReadAt "Timestamp for sorting"
    }

    TRANSACTION {
        ObjectId _id PK
        ObjectId userId FK "Refers to USER"
        string type "Enum: purchase_coins, unlock_chapter, author_earnings, fiat_payout"
        number amount "Number of coins or fiat currency"
        string currency "Enum: COIN, USD, INR"
        ObjectId relatedBookId FK "Optional"
        ObjectId relatedChapterId FK "Optional"
        string stripePaymentIntentId "External Reference"
        string status "Enum: pending, completed, failed"
        Date createdAt
    }

    PAYOUT_REQUEST {
        ObjectId _id PK
        ObjectId authorId FK "Refers to USER"
        number coinsDeducted
        number fiatAmountRequested
        string currency
        string status "Enum: pending, approved, rejected"
        string adminNotes "Internal moderation note"
        Date requestedAt
    }

    SUBSCRIPTION {
        ObjectId _id PK
        ObjectId userId FK "Refers to USER"
        string stripeSubscriptionId UK
        string tier "Enum: Standard, Premium"
        Date currentPeriodStart
        Date currentPeriodEnd
        string status "Enum: active, canceled, past_due"
    }

    FEEDBACK {
        ObjectId _id PK
        ObjectId userId FK "Refers to USER"
        string category "Enum: bug, suggestion, complaint"
        string message
        string status "Enum: open, resolved"
        Date submittedAt
    }

    CONTACT_QUERY {
        ObjectId _id PK
        string name
        string email
        string message
        string status "Enum: new, read"
        Date createdAt
    }

    SETTINGS {
        string _id PK "Hardcoded to 'singleton'"
        string contactEmail
        string contactPhone
        number coinToUsdRate "E.g., 0.01"
        number authorRevenueSharePercentage "E.g., 70"
        number minimumPayoutThreshold "E.g., 5000"
    }
```

---

<h2>8.2 Relational Integrity & Mongoose Cascading Deletes</h2>
<p>
Because MongoDB does not natively support `ON DELETE CASCADE` constraints at the database engine level (unlike SQL), failing to clean up references results in "Orphaned Documents" and critical application errors (e.g., trying to read a Chapter whose parent Book no longer exists).
</p>
<p>
Mozhibu solves this by implementing rigorous <strong>Mongoose Pre-Remove Hooks</strong>. When an entity is deleted, Mongoose intercepts the deletion and recursively triggers `$deleteMany` and `$pull` operations on all child entities.
</p>

### The Cascade Deletion Flowchart

```mermaid
flowchart TD
    Trigger[Admin/User calls .remove() on Entity]
    
    Trigger --> IsUser{Is it a User?}
    IsUser -->|Yes| UserCascade
    
    subgraph User Deletion Cascade
        UserCascade[User.pre('remove')]
        UserCascade -->|Delete| DeleteBooks[Delete All Books where authorId = User._id]
        UserCascade -->|Delete| DeleteProgress[Delete All ReadingProgress for User]
        UserCascade -->|Delete| DeleteFeedback[Delete All Feedback for User]
        UserCascade -->|Nullify| NullifyPayouts[Set PayoutRequest.authorId = null (Keep for audits)]
    end
    
    DeleteBooks --> IsBook[Book Deletion Triggered]
    IsUser -->|No| CheckBook{Is it a Book?}
    CheckBook -->|Yes| IsBook
    
    subgraph Book Deletion Cascade
        IsBook[Book.pre('remove')]
        IsBook -->|Delete| DeleteChapters[Delete All Chapters where bookId = Book._id]
        IsBook -->|Delete| DeleteBookProgress[Delete All ReadingProgress where bookId = Book._id]
        IsBook -->|Pull Array| RemoveSaved[UpdateMany Users: $pull Book._id from savedBooks]
        IsBook -->|Pull Array| RemoveLiked[UpdateMany Users: $pull Book._id from likedBooks]
    end
    
    CheckBook -->|No| Done[Action Completed]
    DeleteChapters --> Done
    UserCascade --> Done
    
    style Trigger fill:#0056b3,color:#fff
    style UserCascade fill:#f44336,color:#fff
    style IsBook fill:#ff9800,color:#fff
    style Done fill:#4caf50,color:#fff
```

### Critical Implementation Note (Transactions)
Financial records (`Transactions`) are the **ONLY** entities in the database immune to cascading deletes. If a User is deleted, their `Transaction` ledger entries remain intact permanently. This is a strict requirement for financial compliance, tax auditing, and reconciling discrepancies with Stripe's external ledger. 

To handle this, when rendering an audit log, the application gracefully handles populated `userId` fields that return `null`, rendering them as "Deleted User" in the Admin Dashboard.