const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const connectDB = require('./config/db');

// Load environment variables from .env file
require('dotenv').config();

// Passport config
require('./config/passport')(passport);

// Connect to MongoDB
connectDB();

const app = express();

// Set EJS as the template engine and use layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Connect flash middleware
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Set all flash messages
  res.locals.user = req.user || null; // Ensure user is available in all views
  next();
});

// Set static folder
app.use(express.static('public'));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/blogs', require('./routes/blogs'));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error/404', { user: req.user });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error/500', { user: req.user });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});