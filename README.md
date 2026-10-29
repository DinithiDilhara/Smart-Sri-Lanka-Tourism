# Explore World — Global Destination Explorer

**Explore World** is a full-stack tourism web application built with MongoDB, Express.js, React, and Node.js (MERN). It helps travelers discover destinations, save favorites, and plan personalized trips. Administrators can manage destinations through a protected dashboard.

This project was developed as a university mini-project by **W.P.D.D. Withanapathirana**, Faculty of Engineering, University of Ruhuna.

## Main features

- **Explore destinations:** Browse attractions by country and category; view photos and destination details.
- **Search, filter, and sort:** Find destinations through the exploration pages and use name/date sorting on the admin dashboard.
- **Destination CRUD:** Administrators can create, list, update, and delete destination records stored in MongoDB.
- **Authentication:** Register, log in, log out, and access protected user features through an HTTP-only session cookie.
- **Favorites:** Signed-in users can save or remove destinations; selections are stored in their MongoDB user record.
- **My Trips:** Create and edit trips, arrange destinations by day, add private custom places, and keep a reusable *My Travel Ideas* draft.
- **Trip budget:** Choose manual cost entry or automatic estimates based on trip dates, travelers, rooms, hotel nightly rate, and food cost per person per day. Transport and activity estimates are included.
- **Maps and hotel suggestions:** Open destination locations in Google Maps and browse informational hotel suggestions. **Hotel prices are estimates, not live booking quotes.**
- **Responsive interface:** React pages styled with CSS for different screen sizes.

### Featured countries

The seed script provides **25 initial destinations**, five each from Sri Lanka, India, Nepal, Indonesia, and Thailand. Administrators can add further destinations and countries; the actual database count can therefore change.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, JavaScript, CSS, Vite |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | bcryptjs password hashes, JSON Web Tokens in HTTP-only cookies |
| Development | Visual Studio Code, Git, GitHub |

## How the application works

```text
Browser (React + Vite)
        |
        | HTTP requests / JSON
        v
Express REST API (Node.js)
        |
        | Mongoose models
        v
MongoDB Atlas (Users, Destinations, Trips)
```

The backend separates route handlers, controllers, authentication middleware, and Mongoose models. The Vite development server proxies `/api` requests to the backend on port 5000. The frontend's API base URL can be configured with `VITE_API_URL` if needed.

## Project structure

```text
Global-Destination-Explorer/
├── backend/
│   ├── scripts/              # Destination seed and administrator setup
│   ├── src/
│   │   ├── config/           # MongoDB connection
│   │   ├── controllers/      # Authentication and destination operations
│   │   ├── middleware/       # Authentication, admin checks, origin checks
│   │   ├── models/           # User, Destination, Trip
│   │   ├── routes/           # Authentication, destinations, favorites, trips
│   │   └── server.js
│   ├── test/                 # Automated backend tests
│   └── package.json
├── frontend/
│   ├── public/               # Public images and icons
│   ├── src/
│   │   ├── assets/           # Destination photos
│   │   ├── components/       # Main UI, navigation, admin dashboard
│   │   ├── pages/            # Favorites, My Trips, profile
│   │   ├── data/             # Destination image helpers
│   │   ├── hooks/            # Destination data hooks
│   │   └── services/         # API request helpers
│   └── package.json
├── docs/
│   ├── DATABASE_ERD.md       # MongoDB relationships and Mermaid diagram
│   ├── ExploreWorld_ERD.png  # Diagram for reports
│   └── ExploreWorld_ERD.svg  # Scalable diagram
└── README.md
```

## Local installation

You need Git, Node.js/npm compatible with the project's Vite version, and a MongoDB database connection.

**1. Clone and install dependencies**

```bash
git clone https://github.com/DinithiDilhara/global-destination-explorer.git
cd global-destination-explorer
cd backend
npm install
```

**2. Configure the backend**

Create `backend/.env` locally. Replace the placeholders with your own values:

```dotenv
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/YOUR_DATABASE
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
PORT=5000
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Never commit `.env`, MongoDB credentials, JWT secrets, or administrator passwords to GitHub.** The root `.gitignore` excludes `.env` files.

**3. Start the backend**

In the `backend` folder:

```bash
npm run dev
```

The backend defaults to `http://localhost:5000`. Verify it at `http://localhost:5000/api/health` (the response reports database connectivity).

**4. Start the frontend**

Open a *second terminal* in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the URL displayed by Vite (usually `http://localhost:5173`). Keep the backend running separately.

For local development, the Vite proxy handles `/api` requests. If the backend uses a different host or port, set a suitable `VITE_API_URL` in the frontend environment before starting Vite.

## Database structure and ER diagram

MongoDB stores data in **three main collections**:

| Collection | Purpose |
| --- | --- |
| `users` | Account information, role, hashed password, and an array of favorite Destination references |
| `destinations` | Public destination records: name, slug, country, district, category, description, and image URL |
| `trips` | User-owned trips with dates, destination references, embedded personal stops, hotel details, budget amounts, and optional automatic-calculator settings |

See **[Database ER Diagram](docs/DATABASE_ERD.md)** or use the **[PNG diagram](docs/ExploreWorld_ERD.png)** in your report. The diagram represents MongoDB document references and embedded arrays; it does **not** imply SQL foreign-key constraints.

## REST API overview

| Method | Endpoint | Access / purpose |
| --- | --- | --- |
| GET | `/api/health` | Check backend / database status |
| GET | `/api/destinations` | Public: list destinations |
| GET | `/api/destinations/:id` | Public: destination details |
| POST | `/api/destinations` | Admin: create destination |
| PUT / PATCH | `/api/destinations/:id` | Admin: update destination |
| DELETE | `/api/destinations/:id` | Admin: delete destination |
| POST | `/api/auth/signup` | Register an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Signed-in account details |
| GET | `/api/favorites` | Signed-in user's favorites |
| POST / DELETE | `/api/favorites/:destinationId` | Add / remove favorite |
| GET / POST | `/api/trips` | List / create user's trips |
| PATCH / DELETE | `/api/trips/:tripId` | Update / delete owned trip |
| POST | `/api/trips/ideas` | Add a destination to the user's draft ideas |
| POST / PATCH / DELETE | `/api/trips/:tripId/destinations/...` | Manage trip destination entries |
| POST / PATCH / DELETE | `/api/trips/:tripId/custom-stops/...` | Manage personal stops |

Destination changes require admin authentication. Favorite and trip operations require a logged-in user. Cross-origin state-changing requests are checked against the allowed frontend origins.

## Testing and verification

Run the frontend production build:

```bash
cd frontend
npm run build
```

Run backend automated tests:

```bash
cd backend
npm test
```

These checks do not replace manual browser testing. Before submission, verify login/logout, destination create/read/update/delete, sorting and filtering, Favorites persistence, trip editing, budget saving, validation messages, and mobile layout. Do not present estimated hotel costs as real-time prices.

## Optional database setup scripts

- `backend/scripts/seedDestinations.js` inserts missing seed destinations when run with a configured MongoDB connection. Existing matching records are retained.
- `backend/scripts/create-admin.js` requires `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend environment. **If the email already exists, this script updates that account's role and password**; use it only when intentionally provisioning an administrator. Do not commit these credentials.

## Academic project

University of Ruhuna — Faculty of Engineering
Developer: W.P.D.D. Withanapathirana
Project: Explore World (Global Destination Explorer)
