const ThrowError = require('../utils/ErrorClass');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ThrowError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value`;
  return new ThrowError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `Invalid Input data. ${
    Object.values(err.errors)[0].properties.message
  }`;
  return new ThrowError(message, 400);
};

const handleJWTerror = () => {
  return new ThrowError('Invalid token please login again', 401);
};

const handleTokenExpired = () => {
  return new ThrowError('Token expired. Please login again', 401);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrProd = (err, res) => {
  // Only send custom err messages
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR: ', err);
    res.status(500).json({
      status: err.status,
      message: 'Something went wrong :(',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error._message === 'Tour validation failed') {
      error = handleValidationErrorDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJWTerror();
    } else if (error.name === 'TokenExpiredError') {
      error = handleTokenExpired();
    }

    sendErrProd(error, res);
  }
};
