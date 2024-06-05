const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Blog = require('../models/Blog');

// Show all blogs
router.get('/', ensureAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('user').lean();
    res.render('blogs/index', { blogs });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Show form to create new blog
router.get('/new', ensureAuth, (req, res) => {
  res.render('blogs/new');
});

// Process new blog
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id; // Assign the current user's ID to the blog post's user field
    await Blog.create(req.body); // Create a new blog post with the data from the request body
    res.redirect('/blogs'); // Redirect to the list of all blog posts after creating the new one
  } catch (err) {
    console.error(err);
    res.render('error/500'); // Render an error page if there's an error creating the blog post
  }
});

// Show single blog
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user').lean();
    if (!blog) {
      return res.render('error/404');
    }
    res.render('blogs/show', { blog });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Show form to edit blog
router.get('/:id/edit', ensureAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render('error/404');
    }
    if (blog.user != req.user.id) {
      res.redirect('/blogs');
    } else {
      res.render('blogs/edit', { blog });
    }
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Update blog
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render('error/404');
    }
    if (blog.user != req.user.id) {
      res.redirect('/blogs');
    } else {
      blog = await Blog.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect('/blogs');
    }
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Delete blog
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render('error/404');
    }
    if (blog.user != req.user.id) {
      res.redirect('/blogs');
    } else {
      await Blog.remove({ _id: req.params.id });
      res.redirect('/blogs');
    }
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;