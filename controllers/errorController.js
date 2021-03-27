const AppError = require('../utils/appError');

// Bad ID Error
// This will convert mongoose error to a production error that human can read
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
// Dublicate Field Error
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return new AppError(message, 400);
};
// Validation Error
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => {
        return el.message;
    });
    const message = `Invalid input data. ${errors.join('. ')}`;
    // console.log(err);
    return new AppError(message, 400);
};
// Token error, bad signature
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
};
//
const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again', 401);
};

const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            name: err.name,
            message: err.message,
            stack: err.stack,
        });
    }
    // B) Rendered Website
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
};
const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to the client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // Programming or other unknown error: don't want ot leak info to client
        // 1. Log error
        console.error('ERROR', err);

        // 2. Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
    // B) Rendered Website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
    }
    // Programming or other unknown error: don't want ot leak info to client
    // 1. Log error
    console.error('ERROR', err);

    // 2. Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later!',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // 500 => internal server error
    err.status = err.status || 'error';
    // handleValidationErrorDB(err); // for debuging while in production env

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // in if statments difference between err.name & error.code is because how postman structures error object and that I have added custome field in output, so to get the same functionality as in Node.js Course I use two different objects.

        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error = { ...err };
        // error.message = err.message;

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, req, res);
    }
};
