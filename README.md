# 🇮🇳 Independence Day Celebration & Digital Event Portal

A full-stack MERN web app to manage a 15th August Independence Day event for a school, college, or company. It has an event schedule, chief guest details, online registration, an AI-powered quiz, a photo gallery, announcements, password reset, and an admin dashboard to manage everything in one place.

I built this as a portfolio project to practice the full MERN stack and to add AI to a real feature (the quiz generator), not just another CRUD app.

## Live Demo

The frontend and backend are deployed on Render and connected to MongoDB Atlas.

**Live Website:** [Independence Day Portal](https://independence-day-portal.onrender.com)

## Tech Stack

| Part | Tools |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Login & security | JWT, bcryptjs |
| Certificates | PDFKit |
| AI quiz | Anthropic (Claude) API |
| Emails | Brevo email API |
| Image upload | Multer |

## Features

**For visitors and participants**

- Homepage with a tricolor design and an image slideshow that changes every 2 seconds
- Event schedule (program timeline)
- Chief Guest and speaker details
- Online registration form
- Quiz competition, with an instant PDF certificate at the end
- Photo gallery
- Announcements
- Login for participants
- Forgot Password with a one-time code (OTP) sent by email
- Help widget on the site that explains each page and links to WhatsApp

**For admins**

- Dashboard with stats and top scorers
- Full CRUD (Create, View, Update, Delete) for registrations, schedule, quizzes, results, gallery, announcements, and speakers
- AI Quiz Generator: enter a topic and the AI creates the questions
- Download any participant's certificate from the Results tab

**Safety and checks**

- Only major email providers are allowed at signup (Gmail, Yahoo, Outlook, iCloud, and similar)
- Gallery images must be JPG, PNG, GIF, or WEBP, and up to 50 KB
- Admin accounts cannot use the public password reset

## Folder Structure

```text
independence-day-portal/
├── backend/
│   ├── config/          # Database connection
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Route logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Login check, image upload, error handling
│   ├── utils/           # AI quiz, certificate, email, seed script
│   └── server.js
├── frontend/
│   ├── public/images/   # Homepage slideshow images
│   └── src/
│       ├── components/  # Header, Footer, ImageCarousel, Modal, etc.
│       ├── pages/       # Home, Schedule, Quiz, Register, Gallery, Admin...
│       ├── context/     # Auth context
│       └── api/         # Axios setup
└── output/              # Screenshots of the project
```

## Getting Started

### What you need

- Node.js (v18 or higher)
- MongoDB: either installed on your computer or a free Atlas cluster

### 1. Get the project

Unzip or clone the project, then open the folder:

```bash
cd independence-day-portal
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open the `.env` file and update it. The backend runs on port **5001** by default.

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/independence_day_portal
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional: for the AI quiz generator
ANTHROPIC_API_KEY=

# Optional: for password reset emails (Brevo)
BREVO_API_KEY=
EMAIL_FROM=your_verified_sender@example.com
EMAIL_FROM_NAME=Independence Day Portal
```

Make sure MongoDB is running, then add the admin account and sample data:

```bash
npm run seed
```

This creates the default admin login:

```text
Email: admin@idportal.com
Password: admin123
```

Start the server:

```bash
npm run dev
```

The backend will run at `http://localhost:5001`.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. It already sends `/api` requests to the backend, so you do not need to change anything.

### 4. Open the app

Go to `http://localhost:5173` in your browser. Log in from the `/login` page with the admin details above, then click **Admin** in the header to open the dashboard.

> ⚠️ Change the default admin password before you use this for a real event.

## AI Quiz Generator

This is the part I was most excited about. In the admin dashboard, open **AI Quiz Generator**:

1. Enter a topic (for example, "Indian Freedom Fighters").
2. Choose how many questions you want.
3. Click **Generate**.

If you added `ANTHROPIC_API_KEY` in the backend `.env`, the app asks Claude to write the questions. If there is no key, it uses a local set of ready-made questions, so the project still works without a paid key.

After the quiz is created, click **Set Active** to show it on the public `/quiz` page.

## Password Reset (OTP)

Participants can reset a forgotten password from the login page.

1. Click **Forgot Password?** on the login page.
2. Enter your email.
3. You get a one-time code (OTP) by email. The code is valid for **10 minutes**.
4. Enter the code.
5. Set a new password.

Good to know:

- The OTP is stored in hashed form, not as plain text.
- The OTP is never sent back to the browser. It only goes to the user's email.
- The app shows the same message whether or not the email exists, so nobody can find out which emails are registered.
- Admin accounts cannot use this flow.
- Emails are sent through the Brevo HTTPS API, because free hosts like Render often block normal SMTP. If `BREVO_API_KEY` and `EMAIL_FROM` are not set, the email will not be sent.

To set up Brevo (free): create an account, make an API key under **SMTP & API**, and verify a sender email under **Senders & Domains**. Then add both values to `backend/.env`.

## Admin Panel: View / Edit / Delete

Every admin section works the same way:

- Click **View** on a record to see its full details in a popup.
- From there, click **Edit** to change it, or **Delete** (with a confirmation).
- To add a new record, use the form at the top of the section.

## Certificates

When a participant finishes the quiz, they get a PDF certificate right away. It has their name, score, and a unique certificate ID. It is made on the server with PDFKit, with no third-party service. Admins can download anyone's certificate again from the **Results** tab.

## Gallery Images

Gallery photos are saved directly in MongoDB (as base64), so you do not need a separate file server. Each image can be up to **50 KB**.

If you have an older database, you can move its gallery data to the new format with:

```bash
npm run migrate:gallery
```

## Homepage Slideshow

The 5 slideshow images (flag, Ashoka Chakra, fireworks, tricolor banner, students) are in `frontend/public/images/`. They change every 2 seconds. You can replace them with real photos from your event.

## Screenshots

Screenshots of the project are in the `output/` folder.

## Ideas for the Future

- Email notification when someone registers
- Better mobile view for the admin quiz editor
- A public leaderboard for the quiz

## Troubleshooting

| Problem | Fix |
|---|---|
| MongoDB connection error | Check that `mongod` is running, or that your Atlas link in `.env` is correct |
| Port 5001 is already used | Change `PORT` in `backend/.env` and update the proxy in `frontend/vite.config.js` |
| Frontend cannot reach the API | Start the backend first, then the frontend |
| AI quiz always uses local questions | Check that `ANTHROPIC_API_KEY` is correct, then restart the backend |
| OTP email not received | Check `BREVO_API_KEY` and `EMAIL_FROM` in `backend/.env`, make sure the sender is verified in Brevo, then restart the backend |
| "That code is incorrect or has expired" | Ask for a new code. Each code works for 10 minutes only |
| Gallery image upload fails | Use a JPG, PNG, GIF, or WEBP image that is 50 KB or smaller |

## Author

Ayush Raj

Built as a personal portfolio project. If you use it or build on top of it, a star or a shoutout is appreciated 🙂

Jai Hind 🇮🇳
