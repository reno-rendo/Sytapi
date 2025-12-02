const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/database');

// GET /auth/register - Display registration page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// POST /auth/register - Handle registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).render('register', { title: 'Register', error: 'All fields are required.' });
    }

    const existingUser = await db.getUserByUsernameOrEmail(username) || await db.getUserByUsernameOrEmail(email);
    if (existingUser) {
      return res.status(400).render('register', { title: 'Register', error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(username, email, hashedPassword);

    res.redirect('/auth/login?registered=true');
  } catch (error) {
    console.error(error);
    res.status(500).render('register', { title: 'Register', error: 'An error occurred during registration.' });
  }
});

// GET /auth/login - Display login page
router.get('/login', (req, res) => {
  const message = req.query.registered ? 'Registration successful! Please log in.' : null;
  res.render('login', { title: 'Login', message });
});

// POST /auth/login - Handle login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).render('login', { title: 'Login', error: 'Username/email and password are required.' });
    }

    const user = await db.getUserByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).render('login', { title: 'Login', error: 'An error occurred during login.' });
  }
});

// GET /auth/logout - Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); // The default session cookie name
    res.redirect('/');
  });
});

module.exports = router;
