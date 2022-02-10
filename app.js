var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const bp = require('body-parser')
var db = require('./config/connections') //  requiring database
var Swal = require('sweetalert2')
const MongoStore = require('connect-mongo')

var {create} =  require('express-handlebars');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
const hbs = create({
  helpers : {
    calculateRevenue : (price) => {
      console.log(price);
     return price
    }
  }
});




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
//creating session
app.use(session({
  secret:'secret',
  store : MongoStore.create({
    mongoUrl : 'mongodb+srv://jisoChacko:jiso123456@cluster0.lunqa.mongodb.net/ecommerce?retryWrites=true&w=majority',
    ttl : 6 * 24 * 60 * 60,
    autoRemove : 'native'
  }),
  cookie:{
    maxAge:3600000000000,
    resave : false,
    saveUninitialized : false,
  }
}))


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');


// creating database
db.connect((err) => {
  if(err){
    console.log('Connection Error to mongoDB'+err);
  }
  else{
    console.log('Connected successfull to port 27017');
  }
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
