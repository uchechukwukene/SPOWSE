import mongoose from 'mongoose';
import appResponse from "../lib/appResponse.js";

const mongooseValidationError = mongoose.Error.ValidationError;
const isProduction = process.env.NODE_ENV === 'production';

const errorNames = [
    'CastError',
    'JsonWebTokenError',
    'TokenExpiredError',
    'ValidationError',
    'SyntaxError',
    'MongooseError',
    'MongoError'
  ];

export const ErrorHandler = function (error, req, res, next) {
    if (error.name === 'SPOWSER_ERROR' || error.isOperational) {
        return res.status(error.statusCode).send(appResponse(error.message, null, false));
    }

    if (error instanceof mongooseValidationError) {
        const errorMessages = Object.values(error.errors).map((e) => e.message);
        console.error({ errorMessages });
        return res
        .status(400)
        .send(
            appResponse(
            'validation error occurred check your inputs for corrections',
            null,
            errorMessages
            )
        );
    }

    if (error.hasOwnProperty('name') && error.name === 'MongoError') {
        const data = error && error.errmsg ? error.errmsg : null;
        console.error({ data });
        return res.status(400).send(appResponse('the entry already exist', data, false));
    }

    if (errorNames.includes(error.name)) {
        if (error.name === 'TokenExpiredError') {
        return res
            .status(400)
            .send(appResponse('Token has expired, Request a reset password again', null, false));
        }
        return res.status(400).send(appResponse(error.message, null, false));
    }

    // log error
    console.error(error);

    const message = isProduction
        ? 'An unexpected error has occured. Please, contact the administrator'
        : error.message;

    return res.status(500).send(appResponse(message, null, false));
};
  