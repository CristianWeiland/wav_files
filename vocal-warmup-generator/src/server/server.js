let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');

const session = require('express-session');
//let sessions = require('client-sessions'); TODO: Remove client-sessions component!
const { v4: uuidv4 } = require('uuid');

let secret = require('./secret');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let wavRouter = require('./routes/wav');
let warmupRouter = require('./routes/warmup');
let exercisesRouter = require('./routes/exercises');
let predefinedExercisesRouter = require('./routes/predefined_exercises');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', express.static(path.join(__dirname, 'public')));

app.use(session({
  genid: (req, res) => {
    return uuidv4(); // return uuid for user session
  },
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false, sameSite: 'strict' }
}));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/wav', wavRouter);
app.use('/api/warmup', warmupRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/predefined_exercises', predefinedExercisesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(express.static('public'));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
