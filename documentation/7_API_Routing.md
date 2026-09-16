# 7. Exhaustive REST API Routing & Payloads

The backend acts as a highly structured communication gateway (REST API). Every route is meticulously designed to receive standard requests and return structured data, adhering to precise HTTP status codes (such as indicating Success, Bad Request, or Unauthorized). 

**Authentication Standard:** All protected features require a digital "Security Token" to be sent invisibly alongside the request. This token proves who the user is without requiring them to send their password repeatedly.

---

## 7.1 Authentication & Onboarding Domain (`/api/auth`)

### 1. Registering a New User (POST)
- **Data Sent to Server:** The user's requested Name, Email, highly secure Password, Mobile Number, and Date of Birth.
- **Server Logic:** The system verifies the email doesn't already exist, scrambles the password for security, creates the user, and generates a Security Token.
- **Data Returned to App:** The user's ID, Name, Email, and their new Security Token.

### 2. Logging In (POST)
- **Data Sent to Server:** Email and Password.
- **Server Logic:** The system checks the database, unscrambles and verifies the password, and issues a new Security Token valid for 30 days. It also checks if the user finished setting up their profile.
- **Data Returned to App:** The user's ID, Role (Reader/Author), Security Token, and a True/False flag indicating if their profile is fully completed.

### 3. Google/Facebook Social Login (POST)
- **Data Sent to Server:** The secure verification token provided directly by Google or Facebook.
- **Server Logic:** The backend asks Google to verify the token is legitimate. If valid, it either logs the user in or creates a brand new account for them instantly. Crucially, social logins often lack Date of Birth and Phone Numbers.
- **Data Returned to App:** The user's new Security Token and a True/False flag indicating if their profile is complete. If false, the frontend app will firmly force the user to the "Complete Profile" screen.

---

## 7.2 Content Discovery & Reader Core (`/api/books`)

### 1. Fetching the Library Feed (GET)
- **Data Sent to Server:** Filtering instructions, such as asking for Page 1, requesting exactly 20 items, filtering by "Fantasy", and sorting by "Most Popular".
- **Server Logic:** The database rapidly scans and sorts thousands of books, skipping the heavy story content and returning only lightweight covers.
- **Data Returned to App:** A list of books containing their Titles, Cover Images, Author Names, Total Views, and total Chapter Count, along with pagination tracking (e.g., "You are on page 1 of 15").

### 2. Fetching a Book's Table of Contents (GET)
- **Data Sent to Server:** The unique ID of the Book.
- **Server Logic:** The system retrieves all published chapters for that book, stripping out the heavy text content to save the user's internet bandwidth.
- **Data Returned to App:** An ordered list of chapters containing their Titles, Sequence Order, whether they are Premium, and how much they cost to unlock.

### 3. Saving Reading Progress (PUT)
- **Security:** Requires a valid Security Token.
- **Data Sent to Server:** The Book ID, Chapter ID, and the exact percentage of how far down the page the user has scrolled.
- **Server Logic:** The system finds the user's existing bookmark for that specific book and overrides it with the new percentage.
- **Data Returned to App:** A simple success confirmation.

---

## 7.3 Author Publishing Engine (`/api/author`)
*Note: All routes in this domain strictly require the server to verify the user holds the "Author" or "Superadmin" role.*

### 1. Creating a New Book (POST)
- **Data Sent to Server:** The Book Title, Synopsis, Genre, and the actual raw image file for the Book Cover.
- **Server Logic:** The server catches the image file, securely uploads it to a cloud image host (Cloudinary), waits for the permanent image URL to be generated, and then saves the final book record to the database under the author's name.
- **Data Returned to App:** The new Book ID and the permanent URL of the uploaded cover image.

### 2. Auto-Saving a Chapter (PUT)
- **Data Sent to Server:** The rich-text HTML story content written by the author, and a status indicating it is a "draft".
- **Server Logic:** The backend strictly checks that the user attempting to save the chapter is actually the legal owner of the parent book before overriding the text.
- **Data Returned to App:** A success confirmation and a timestamp of the last save.

---

## 7.4 Monetization & Financial Workflows (`/api/finance`)

### 1. Initiating a Coin Purchase (POST)
- **Security:** Requires a valid Security Token.
- **Data Sent to Server:** The ID of the Coin Package the user wants to buy (e.g., "1000 Coins for $10").
- **Server Logic:** The backend communicates securely with Stripe's banking servers to generate a unique, one-time checkout session.
- **Data Returned to App:** A secure URL pointing to Stripe's payment portal, which the frontend app uses to redirect the user.

### 2. The Stripe Webhook (POST)
- **Security:** This is a public route, but the server cryptographically verifies a unique signature header to ensure the request is genuinely coming from Stripe.
- **Data Sent to Server:** Raw transaction data sent directly from Stripe's servers in the background.
- **Server Logic:** The system reads the transaction. If Stripe confirms the payment was successful, the system automatically finds the user and adds the purchased coins to their digital wallet.
- **Data Returned to App:** A simple confirmation back to Stripe that the message was received.

### 3. Unlocking a Premium Chapter (POST)
- **Security:** Requires a valid Security Token.
- **Data Sent to Server:** The ID of the Chapter the reader wants to read.
- **Server Logic:** 
  1. The server checks if the reader has enough coins. If not, it rejects the request.
  2. It deducts the exact cost of the chapter from the reader's wallet.
  3. It calculates the Author's revenue cut (e.g., 70%).
  4. It adds those coins to the Author's wallet.
  5. It creates an unchangeable transaction receipt for auditing.
- **Data Returned to App:** The user's new lower wallet balance, and the full, unlocked text content of the chapter so they can begin reading.