// Routes that handle authenticated customer functionality (login and reviews)
// This router is mounted under the "/customer" path in index.js

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");              // In-memory books database with reviews
const regd_users = express.Router();              // Router instance for registered users

// In-memory list of registered users
// In a real app this would be stored in a database
let users = [
    {
        "username": "henrik",
        "password": "theGreat"
    },
    {
        "username": "alice",
        "password": "wonderland"
    }
];

// Secret used to sign and verify JWT tokens for authenticated users
// Must be the same value as in index.js
let token_secret = 'hyperSecretKey';

// Check if a username already exists in the users array
// returns boolean
const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

// Verify that the provided username and password match a registered user
// returns boolean
const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Login endpoint for registered users
// - Expects { username, password } in the request body
// - If credentials are valid, creates a JWT and stores it
//   in the session under req.session.authorization.accessToken
// - The token is later validated by the middleware in index.js
// Only registered users can login
regd_users.post("/login", (req, res) => {
    
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if (authenticatedUser(username, password)) {
        // Create a JWT that encodes the username in its payload
        let accessToken = jwt.sign({
            data: username
        }, token_secret, { expiresIn: 60 * 60 }); // Token valid for 1 hour

        // Store token in session so it can be used by auth middleware
        req.session.authorization = {
            accessToken
        }
        return res.status(200).json({message: "User successfully logged in"});
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add or update a book review for the currently authenticated user
// - Route: PUT /customer/auth/review/:isbn
// - Requires a valid JWT (middleware in index.js populates req.user)
// - Uses req.user.data (the username from the token) as the review owner
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.body.review;
    let username = req.user.data;

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({
            message: `Review for ISBN:${isbn} user:${username} added/updated text: "${review}" successfully.`,
            book: books[isbn]
        });
    } else {
        return res.status(404).json({message: "Book not found."});
    }
});

// Delete the review of the currently authenticated user for a given book
// - Route: DELETE /customer/auth/review/:isbn
// - Only deletes the review that belongs to req.user.data
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.user.data;

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({
                message: `Review for ISBN:${isbn} by user:${username} deleted successfully.`,
                book: books[isbn]
            });
        } else {
            return res.status(404).json({message: "Review by this user not found."});
        }
    } else {
        return res.status(404).json({message: "Book not found."});
    }
});

// Export router and helper functions so they can be used in index.js
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
