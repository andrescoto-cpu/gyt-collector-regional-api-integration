const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error details
    logger.error(err);

    // Create a standardized error response in XML format
    const errorResponse = `
        <error>
            <message>${err.message || 'Internal Server Error'}</message>
            <status>${err.status || 500}</status>
        </error>
    `;

    // Set the response status and content type
    res.status(err.status || 500);
    res.set('Content-Type', 'application/xml');

    // Send the error response
    res.send(errorResponse);
};

module.exports = errorHandler;