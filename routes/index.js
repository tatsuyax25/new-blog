const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Blog = require('../models/Blog');

router.get('/', ensureGuest, (req, res) => {
  res.render("index", { title: "Home", user: req.user, messages: req.flash() });
});

router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      blogs,
      messages: req.flash(),
    });
  } catch (err) {
    console.error(err);
    res.render("error/500", {
      title: "Error",
      user: req.user,
      messages: req.flash(),
    });
  }
});

module.exports = router;