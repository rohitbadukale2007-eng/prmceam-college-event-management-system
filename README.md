# PRMCEAM College Event Management System

A production-ready College Event Registration and Seat Management web application with strict role-based access control (Admin & Student), real-time seat tracking, and input validation.

---

## 🚀 Getting Started in VS Code

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

### Step 1: Open in VS Code & Install Dependencies
Open a terminal in VS Code (`Ctrl + \`` or `Cmd + \``) inside the project folder:
```bash
npm install
```
*(Note: If your local npm throws a peer dependency warning or conflict, run: `npm install --legacy-peer-deps`)*

### Step 2: Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to view the live portal.

### Step 3: Production Build
```bash
npm run build
```
This generates the optimized production bundle in the `dist` directory, ready for deployment.

---

## 🐙 Connecting to GitHub

Follow these steps in your VS Code terminal to publish this repository to your GitHub account:

1. **Initialize Git (if not already initialized)**:
   ```bash
   git init
   ```

2. **Stage and Commit all files**:
   ```bash
   git add .
   git commit -m "feat: PRMCEAM College Event Management System"
   ```

3. **Set main branch**:
   ```bash
   git branch -M main
   ```

4. **Link to your GitHub repository**:
   Create a new empty repository on [GitHub](https://github.com/new), copy the repository URL, and run:
   ```bash
  git remote add origin https://github.com/rohitbadukale2007-eng/prmceam-college-event-management-system.git
   ```

5. **Push your code**:
   ```bash
   git push -u origin main
   ```

---

## 🌐 Deploying Live

You can deploy this project in under a minute on any modern platform:

- **Vercel**: Import your GitHub repo on [vercel.com](https://vercel.com); framework preset `Vite` will be automatically detected.
- **Netlify**: Connect your GitHub repository on [netlify.com](https://netlify.com); build command: `npm run build`, publish directory: `dist`.
- **Render / Cloudflare Pages**: Connect repo, set build command `npm run build`, and publish directory `dist`.

---

## 🔐 Strict Authentication & User Roles

The system enforces strict role-based authorization:

### 1. Admin Portal (`Admin Access`)
- **Restricted Access**: Only registered Administrator accounts can log in. Student credentials will be rejected with an access-denied error.
- **Admin Registration**: Protected by an Admin Authorization Key (`ADMIN@PRMCEAM2026`) so only authorized college staff can create administrative accounts.
- **Capabilities**:
  - Create college events with strict validation (**Name**, **Date**, **Time**, and **Max Seats** $\ge 1$).
  - Live capacity dashboard displaying confirmed registrations vs available seats.
  - Review attendee lists with student names, roll numbers, emails, and registration timestamps.
  - Remove events and automatically purge associated registrations.

### 2. Student Portal (`Student Access`)
- **Student Registration**: Students can register with:
  - **Full Name** (at least 2 characters)
  - **College Email** (validated against RFC email format regex)
  - **Roll Number** (alphanumeric pattern, e.g. `CS-2024-042`)
  - **Contact Number** (validated 10-digit mobile number)
  - **Department** & **Password**
- **Capabilities**:
  - Browse upcoming events with real-time remaining seat counters.
  - Instant seat registration (updates available seats instantly).
  - Search and filter by category or venue.
  - "My Registrations" view with confirmation passes and pass cancellation (which restores 1 seat back to the event).

---

## 📋 Existing Accounts

| Portal Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Admin** | Prof. S. R. Deshmukh | `admin@college.edu` | `admin123` | Event Committee Coordinator |
| **Student** | Rahul Sharma | `rahul@college.edu` | `pass123` | Roll No: `CS-2024-042` |
| **Student** | Priya Patil | `priya@college.edu` | `pass123` | Roll No: `IT-2024-019` |
| **Student** | Amit Verma | `amit@college.edu` | `pass123` | Roll No: `ME-2024-008` |

---

## 🛡️ Input Format & Edge Case Validations

- **Email Validation**: Strict regex verification (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
- **Roll Number Validation**: Alphanumeric format check (`^[a-zA-Z0-9\-_/]{3,20}$`) preventing duplicate roll numbers across students.
- **Phone Number Validation**: Strict 10-digit format (`^(\+?[0-9]{1,3}[- ]?)?[0-9]{10}$`).
- **Seat Capacity Validation**: Event creation requires positive integers $\ge 1$.
- **0 Remaining Seats**: Registration is locked once confirmed registrations reach maximum capacity ("House Full").
- **Duplicate Registration**: A student cannot register for the same event more than once.
