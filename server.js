const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();

// Use dynamic port for Render, fallback to 3000 locally
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
/*const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Manoj1234@localhost:5432/postgres',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Signup Route ===
app.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.send('User already exists. <a href="/signup.html">Try again</a>');
    }

    await pool.query(
      'INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3)',
      [fullname, email, password]
    );

    console.log('✅ User registered:', fullname);
    res.redirect('/index.html?signup=success');
  } catch (err) {
    console.error('❌ Signup Error:', err.stack);
    res.status(500).send('<h3>Internal Server Error. Please try again later.</h3>');
  }
});

// === Login Route ===
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      console.log('✅ Login successful:', username);
      return res.redirect('/form.html');
    } else {
      return res.send('<h3>Login Failed. <a href="/index.html">Try Again</a></h3>');
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// === Student Enquiry Route ===
app.post('/submit-enquiry', async (req, res) => {
  const {
    fullname,
    phoneNumber,
    email,
    dob,
    course,
    source,
    education,
    passedYear,
    about,
    mode,
    batch_time,
    language,
    demoStatus,
    comment
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO enquiries
      (fullname, "phoneNumber", email, dob, course, source, education, "passedYear", about, mode, batch_time, language, "demoStatus", comment)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        fullname,
        phoneNumber,
        email,
        dob,
        course,
        source,
        education,
        passedYear,
        about,
        mode,
        batch_time,
        language,
        demoStatus,
        comment || null
      ]
    );

    console.log('✅ Enquiry saved for:', fullname);
    res.send('<h3>Thank you for your enquiry! <a href="/form.html">Submit another</a></h3>');
  } catch (err) {
    console.error('❌ Enquiry Save Error:', err.stack);
    res.status(500).send('<h3>Internal Server Error. Please try again later.</h3>');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
