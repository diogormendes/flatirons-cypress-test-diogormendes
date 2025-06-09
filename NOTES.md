# 🧪 E2E Test Architecture & Known Issues

## 📐 Test Architecture & Design Decisions

- **Dynamic User Creation**  
  As we can't pre-populate or reset data directly via the backend or database, each test run dynamically creates a new user through the SignUp flow. This user is then stored and reused for subsequent steps, like payment processing.
  
- **Chained Test Flow**  
  Due to the lack of access to both the API/backend documentation and the database, the E2E tests were designed as dependent steps. Each test relies on the successful execution of the previous one.  
  For example, the payment/subscription test depends on a user being created and confirmed in the Signup test.

## 🐞 Known Issues & Workarounds

- **500 Error on Email Confirmation Link**  
  The SignUp test may fail because of a backend issue that returns a `500 Internal Server Error` when clicking the email confirmation link.  
  This also causes the dependent payment/subscription test to fail, since it requires a confirmed and authenticated user.

- **GitHub Login Requires Manual Setup**  
  GitHub login must be performed manually once to authenticate the browser session (i.e., set up the cookie/session state).  
  A future enhancement would be to replace this flow with a passkey-based login, enabling full automation without manual intervention.

---

> ⚠️ Heads-up: These limitations are temporary and based on current backend constraints. Once API and DB access are available, we can refactor the tests to be stateless and independent.
