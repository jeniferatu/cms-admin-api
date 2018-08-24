import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import hbs from 'hbs';
import hbsutils from 'hbs-utils';

var index = require('./routes/index');
// var users = require('./routes/users');
var admin = require('./routes/admin');
// var daftarnama = require('./routes/daftarnama');

var app = express();

// view engine setup
hbsutils(hbs).registerPartials(`${__dirname}/views/partials`);
hbsutils(hbs).registerWatchedPartials(`${__dirname}/views/partials`);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// create session
// app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'expression',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(`${__dirname}/node_modules/jquery/dist`));
app.use('/bootstrap', express.static(`${__dirname}/node_modules/bootstrap/dist`));
app.use('/admin-lte', express.static(`${__dirname}/node_modules/admin-lte/dist`));
app.use('/font-awesome', express.static(`${__dirname}/node_modules/font-awesome`));
app.use('/customcss', express.static(`${__dirname}/public/stylesheets`));
app.use('/customjs', express.static(`${__dirname}/public/javascripts`));
app.use('/plugins', express.static(`${__dirname}/node_modules/admin-lte/plugins`));

app.use('/admin', admin);
app.use('/', index);
// app.use('/admin', requireLogin, admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.send(err.status);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// buat filter login
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect("/admin/login"); // or render a form, etc.
  }
}

module.exports = app;
