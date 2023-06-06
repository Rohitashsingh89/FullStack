const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
// const fs = require('fs');
// const path = require('path');

const port = 8000;

// const upload = multer({ dest: 'uploads/' });

const app = express()

// const db = mysql.createConnection({
//     host:"localhost",
//     user: "root",
//     password: "Mysql@0987654321",
//     database: "Tim",
//     port: 3308,
// });

const db = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "Mysql@0987654321",
    database: "Tim",
    port: 3308,
});

// if there is a auth problem 
// ALTER USER "root'@'localhost" IDENTIFIED WITH mysql_native_password BY 'Mysql@0987654321';

app.use(express.json())
app.use(cors())

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json("Hello this si the backend");
});

app.get("/books", (req, res) => {
    const q = "SELECT * FROM BOOKS";
    
    db.query(q,(err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});;

  
app.post('/register', async (req, res) => {
    try {
      const q = 'INSERT INTO users (`name`, `email`, `password`) VALUES (?)';
      const values = [
        req.body.name,
        req.body.email,
        req.body.password,
      ];
  
      db.query(q, [values], (err, data) => {
        if (err) throw err; // Throw the error to be caught by the catch block
        res.json({ message: 'Registration successful' });
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
});
  
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email in the "users" table
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
      if (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during login' });
      }

      // If the user is not found
      if (results.length === 0) {
        // console.log("1");
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      const user = results[0];
      
      // Compare the provided password with the stored password (plaintext)
      if (password !== user.password) {
        // console.log("2 ");
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Password is valid, login successful
    //   console.log("3");
      res.status(200).json({ success: true, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

// contact form route
app.post('/contact', (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const q = 'INSERT INTO contact (name, email, subject, message) VALUES (?, ?, ?, ?)';
      const values = [name, email, subject, message];
  
      db.query(q, values, (err, data) => {
        if (err) {
          console.error('Error during contact form submission:', err);
          return res.status(500).json({ success: false, message: 'An error occurred during form submission' });
        }
  
        res.status(200).json({ success: true, message: 'Message sent successfully' });
      });
    } catch (error) {
      console.error('Error during contact form submission:', error);
      res.status(500).json({ success: false, message: 'An error occurred during form submission' });
    }
  });
  
  
  
  
app.listen(port, () => {
    console.log(`Connected to backend on port ${port}`)
});