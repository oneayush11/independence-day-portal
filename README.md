# 🇮🇳 Independence Day Celebration & Digital Event Portal

A full-stack MERN web app I built to manage a 15th August Independence Day event for a school/college/company — event schedule, chief guest info, online registration, an AI-powered quiz competition, photo gallery, announcements, and a complete admin dashboard to manage everything from one place.

I built this mainly as a portfolio project to practice the full MERN stack along with integrating AI into a real feature (the quiz generator), instead of just another CRUD app.

## Live Demo

Not deployed yet — currently runs locally. (Planning to deploy on Render/Vercel + MongoDB Atlas soon.)

## Screenshots

_Add your screenshots here once you run the project locally — homepage, quiz page, and admin dashboard look the best._

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose)
**Auth:** JWT
**Other:** PDFKit (for certificate generation), Anthropic (Claude) API for the AI quiz generator

## Features

- Independence Day themed homepage with a tricolor design and an auto-changing image slideshow
- Event schedule / program timeline
- Chief Guest & Speaker details section
- AI-based Quiz Generator — admin enters a topic and the AI generates MCQs automatically. If there's no API key configured, it falls back to a local question bank so the demo still works without needing a paid key
- Online registration form for participants
- Photo gallery
- Announcements section
- Admin dashboard with stats and top scorers
- Full CRUD (Create, View, Update, Delete) for every admin section - registrations, schedule, quizzes, results, gallery, announcements, speakers
- Auto-generated PDF certificate for quiz participants
- JWT-based login for admin/participants

## Folder Structure

```
independence-day-portal/
---- backend/
│   ├── config/          # DB connection
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # route logic
│   ├── routes/          # API endpoints
│   ├── middleware/       # JWT auth, error handling
│   ├── utils/            # AI quiz generator, certificate generator, admin seeder
│   └── server.js
└── frontend/
    ├── public/images/     # homepage slideshow images
    └── src/
        ├── components/    # Header, Footer, ImageCarousel, Modal, etc.
        ├── pages/          # Home, Schedule, Quiz, Register, Gallery, Admin...
        ├── context/        # Auth context
        └── api/            # axios instance
```

## Getting Started

### What you'll need

- Node.js (v18+)
- MongoDB — either running locally or a free Atlas cluster

### 1. Clone/unzip the project

```bash
cd independence-day-portal
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` if needed (backend runs on port **5001** by default, since 5000 was taken):

```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/independence_day_portal
JWT_SECRET=change_this_to_a_long_random_secret_key
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=          # optional, leave blank if you don't have one
```

Make sure MongoDB is running (`mongod` if local), then seed an admin account + some sample data:

```bash
npm run seed
```

This gives you:
```
Email: admin@idportal.com
Password: admin123
```

Now start the server:

```bash
npm run dev
```

Backend should be up at `http://localhost:5001`

### 3. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. It's already configured to proxy `/api` requests to the backend, so you don't need to change anything there.

### 4. Open the app

Go to `http://localhost:5173` in your browser. Log in with the admin credentials above from the `/login` page, then hit "Admin" in the header to get to the dashboard.

## About the AI Quiz Generator

This was the part I was most excited about. In the admin dashboard, under "AI Quiz Generator":

1. Enter a topic (like "Indian Freedom Fighters")
2. Pick how many questions you want
3. Click Generate

If you've added an `ANTHROPIC_API_KEY` in the backend `.env`, it calls Claude to generate real MCQs on the fly. If not, it quietly falls back to a local set of pre-written questions so nothing breaks — I wanted the project to be fully runnable even for someone who doesn't want to set up an API key just to test it.

Once generated, just click "Set Active" to make that quiz live on the public `/quiz` page.

## Admin Panel — View / Edit / Delete

Every section in the admin panel works the same way, which I did on purpose to keep things consistent:

- Click **View** on any record to open its full details in a popup
- From there you can **Edit** (opens a form, save your changes) or **Delete** (with a confirm prompt)
- New records are added using the form at the top of each section

So basically full CRUD everywhere, not just create-and-delete.

## Certificates

When someone finishes the quiz, they get a PDF certificate instantly with their name, score, and a unique certificate ID (generated server-side with PDFKit — no third-party service). Admin can also re-download anyone's certificate from the Results tab.

## Notes on the homepage images

The 5 images in the homepage slideshow (flag, Ashoka Chakra, fireworks, tricolor banner, students celebrating) are custom SVGs I added under `frontend/public/images/` — they rotate automatically every second. Feel free to swap them out with real photos once you have some from your actual event.

## Default Admin Login

```
Email: admin@idportal.com
Password: admin123
```

(created automatically by `npm run seed`)

## Things I'd still like to add

- Deploy it properly (Render/Vercel + Atlas)
- Email notifications on registration
- Better mobile view for the admin quiz editor
- Maybe a leaderboard page for the quiz, publicly visible

## Troubleshooting

| Issue | Fix |
|---|---|
| MongoDB connection error | Check `mongod` is running, or that your Atlas URI in `.env` is correct |
| Port 5001 already used | Change `PORT` in `backend/.env` and update the proxy in `frontend/vite.config.js` |
| Frontend can't reach API | Start the backend first, then the frontend |
| AI quiz always uses local fallback | Double check `ANTHROPIC_API_KEY` is set correctly and restart the backend |

## Author

Built as a personal/portfolio project. If you use this or build on top of it, a star or a shoutout is appreciated 🙂

Jai Hind 🇮🇳
