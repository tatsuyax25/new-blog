const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Blog = require("../models/Blog");

// Show all blogs
router.get("/", ensureAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("user").lean();
    res.render("blogs/index", { blogs, title: "All Blogs" }); // Add title
  } catch (err) {
    console.error(err);
    res.render("error/500", { title: "Server Error" }); // Add title for error page
  }
});

// Show form to create new blog
router.get("/new", ensureAuth, (req, res) => {
  res.render("blogs/new", { user: req.user, title: "Create New Blog" }); // Add title
});

// Process new blog
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Blog.create(req.body);
    res.redirect("/blogs");
  } catch (err) {
    console.error(err);
    res.render("error/500", { user: req.user, title: "Server Error" }); // Add title
  }
});

// Show single blog
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("user").lean();
    if (!blog) {
      return res.render("error/404", { title: "Blog Not Found" }); // Add title
    }
    res.render("blogs/show", { blog, title: blog.title || "View Blog" }); // Add title
  } catch (err) {
    console.error(err);
    res.render("error/500", { title: "Server Error" }); // Add title
  }
});

// Show form to edit blog
router.get("/:id/edit", ensureAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render("error/404", { title: "Blog Not Found" }); // Add title
    }
    if (blog.user != req.user.id) {
      res.redirect("/blogs");
    } else {
      res.render("blogs/edit", { blog, title: "Edit Blog" }); // Add title
    }
  } catch (err) {
    console.error(err);
    res.render("error/500", { title: "Server Error" }); // Add title
  }
});

// Update blog
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render("error/404", { title: "Blog Not Found" }); // Add title
    }
    if (blog.user != req.user.id) {
      res.redirect("/blogs");
    } else {
      blog = await Blog.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/blogs");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500", { title: "Server Error" }); // Add title
  }
});

// Delete blog
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.render("error/404", { title: "Blog Not Found" }); // Add title
    }
    if (blog.user != req.user.id) {
      res.redirect("/blogs");
    } else {
      await Blog.remove({ _id: req.params.id });
      res.redirect("/blogs");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500", { title: "Server Error" }); // Add title
  }
});

module.exports = router;
