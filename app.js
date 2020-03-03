const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const createError = require('http-errors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const logger = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const rateLimit = require('express-rate-limit');
const xssCln = require('xss-clean');

//Load env vars
dotenv.config({ path: './config/config.env' });

const connectDB = require('./config/db');
//  Connect to the database
connectDB();

//Router Files
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const userzRouter = require('./routes/userz');
const profilesRouter = require('./routes/profiles');
const postsRouter = require('./routes/posts');
const widgetsRouter = require('./routes/widgets');
const widgetzRouter = require('./routes/widgetz');

const app = express();
console.log(`Server listening in ${process.env.NODE_ENV} on port ${process.env.PORT}!`.yellow.bold);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Init MiddleWare
app.use(logger('dev'));
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set Security Headers
app.use(helmet());

// Sanitize Data
app.use(mongoSanitize());

// Prevent Xross Site Security attacks
app.use(xssCln());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// App Mount Routers
app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/users', usersRouter);
app.use('/api/v1/users', userzRouter);
app.use('/api/v1/profiles', profilesRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/widgets', widgetsRouter);
app.use('/api/v1/widgets', widgetzRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
