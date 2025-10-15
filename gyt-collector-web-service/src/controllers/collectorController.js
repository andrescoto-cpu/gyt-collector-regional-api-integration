class CollectorController {
    async processPayment(req, res) {
        try {
            // Step 1: Receive XML request
            const xmlData = req.body;

            // Step 2: Convert XML to JSON
            const jsonData = await xmlConverter.xmlToJson(xmlData);

            // Step 3: Call Akros API with JSON data
            const akrosResponse = await akrosClient.sendPayment(jsonData);

            // Step 4: Convert Akros response JSON to XML
            const responseXml = await xmlConverter.jsonToXml(akrosResponse);

            // Step 5: Send XML response back to Banco GYT
            res.set('Content-Type', 'application/xml');
            res.status(200).send(responseXml);
        } catch (error) {
            // Handle errors
            this.handleError(error, res);
        }
    }

    handleError(error, res) {
        // Log the error
        logger.error(error);

        // Return standardized error response in XML format
        const errorResponse = {
            error: {
                message: error.message || 'Internal Server Error',
                code: error.code || 500
            }
        };
        const errorXml = xmlConverter.jsonToXml(errorResponse);
        res.set('Content-Type', 'application/xml');
        res.status(error.code || 500).send(errorXml);
    }
}

export default new CollectorController();