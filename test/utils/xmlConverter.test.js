import { parseXml, buildXml, xmlToJson, jsonToXml } from '../../src/utils/xmlConverter';

describe('XML Converter Utilities', () => {
    describe('parseXml', () => {
        it('should parse a valid XML string to an object', () => {
            const xml = '<root><child>value</child></root>';
            const expected = { root: { child: 'value' } };
            return parseXml(xml).then(result => {
                expect(result).toEqual(expected);
            });
        });

        it('should throw an error for invalid XML', () => {
            const invalidXml = '<root><child>value</child>';
            return parseXml(invalidXml).catch(err => {
                expect(err).toBeDefined();
            });
        });
    });

    describe('buildXml', () => {
        it('should build XML from an object', () => {
            const obj = { root: { child: 'value' } };
            const expectedXml = '<root><child>value</child></root>';
            const result = buildXml(obj);
            expect(result).toEqual(expectedXml);
        });
    });

    describe('xmlToJson', () => {
        it('should convert XML to JSON format for Akros API', () => {
            const xml = '<payment><amount>100</amount></payment>';
            const expectedJson = { payment: { amount: '100' } };
            const result = xmlToJson(xml);
            expect(result).toEqual(expectedJson);
        });
    });

    describe('jsonToXml', () => {
        it('should convert Akros API JSON response to XML', () => {
            const json = { response: { status: 'success' } };
            const expectedXml = '<response><status>success</status></response>';
            const result = jsonToXml(json);
            expect(result).toEqual(expectedXml);
        });
    });
});