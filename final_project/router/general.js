const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    
    let username = req.body.username;
    let password = req.body.password;

    if (username && password) {
        if (!isValid(username)) { 
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});    
        }
    } else {
        if(!username){
            return res.status(404).json({message: "Username is required."});
        }
        if(!password){
            return res.status(404).json({message: "Password is required."});
        }
    }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    
    let isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn], null, 4));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    let author = req.params.author;
    let filteredBooks = Object.keys(books)
                       .filter(bookIndex => books[bookIndex].author === author)
                       .map(bookIndex => books[bookIndex]);
    res.send(JSON.stringify(filteredBooks, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let title = req.params.title;
    let filteredBooks = Object.keys(books)
                       .filter(bookIndex => books[bookIndex].title === title)
                       .map(bookIndex => books[bookIndex]);
    res.send(JSON.stringify(filteredBooks, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;
