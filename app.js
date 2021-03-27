const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start Express App
const app = express();

///////////////////////////////////////////////////////////////////////////////////////////////
// Pug - Template Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

///////////////////////////////////////////////////////////////////////////////////////////////
// Global Middlewares

// Serving static files
// app.use(express.static(`${__dirname}/public`)); // To open static files form public folder
app.use(express.static(path.join(__dirname, 'public'))); // To open static files form public folder

// Set security HTTP headers
app.use(helmet());

// Development logger
// This one sets morgan logger for different NODE_ENV
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // 3rd-party from NPM
}

// Limit requests from samer IPs
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuanitity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// Testing middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

///////////////////////////////////////////////////////////////////////////////////////////////
// Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handling Unhendled Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Hadler Middleware
app.use(globalErrorHandler);

///////////////////////////////////////////////////////////////////////////////////////////////
// Server

module.exports = app;
