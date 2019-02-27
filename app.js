var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var checkToken = require('./middlewares/checkToken');
var userRouter = require('./routes/user');
var playerRouter = require('./routes/player');
var dashboardRouter = require('./routes/dashboard');
var config = require('./common/config.json');

var app = express();

if (config.general.allowOrigin > 0) {
  // 允许跨域访问
  // ip和端口任意一个不一致均属于跨域
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "X-Requested-With,Content-Type,x-token,x-access-token");
    res.header('Access-Control-Allow-Methods', "POST,GET,OPTIONS");
    res.header('X-Powered-By', ' 3.2.1');
    res.header('Content-Type', "application/json;charset=utf-8");
    if (req.method == 'OPTIONS') {
      res.send(200); /* 让OPTIONS请求快速返回 */
    } else {
      next();
    }
  });
}

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.engine('html', ejs.__express);
//app.set('view engine', 'html');
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/player', checkToken, playerRouter);
app.use('/dashboard', checkToken, dashboardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
