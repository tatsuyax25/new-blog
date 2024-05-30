const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Blog = require('../models/Blog');

router.get('/', ensureGuest, (req, res) => {
  res.render('index', { title: 'Home', user: req.user });
});

router.get('/login', ensureGuest, (req, res) => {
  res.render('login', { layout: 'main' });
});

router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user.id }).lean();
    res.render('dashboard', { title: 'Dashboard', user: req.user, blogs });
  } catch (err) {
    console.error(err);
    res.render('error/500', { title: 'Error', user: req.user });
  }
});

// Example of setting a success flash message
router.get('/success', (req, res) => {
  req.flash('success', 'You have successfully logged in');
  res.redirect('/dashboard');
});

// Example of setting an error flash message
router.get('/error', (req, res) => {
  req.flash('error', 'An error occurred');
  res.redirect('/');
});

module.exports = router;