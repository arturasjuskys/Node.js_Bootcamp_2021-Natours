class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        // Ternary operator to check if statusCode is 400 or 500 and assign fail or error to it
        this.status = `${statusCode}`.startsWith(
            '4'
        )
            ? 'fail'
            : 'error';
        // This custom property is here to seperate operational errors from programming errors, if app gets a bug this error class will not have this property
        this.isOperational = true;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

module.exports = AppError;
