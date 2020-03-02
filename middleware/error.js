const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err.stack.red);

    // Mongoose bad ObjectID
    // console.log(err.name);
    if (err.name === 'CastError') {
        const message = `Resource not found; Mongoose bad ObjectID`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    // console.log(err.code);
    if (err.code === 11000) {
        const message = error.message || `Resource with an id of ${err.value} or ${req.params.id} is not unique`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    // console.log(err.name);
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message) || `Resource with an id of ${err.value} or ${req.params.id} Validation ErrorJS MIDDLEWARE`;
        error = new ErrorResponse(message, 400);
    }

    res
        .status(error.statusCode || 500)
        .json({
            success: false,
            // msg: `ErrorJS MIDDLEWARE:: ${req.params.id} is an odd request..`,
            error: error.message || 'Server Error'
            // data: bootCamp,
        });
};

module.exports = errorHandler;