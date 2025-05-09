var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectDB = require('./config/db');
const bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const activityRoutes = require('./routes/backstage/activities');
const ShowcaseRoutes = require('./routes/backstage/showcase')
// const createSuperAdmin  = require('./initAdmin')

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '7d',
    setHeaders: (res, path) => {
        if (/(css|js)$/.test(path)) {
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
    }
}));
app.use(bodyParser.urlencoded({extended: true})) // 支持嵌套对象
app.use(bodyParser.json())
connectDB();

// createSuperAdmin ()
// 允许所有来源（生产环境应指定具体域名）
app.use(cors({
    origin: 'http://localhost:5173', // 替换前端地址
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use('/api', indexRouter);
app.use('/users', usersRouter);
app.use('/api/activities', activityRoutes);
app.use('/api/showcase', ShowcaseRoutes);

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
