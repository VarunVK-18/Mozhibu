# 6. Exhaustive Quality Assurance & Testing Architecture

Ensuring the reliability of the **Mozhibu** platform is paramount, especially regarding core flows like User Authentication, Content Publishing, and Financial Transactions. The testing architecture is designed to validate the system at multiple layers: granular unit tests of Angular components, fully integrated backend API tests, and rigorous manual End-to-End (E2E) flows for third-party integrations.

---

## 6.1 Automated Backend Integration Testing (Node.js/Jest)

The backend relies on integration testing to ensure routes, middlewares, and database controllers function cohesively. We utilize testing frameworks (Jest and Supertest) that simulate network requests against a temporary, in-memory database to prevent polluting production data.

### Example 1: Testing the Authentication & Onboarding Flow
This test suite ensures that users cannot bypass the mandatory onboarding steps. 

**Testing Logic:**
1. **Setup:** The system generates a simulated "Google Login" user who has an email but is missing their Date of Birth and Mobile Number (meaning their profile is incomplete).
2. **Restriction Check:** The simulated user attempts to access a protected feature, such as "Liking a Book". The system asserts that the request is firmly rejected with a `403 Forbidden` error and a message indicating the profile is incomplete.
3. **Completion Check:** The simulated user then submits their Date of Birth and Mobile Number to the profile completion endpoint. The system verifies that the update is successful, the user's database record is permanently updated, and their secure access token is refreshed to grant them full access to the platform.

### Example 2: Financial Ledger Integrity (Coins)
Because the platform handles real money and digital currency, the financial endpoints must be watertight against race conditions and negative balances.

**Testing Logic:**
1. **Setup:** The system creates a test Reader with a wallet balance of exactly 10 Coins.
2. **Insufficient Funds Check:** The Reader attempts to unlock a Premium Chapter that costs 50 Coins. 
3. **Verification:** The system asserts that the transaction is immediately rejected with a `402 Payment Required` error. Most importantly, it queries the database again to absolutely verify that the Reader's wallet was not erroneously deducted and their balance remains at exactly 10 Coins, preventing negative balances.

---

## 6.2 Frontend Component Testing (Angular 18 / Jasmine)

The frontend utilizes testing frameworks (Jasmine and Karma) to test individual visual components in isolation by mocking out external services.

### Example 1: Testing the Reader's Progress Tracker

**Testing Logic:**
1. **Setup:** The testing framework loads the `ReaderComponent` in isolation and injects a fake story chapter so the component thinks it has real data to display.
2. **Simulating User Behavior:** The framework programmaticly simulates a user scrolling exactly halfway down the webpage (50% scroll depth).
3. **Verification:** The system asserts that the underlying data state (using Angular Signals) instantly updates the user's reading progress to `50%`. This guarantees that when a real user reads a book, their "Continue Reading" bookmark is accurately tracked.

---

## 6.3 Critical E2E Test Flows (Cypress / Manual QA)

Certain business-critical flows involve complex third-party state (like OAuth windows, Stripe checkout popups, or Gemini AI latency). These are rigorously tested via QA scenarios.

### Flow 1: Stripe Webhook Asynchronous Fulfillment

> **Scenario:** A user purchases coins, but closes their browser immediately after paying on Stripe.
> 
> 1. User initiates Stripe Checkout for 1000 Coins.
> 2. User enters credit card on Stripe's hosted page and pays.
> 3. User instantly closes the browser tab before Stripe redirects them back to Mozhibu.
> 4. *Assertion:* Stripe fires a background webhook directly to the Mozhibu backend servers.
> 5. *Assertion:* The backend securely validates the Stripe signature, finds the user by their Stripe ID, and credits the 1000 coins independently of the browser.
> 6. User re-opens the app hours later and sees their 1000 coins successfully deposited. 
> 
> **Result:** Validates system does not rely on the client browser for financial fulfillment.

### Flow 2: Gemini AI Translation Resilience

> **Scenario:** The user requests a chapter translation, but the Google Gemini API is experiencing an outage.
> 
> 1. Reader clicks "Translate to Spanish" on a chapter.
> 2. The Angular frontend shows a loading skeleton.
> 3. The Node backend pings the Gemini API, which times out after 10 seconds (simulated by QA).
> 4. *Assertion:* The Express backend catches the timeout error, logs it for developers, and returns a graceful "Service Unavailable" error.
> 5. *Assertion:* The frontend clears the loading skeleton, displays a notification that the translation failed, and restores the original English text so the user's reading experience isn't permanently broken.

---

## 6.4 Continuous Integration Pipeline

To prevent developers from accidentally introducing bugs, an automated pipeline runs every time new code is submitted to the repository.

**Pipeline Logic:**
1. The server provisions a fresh, isolated Ubuntu environment.
2. It installs all required project dependencies.
3. It boots up the backend and executes the entire suite of security, authentication, and financial tests. It enforces a strict rule that at least 80% of the codebase must be covered by automated tests, otherwise the new code is rejected.
4. It boots up a headless Chrome browser and runs all frontend visual component tests to ensure no UI elements are broken.