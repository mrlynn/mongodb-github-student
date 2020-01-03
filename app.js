var createError = require('http-errors');
var express = require('express');
var path = require('path');
var passport = require('passport');
var dotenv = require('dotenv').config();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
var logger = require('morgan');
var methodOverride = require('method-override');
const flash = require('connect-flash');
const helmet = require('helmet');
var partials = require('express-partials');
var fileUpload = require('express-fileupload');
var http = require('http');
var debug = require('debug')('server:server');


// Authentication
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

const compression = require('compression');
const db = require('./config/database');

const config = require('./config/constants');
var store = new MongoDBStore({
  uri: config.MONGO_URL,
  collection: 'sessions'
});
// Catch errors
store.on('error', function(error) {
  console.log(error);
});

const viewdir = __dirname + '/views/';
const basedir = __dirname + '/public';

const env = process.env.NODE_ENV || 'development';

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var studentRouter = require('./routes/students');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine(
  'hbs',
  exphbs({ defaultLayout: 'layout', extname: '.hbs' })
);
app.set('view engine', 'hbs');
app.use(partials());
app.use(helmet());
app.use(compression());
app.use(
  session({
    secret: config.site.secret,
    saveUninitialized: false,
    resave: false,
    store: store
  })
);
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).

app.use(passport.initialize());
app.use(passport.session());

if (env === 'development') {
  app.use(logger('dev'));
}

app.use(flash());

app.use(function(req, res, next){
  res.locals.flashMessages = req.flash();
  res.locals.client_id = process.env.GITHUB_CLIENT_ID;
  next();
});
require('./config/passport')(passport);

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/students', studentRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("Before error: " + JSON.stringify(req.query))
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
module.exports = app;

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
