import { CollectorController } from '../../src/controllers/collectorController';
import { xmlToJson, jsonToXml } from '../../src/utils/xmlConverter';
import { AkrosClient } from '../../src/services/akrosClient';

jest.mock('../../src/utils/xmlConverter');
jest.mock('../../src/services/akrosClient');

describe('CollectorController', () => {
    let collectorController;

    beforeEach(() => {
        collectorController = new CollectorController();
    });

    describe('processPayment', () => {
        it('should convert XML to JSON and call Akros API', async () => {
            const xmlInput = '<payment><amount>100</amount></payment>';
            const jsonOutput = { payment: { amount: 100 } };
            const akrosResponse = { status: 'success' };

            xmlToJson.mockReturnValue(jsonOutput);
            AkrosClient.prototype.sendPayment.mockResolvedValue(akrosResponse);

            const req = { body: xmlInput };
            const res = { send: jest.fn() };

            await collectorController.processPayment(req, res);

            expect(xmlToJson).toHaveBeenCalledWith(xmlInput);
            expect(AkrosClient.prototype.sendPayment).toHaveBeenCalledWith(jsonOutput);
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<status>success</status>'));
        });

        it('should handle errors and respond with XML', async () => {
            const xmlInput = '<payment><amount>100</amount></payment>';
            const errorMessage = 'Error processing payment';

            xmlToJson.mockImplementation(() => { throw new Error(errorMessage); });

            const req = { body: xmlInput };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            await collectorController.processPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<error>'));
        });
    });

    describe('xmlToJson', () => {
        it('should convert XML to JSON correctly', () => {
            const xmlInput = '<payment><amount>100</amount></payment>';
            const expectedJson = { payment: { amount: 100 } };

            xmlToJson.mockReturnValue(expectedJson);

            const result = collectorController.xmlToJson(xmlInput);

            expect(result).toEqual(expectedJson);
        });
    });

    describe('jsonToXml', () => {
        it('should convert JSON to XML correctly', () => {
            const jsonInput = { payment: { amount: 100 } };
            const expectedXml = '<payment><amount>100</amount></payment>';

            jsonToXml.mockReturnValue(expectedXml);

            const result = collectorController.jsonToXml(jsonInput);

            expect(result).toEqual(expectedXml);
        });
    });
});