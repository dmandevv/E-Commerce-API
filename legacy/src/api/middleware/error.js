module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    //Handle Mongoose Bad Object ID or Invalid Types
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new Error(message);
        //override default 500 error
        err.statusCode = 400;
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        // Map through all errors (price, name, etc.) and join them into one string
        const message = Object.values(err.errors).map(value => value.message);
        err = new Error(message);
        err.statusCode = 400;
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}