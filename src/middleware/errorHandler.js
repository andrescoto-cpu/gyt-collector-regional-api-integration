const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error details, but handle undefined errors
    if (err) {
        logger.error(`Error in ${req.method} ${req.path}:`, err);
    } else {
        logger.warn(`Undefined error in ${req.method} ${req.path}`);
    }

    // Create a standardized error response in XML format
    const errorMessage = err?.message || 'Internal Server Error';
    const errorStatus = err?.status || 500;
    
    const errorResponse = `
        <error>
            <message>${errorMessage}</message>
            <status>${errorStatus}</status>
        </error>
    `;

    // Set the response status and content type
    res.status(errorStatus);
    res.set('Content-Type', 'application/xml');

    // Send the error response
    res.send(errorResponse);
};

module.exports = errorHandler;