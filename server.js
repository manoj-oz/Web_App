const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


// In-memory user store (you can replace this with a DB later)
const users = [
  { fullname: 'Student One', email: 'student@example.com', password: 'password123' }
];

// Signup route
app.post('/signup', (req, res) => {
  const { fullname, email, password } = req.body;

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.send('User already exists. <a href="/signup.html">Try again</a>');
  }

  users.push({ fullname, email, password });
  console.log("User registered:", fullname);
  res.redirect('/login.html');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => (u.email === username || u.username === username) && u.password === password);
  if (user) {
    return res.redirect('/student-enquiry.html');
  } else {
    return res.send('<h3>Login Failed. <a href="/login.html">Try Again</a></h3>');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
