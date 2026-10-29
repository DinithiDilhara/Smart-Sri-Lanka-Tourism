# Explore World — Global Destination Explorer

A modern full-stack tourism web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js).

Explore World allows users to discover tourist destinations across five Asian countries through an interactive, image-rich interface.

## Project Overview

Explore World is designed to make destination discovery simple and engaging. Users can explore countries, browse tourist attractions, view destination details, and discover hotel information.

The application integrates a React frontend with an Express backend and a MongoDB Atlas database.

## Technologies Used

**Frontend**
- React.js
- Vite
- JavaScript
- CSS3
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- REST API

**Development Tools**
- Visual Studio Code
- Git and GitHub
- GitHub Copilot

## Countries and Destinations

The application includes 25 tourist destinations across five countries:

| Country | Destinations |
|---|---|
| Sri Lanka | Sigiriya, Galle, Mirissa, Nine Arch Bridge, Temple of the Tooth Relic |
| India | Taj Mahal, Goa, Hawa Mahal, Kerala Backwaters, Varanasi |
| Nepal | Mount Everest, Annapurna Range, Lumbini, Boudhanath Stupa, Phewa Lake |
| Indonesia | Mount Bromo, Borobudur Temple, Kelingking Beach, Raja Ampat Islands, Tegallalang Rice Terraces |
| Thailand | Wat Arun, Doi Suthep, Railay Beach, Phi Phi Islands, Patong Beach |

## Features

- Country browsing and navigation
- Tourist destination discovery
- Country and category filtering
- Individual destination detail pages
- Local destination image integration
- Hotel discovery and filtering
- User registration and login
- MongoDB Atlas database integration
- REST API endpoints for destination CRUD operations
- Role-based authorization for administrator API operations
- Responsive frontend layouts

## Project Structure

```text
Global-Destination-Explorer/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── scripts/
│   └── package.json
└── README.md
```

## How to Run the Project

**1. Clone the repository**

```bash
git clone https://github.com/DinithiDilhara/global-destination-explorer.git
cd global-destination-explorer
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

Create a `.env` file with your own MongoDB Atlas connection settings and required authentication configuration. Refer to the backend environment configuration.

Start the backend:

```bash
npm run dev
```

**3. Install frontend dependencies**

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## Database Integration

MongoDB Atlas is used to store destination information including destination name, country, district, category, description, and image URL.

The database has been populated with 25 initial destination records across five countries.

The backend provides destination CRUD API endpoints, with write operations restricted to administrators.

## Testing

The project has been checked using:

- ESLint for frontend code quality
- Vite production build
- Node.js backend tests
- REST API checks for destination data

## Project Status

The React frontend, Express backend, and MongoDB destination integration are implemented.

Destination browsing, filtering, hotel discovery, and authentication functionality are present. Further work includes completing the administrator management interface and final end-to-end verification.

## Developer

**W.P.D.D. Withanapathirana**

University of Ruhuna — Faculty of Engineering

## Academic Project

Developed as a university mini-project to demonstrate full-stack web development using the MERN stack.
## Destination Data
- Added 25 destinations to MongoDB.
- 5 destinations each for Sri Lanka, India, Nepal, Indonesia, and Thailand.
- Each destination includes a name, region, category, description, and image.
- Destination records are stored in MongoDB, not Git.
