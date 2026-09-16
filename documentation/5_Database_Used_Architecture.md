<div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px;">

<h1 style="color: #0056b3; border-bottom: 2px solid #28a745; padding-bottom: 10px;">5. Exhaustive Database Architecture & Scalability Patterns</h1>

<p style="font-size: 1.1em; line-height: 1.6;">
The persistence layer of <strong>Mozhibu - Story</strong> must balance two diametrically opposed forces: the unstructured, massively variable nature of literary content (where a chapter could be 500 words or 50,000 words) and the strict, transactional rules governing monetization, user roles, and competition entries. To achieve this delicate balance at a global scale, the platform leverages a <strong>MongoDB NoSQL Replica Set</strong> configured for high availability, heavily supplemented by a <strong>Redis</strong> in-memory caching tier to absorb read spikes.
</p>

---

<h2 style="color: #28a745;">5.1 MongoDB Topology & High Availability Engineering</h2>
<p style="line-height: 1.6;">
The production database is not a single point of failure. It is deployed as a 3-node Replica Set distributed across different physical data centers (Availability Zones) to ensure zero data loss and automated failover capabilities.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #0056b3; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Node Type</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Architectural Role</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Automated Failover Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Primary Node (Master)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Receives 100% of Write operations (Inserts, Updates, Deletes). Acts as the single, authoritative source of truth. All data written here is immediately streamed via the `oplog` to the secondaries.</td>
      <td style="padding: 12px; border: 1px solid #ddd;">If it goes offline (due to hardware failure or network partition), it steps down. The remaining nodes hold an automated election.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Secondary Node A (Read Replica)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Maintains an asynchronous, near-real-time copy of the Primary's data. Used to offload heavy Read operations (e.g., retrieving thousands of Chapters for Readers simultaneously).</td>
      <td style="padding: 12px; border: 1px solid #ddd; color: #28a745;">Can be elected as the new Primary within milliseconds, resulting in near-zero downtime.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #0056b3;">Secondary Node B (Analytics Node)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Serves as an additional Read replica, often specialized with different indexing or RAM allocations for running complex Aggregation Pipelines (e.g., end-of-month Author Payout calculations).</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Ensures a quorum (majority vote) is maintained during elections to prevent 'split-brain' scenarios.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">5.2 Data Modeling Strategy: Referencing vs. Embedding</h2>
<p style="line-height: 1.6;">
Unlike traditional SQL databases that require normalized tables connected by foreign keys, MongoDB allows for both embedding data (storing related data inside a single document) and referencing (linking documents via `ObjectId`). Choosing the correct pattern is critical for avoiding the 16MB BSON document size limit and preventing runaway RAM consumption.
</p>

<div style="border-left: 5px solid #28a745; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #28a745; margin-top: 0;">Pattern 1: Embedded Documents (The 1-to-Few Relationship)</h3>
  <p style="color: #333; line-height: 1.6;">
    Data is embedded when it is frequently accessed together and has a bounded, small growth rate.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>Moderation Reports on Books:</strong> Users flagging content for rule violations are stored as an array of sub-documents inside the `Book` model. A book rarely receives thousands of reports, so embedding them avoids a secondary lookup query when an admin reviews the book.</li>
    <li><strong>Monetization Config:</strong> A user's encrypted bank details are embedded inside the `User` model (`user.monetization.accountNumber`), as they are strictly 1-to-1 and accessed synchronously with the author's profile during payout processing.</li>
  </ul>
</div>

<div style="border-left: 5px solid #0056b3; padding-left: 15px; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px;">
  <h3 style="color: #0056b3; margin-top: 0;">Pattern 2: Referenced Documents (The 1-to-Millions Relationship)</h3>
  <p style="color: #333; line-height: 1.6;">
    Data is referenced when it grows unboundedly or needs to be accessed independently.
  </p>
  <ul style="color: #333; line-height: 1.6;">
    <li><strong>Chapters:</strong> A serialized `Book` can have hundreds of chapters, each containing 10,000 words. Embedding them into the `Book` document would quickly hit the 16MB limit and slow down searches. Therefore, `Chapters` are a separate collection referencing the `Book`'s `ObjectId`.</li>
    <li><strong>Reading Progress:</strong> Millions of tracking records exist independently. These reference both the `User` and the `Book` to allow rapid querying (e.g., "Find all users reading Book X") without bloating the core `User` model with an infinite array of read history.</li>
  </ul>
</div>

---

<h2 style="color: #28a745;">5.3 Aggressive Indexing & Query Optimization</h2>

<p style="line-height: 1.6;">
To ensure sub-100ms response times for readers scrolling through the app, aggressive indexing strategies are applied directly to the Mongoose schemas. Without indexes, MongoDB would perform a "Collection Scan," reading every single document to find a match, which is catastrophic at scale.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #333; color: white;">
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Index Strategy</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Target Field(s)</th>
      <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Optimization Goal & Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Unique Index (B-Tree)</td>
      <td style="padding: 12px; border: 1px solid #ddd;">`users.email`, `users.penName`</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Enforces data integrity at the database storage level, preventing duplicate account creations instantly, regardless of race conditions in the Node.js API.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Compound Index</td>
      <td style="padding: 12px; border: 1px solid #ddd;">`{ "author": 1, "status": 1 }` on Books</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Dramatically speeds up the Author Dashboard query. When a user requests "Get all my published books", the database jumps directly to the pre-sorted index node instead of scanning all books.</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Sparse Index</td>
      <td style="padding: 12px; border: 1px solid #ddd;">`competitions.winnerBookIds`</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Saves RAM by only indexing competitions that have actually concluded and selected winners. Active competitions are ignored by this index, saving space.</td>
    </tr>
    <tr style="background-color: #f2f2f2;">
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">Full-Text Search Index</td>
      <td style="padding: 12px; border: 1px solid #ddd;">`books.title`, `books.tags`</td>
      <td style="padding: 12px; border: 1px solid #ddd;">Powers the global search bar, allowing readers to find content using partial word matches, language-specific stemming, and weighted keyword rankings.</td>
    </tr>
  </tbody>
</table>

---

<h2 style="color: #28a745;">5.4 Data Security, Privacy, and Disaster Recovery</h2>
<p style="line-height: 1.6;">
Protecting user data and ensuring the platform can recover from catastrophic failures are foundational to the architecture.
</p>
<ul style="line-height: 1.6; color: #333;">
  <li><strong>Field-Level Encryption at Rest:</strong> While the entire database volume is encrypted (TDE), highly sensitive data like banking info (`monetization.accountNumber`) is additionally encrypted at the application level via AES-256-GCM before being written to MongoDB. Even if a DBA accesses the raw database, the financial data is unreadable cipher-text.</li>
  <li><strong>Network Isolation (VPC Peering):</strong> The database cluster resides within a Virtual Private Cloud. It has no public IP address and only accepts connections from the whitelisted internal Node.js backend IPs.</li>
  <li><strong>Continuous Backups & PITR:</strong> Point-in-time recovery (PITR) is enabled via Oplog archiving. If a superadmin accidentally drops a critical collection, the database can be "rewound" and restored to any specific second within the last 7 days.</li>
</ul>

</div>
