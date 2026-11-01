# ⚡ Website Activity Confirmation Email Service

A production-ready microservice that automatically sends responsive, styled confirmation and security notification emails whenever users perform activities on your website.

---

## 🌟 Key Features

- **Activity-Triggered Confirmation Emails**:
  - 🔑 **New Sign-In / Login**: Security alert with browser, OS, IP address, location, and a 1-click "Secure My Account" button.
  - 🛡️ **Password Changed**: Immediate alert with emergency recovery button.
  - 🎉 **New Account Registration**: Welcome email with getting started link.
  - 👤 **Profile Updated**: Audit of modified fields (phone, address, notification preferences).
  - 🛒 **Order / Purchase**: Itemized receipt, total amount, order ID, and order tracking link.
  - 📌 **Custom / Generic Activities**: Supports any activity on your website (file uploads, exports, form submissions, subscriptions, comments, role changes) with customizable badge colors and metadata key-value tables.
- **Dual Email Rendering**: Both responsive HTML (compatible with Gmail, Apple Mail, Outlook, mobile) and plain-text fallbacks.
- **Instant Zero-Config Testing Mode**: Out of the box, it uses [Ethereal](https://ethereal.email/) test inbox so you can view the exact rendered HTML email in your browser without needing real SMTP credentials or risking spamming actual users.
- **Production SMTP Ready**: Easily switch to Gmail, SendGrid, Mailgun, Amazon SES, or custom SMTP by setting `USE_ETHEREAL=false` in `.env`.
- **Live Interactive Dashboard**: Includes a built-in web portal at `http://localhost:3000` to simulate website events, inspect templates, view delivery logs, and test SMTP connections.
- **Ready-to-Use SDKs**:
  - `client-sdk/website-tracker.js`: Drop-in script for browser websites (HTML, React, Vue, Angular).
  - `client-sdk/node-client.js`: Client for Node.js / Express / Next.js backends.
  - `client-sdk/python-client.py`: Client for Python / Django / Flask / FastAPI backends.

---

## 🚀 Quick Start

### 1. Install & Run
```bash
# Start the service
npm start

# Or start in watch mode for development
npm run dev
```

The service will start on:
- **Interactive Control Center & Simulator**: [http://localhost:3000](http://localhost:3000)
- **🏪 ShopLedger Integrated Web App**: [http://localhost:3000/shopledger.html](http://localhost:3000/shopledger.html)
- **API Endpoint**: `http://localhost:3000/api/activity/notify`
- **Client SDK**: `http://localhost:3000/sdk/website-tracker.js`

### 2. Run Automated Tests
```bash
npm test
```

---

## ⚙️ Configuration (`.env`)

```env
# Server Port
PORT=3000

# Company Branding
COMPANY_NAME="Our Website"
COMPANY_LOGO_URL="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
COMPANY_WEBSITE="https://yourwebsite.com"
SUPPORT_EMAIL="support@yourwebsite.com"

# Set USE_ETHEREAL=true for free instant web previews (zero signup needed)
# Set USE_ETHEREAL=false to send real emails with SMTP below
USE_ETHEREAL=true

# Production SMTP Settings (e.g., Gmail, SendGrid, Outlook, Amazon SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="Our Website <no-reply@yourwebsite.com>"

# Optional API Security Key (leave blank for development)
API_KEY=
```

---

## 🔌 How to Integrate With Your Website

### Option A: Frontend Website (HTML / JavaScript / React / Vue)

Include the client SDK in your HTML:
```html
<script src="http://localhost:3000/sdk/website-tracker.js"></script>

<script>
  // Initialize with your user's info
  WebsiteActivityTracker.init({
    endpoint: 'http://localhost:3000/api/activity/notify',
    user: {
      email: 'john.doe@example.com',
      name: 'John Doe'
    }
  });

  // 1. Trigger when user signs in
  WebsiteActivityTracker.trackLogin();

  // 2. Trigger when password is changed
  WebsiteActivityTracker.trackPasswordChange();

  // 3. Trigger when profile is updated
  WebsiteActivityTracker.trackProfileUpdate(['Phone Number', 'Billing Address']);

  // 4. Trigger on checkout
  WebsiteActivityTracker.trackOrder('ORD-9821', '$49.99', [
    { name: 'Monthly Pro Plan', qty: 1, price: '$49.99' }
  ]);

  // 5. Trigger any custom action on your site
  WebsiteActivityTracker.track('document_export', {
    title: 'Financial Report Downloaded',
    description: 'Your monthly summary was downloaded.',
    metadata: { 'Format': 'PDF', 'Records': '250' }
  });
</script>
```

---

### Option B: Node.js Backend (Express / Next.js / NestJS)

```javascript
const { ActivityNotifier } = require('./client-sdk/node-client');

const notifier = new ActivityNotifier({
  endpoint: 'http://localhost:3000/api/activity/notify'
});

// Inside your login route:
app.post('/api/auth/login', async (req, res) => {
  // ... authenticate user ...

  // Fire confirmation email
  await notifier.notifyLogin({
    email: user.email,
    name: user.name
  }, req);

  res.json({ success: true });
});

// Inside password change route:
await notifier.notifyPasswordChanged({
  email: user.email,
  name: user.name
}, req);
```

---

### Option C: Python Backend (Django / Flask / FastAPI)

```python
from client_sdk.python_client import ActivityNotifier

notifier = ActivityNotifier(endpoint="http://localhost:3000/api/activity/notify")

# In your view / controller:
notifier.notify_login(
    user={"email": "alice@example.com", "name": "Alice"},
    ip=request.remote_addr,
    user_agent=request.headers.get("User-Agent")
)
```

---

### Option D: Direct REST API (cURL / any HTTP client)

```bash
curl -X POST http://localhost:3000/api/activity/notify \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "user@example.com",
      "name": "Jane Doe"
    },
    "activity": {
      "type": "login",
      "title": "New Sign-In Detected",
      "ip": "203.0.113.195",
      "device": "Chrome on Windows 11",
      "actionUrl": "https://yourwebsite.com/security"
    }
  }'
```

#### Response:
```json
{
  "success": true,
  "activityId": "act_1740500000_abc12",
  "messageId": "<...>",
  "recipient": "user@example.com",
  "activityType": "login",
  "subject": "Security Alert: New Sign-In to Your Account [Our Website]",
  "previewUrl": "https://ethereal.email/message/...",
  "mode": "ethereal"
}
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/activity/notify` | Dispatches an activity confirmation email. |
| `GET` | `/api/activity/history` | Returns the recent audit log of dispatched activities. |
| `DELETE` | `/api/activity/history` | Clears recent activity audit history. |
| `GET` | `/api/activity/templates/preview/:type` | Live browser preview for email templates (`login`, `signup`, `password_change`, `profile_update`, `order_placed`, `custom`). |
| `POST` | `/api/activity/test-email` | Dispatches a diagnostic test email to verify SMTP. |
| `GET` | `/api/health` | Service health status and uptime. |
| `GET` | `/api/config` | Current mail provider transport information and settings. |

---

## 📂 Project Architecture

```
JUST/
├── .env                  # Service configuration & SMTP keys
├── .env.example          # Sample configuration template
├── package.json          # Node dependencies and npm scripts
├── index.js              # Server entry point
├── src/
│   ├── app.js            # Express application setup & middleware
│   ├── config/
│   │   └── mailer.js     # Nodemailer transport (Ethereal + SMTP)
│   ├── services/
│   │   ├── emailService.js   # Delivery engine & email dispatcher
│   │   └── activityStore.js  # Audit logging of recent activity emails
│   ├── templates/
│   │   ├── base.js           # Responsive HTML layout with header & footer
│   │   ├── authTemplates.js  # Login, Signup, Password Change templates
│   │   ├── accountTemplates.js # Profile & settings modification templates
│   │   ├── commerceTemplates.js # Order placed & receipt templates
│   │   ├── customTemplate.js # Dynamic generic website activity template
│   │   └── index.js          # Template resolver & preview samples
│   └── routes/
│       ├── activityRoutes.js # REST endpoints for notification & logs
│       └── healthRoutes.js   # Health & config status endpoints
├── client-sdk/
│   ├── website-tracker.js    # Drop-in browser JavaScript client
│   ├── node-client.js        # Node.js backend client
│   └── python-client.py      # Python backend client
├── public/
│   ├── index.html            # Interactive Control Center Dashboard
│   ├── styles.css            # Modern responsive UI styles
│   └── app.js                # Frontend simulator controller
└── tests/
    └── test-service.js       # End-to-end integration test suite
```
