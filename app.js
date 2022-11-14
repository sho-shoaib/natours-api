const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const ThrowError = require('./utils/ErrorClass.js');
const errorHandle = require('./controllers/errorController.js');

const app = express();

app.use(express.json()); // body-parser
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // morgan
}

// Static Files
app.use(express.static('./public'));

// custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// route
app.use('/tours', tourRouter);
app.use('/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new ThrowError(`Invalid URL ${req.originalUrl}`, 404);
  next(err);
});

app.use(errorHandle);

module.exports = app;
