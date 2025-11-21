<div align="center">
<h1>Express Book Reviews API</h1>
<p>A simple Node.js / Express backend for browsing books, registering users, logging in, and creating or deleting authenticated book reviews. Built as a practice project.</p>
</div>

## Table of Contents
- Overview
- Project Structure
- Technology Stack
- Getting Started
- Running the Server
- Authentication Flow
- API Endpoints
- Example Usage
- Bruno API Collections
- Environment & Configuration
- Development Notes & Extensibility Ideas
- License

## Overview
This repository provides a minimal REST-style API for:
- Listing all available books.
- Fetching books by ISBN, author, or title.
- User registration and login (session + JWT based).
- Adding, updating, and deleting authenticated reviews per book.

Reviews are stored in-memory within the `booksdb.js` object keyed by ISBN. User accounts are kept in-memory inside `auth_users.js`. This makes the project easy to understand and extend, but also means data resets on server restart.

## Project Structure
```
expressBookReviews/
├── LICENSE
├── README.md                (You are here)
├── bruno_calls/             (Bruno API client collections)
│   └── BookStoreApp/*.bru   (Sample requests)
└── final_project/
		├── index.js             (App entrypoint)
		├── package.json
		├── router/
		│   ├── auth_users.js    (Protected routes & login)
		│   ├── general.js       (Public routes)
		│   └── booksdb.js       (In-memory book data)
		└── README.md            (Original minimal project note)
```

## Technology Stack
- `Node.js` + `Express` for HTTP routing
- `express-session` for maintaining session state
- `jsonwebtoken` (JWT) for auth token issuance & verification
- `nodemon` for development auto-restarts

## Getting Started
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd expressBookReviews/final_project
npm install
```

## Running the Server
Development (auto-reload with nodemon):
```bash
npm start
```
Manual run:
```bash
node index.js
```
The server listens on `PORT 5000` (see `index.js`).

Base URL examples (assuming local run):
```
http://localhost:5000/
http://localhost:5000/customer/login
```

## Authentication Flow
1. User registers via `POST /register` (public).
2. User logs in via `POST /customer/login` with credentials.
3. On successful login a JWT (`accessToken`) is created and stored inside the session (`req.session.authorization`).
4. Protected review routes (`/customer/auth/review/:isbn`) verify the JWT on each request. If valid, `req.user.data` holds the username.

Notes:
- There is no password hashing (educational simplicity).
- Session cookie must be preserved between requests for authenticated routes to work.
- Token expiration is set to 1 hour.

## API Endpoints

### Public Routes (mounted at `/`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user (username + password). |
| GET  | `/` | Get full list of books. |
| GET  | `/isbn/:isbn` | Get book details by ISBN. |
| GET  | `/author/:author` | Get all books matching author. |
| GET  | `/title/:title` | Get all books matching exact title. |
| GET  | `/review/:isbn` | Get all reviews for a book by ISBN. |

### Customer / Auth Routes (mounted at `/customer`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/customer/login` | Authenticate user and start session (issues JWT). |
| PUT  | `/customer/auth/review/:isbn` | Add or update your review for book (authenticated). |
| DELETE | `/customer/auth/review/:isbn` | Delete your review for book (authenticated). |

### Request & Response Details
#### Register User
```http
POST /register
Content-Type: application/json
{
	"username": "alice2",
	"password": "wonderland"
}
```
Successful response:
```json
{ "message": "User successfully registered. Now you can login" }
```

#### Login
```http
POST /customer/login
Content-Type: application/json
{
	"username": "henrik",
	"password": "theGreat"
}
```
Successful response:
```json
{ "message": "User successfully logged in" }
```
Session now holds `authorization.accessToken`.

#### Add / Update Review
```http
PUT /customer/auth/review/8
Content-Type: application/json
{
	"review": "A timeless classic."
}
```
Response:
```json
{
	"message": "Review for ISBN:8 user:henrik added/updated text: \"A timeless classic.\" successfully.
",
	"book": {
		"author": "Jane Austen",
		"title": "Pride and Prejudice",
		"reviews": {"henrik": "A timeless classic."}
	}
}
```

#### Delete Review
```http
DELETE /customer/auth/review/8
```
Response:
```json
{
	"message": "Review for ISBN:8 by user:henrik deleted successfully.",
	"book": {
		"author": "Jane Austen",
		"title": "Pride and Prejudice",
		"reviews": {}
	}
}
```

## Bruno API Collections
The `bruno_calls/BookStoreApp` directory contains `.bru` request definitions for quickly exercising endpoints in the Bruno API client.
- Sample requests for registration, login, listing books, fetching by criteria, and adding/deleting reviews.
To use: import the folder into Bruno and ensure server is running on `http://localhost:5000`.

## Environment & Configuration
Current configuration values are hardcoded:
- `PORT = 5000` in `index.js`.
- `token_secret = 'hyperSecretKey'` in `index.js` and `auth_users.js`.
- Session secret: `fingerprint_customer`.
Consider extracting these into environment variables for production scenarios.

## Development Notes & Extensibility Ideas
- Persist users & reviews in a database (e.g., SQLite, Postgres) instead of memory.
- Hash passwords with `bcrypt`.
- Add middleware for input validation (e.g., `express-validator`).
- Improve review model (timestamps, ratings, multiple reviews per user?).
- Add pagination & partial matching with query parameters.
- Replace synchronous filtering with database queries.
- Add test suite (Jest / Supertest) and CI workflow.

## License
This project is released under the MIT License. See `LICENSE` for details.

## Disclaimer
This is a learning / practice project. Do not use the in-memory auth approach for production.
