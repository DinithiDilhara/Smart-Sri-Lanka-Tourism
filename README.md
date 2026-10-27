# Smart Sri Lanka Tourism

A MERN stack web application for exploring tourist destinations across Sri Lanka.

## Technologies
- MongoDB
- Express.js
- React.js
- Node.js

## Planned Features
- Explore tourist destinations
- Add new tourist destinations
- View destination information
- Update destination details
- Delete destinations
- Search and filter destinations

## Project Structure
- frontend: React + Vite application
- backend: Node.js + Express API

## Running the Application

Start the backend from the `backend` directory:

```powershell
cd backend
npm start
```

For automatic restart during backend development, use:

```powershell
cd backend
npm run dev
```

Start the frontend in a separate terminal from the `frontend` directory:

```powershell
cd frontend
npm run dev
```

The backend API is available at `http://127.0.0.1:5000`. During local frontend
development, Vite proxies `/api` to this backend, so the browser does not need
to make a cross-origin request. If the frontend and backend are deployed on
different hosts, set `VITE_API_URL` in the frontend environment to the API
base URL, including `/api`.

## Project Status
Initial frontend and backend setup completed.
MongoDB integration and CRUD implementation are upcoming.
