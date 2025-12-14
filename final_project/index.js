// Main entry point for the Book Reviews Express application
// This file wires up middleware, authentication and route modules.

// Core dependencies
const express = require('express');                    // Web framework
const jwt = require('jsonwebtoken');                   // JSON Web Token handling
const session = require('express-session')             // Session management

// Route modules
const customer_routes = require('./router/auth_users.js').authenticated; // Routes that require authentication
const genl_routes = require('./router/general.js').general;              // Public / general routes

// Create the Express application instance
const app = express();

// Parse incoming JSON request bodies and make them available on req.body
app.use(express.json());

// Secret key used to sign and verify JWT access tokens
// In a real production app this should come from an environment variable
let token_secret = 'hyperSecretKey';

// Configure session middleware only for routes under /customer
// This stores a session object on req.session, which we use to keep the JWT
app.use("/customer", session(
    {
        secret: "fingerprint_customer", // Key used to sign the session ID cookie
        resave: true,                    // Always save the session back to the store
        saveUninitialized: true          // Save new sessions that have not been modified
    }
));

// Authentication middleware for all /customer/auth/* routes
// - Expects a JWT access token to be stored in req.session.authorization.accessToken
// - Verifies the token; if valid, attaches the decoded user payload to req.user
// - Rejects the request if the user is not logged in or the token is invalid
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        token = req.session.authorization['accessToken'];
        jwt.verify(token, token_secret, (err, user) => {
            if (!err) {
                req.user = user;              // Make user information available to later handlers
                next();                       // Continue to the requested route
            } else {
                return res.status(403).json({message: "User not authenticated"});
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"});
    }
});

// Port on which the Express server will listen for incoming requests
const PORT = 5000;

// Mount route handlers
app.use("/customer", customer_routes); // Customer-specific (possibly protected) routes
app.use("/", genl_routes);            // Root path uses general/public routes

// Start the HTTP server
app.listen(PORT, () => console.log("Server is running"));
