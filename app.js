// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

dotenv.config();

// Passport config
require('./config/passport')(passport);

// Connect to MongoDB
connectDB();

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Express session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/blogs', require('./routes/blogs'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running in ${PORT}`));