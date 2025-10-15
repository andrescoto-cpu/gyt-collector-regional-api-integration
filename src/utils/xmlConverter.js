// src/utils/xmlConverter.js

const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

function parseXml(xmlString) {
    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function buildXml(obj) {
    return builder.buildObject(obj);
}

function xmlToJson(xmlString) {
    return parseXml(xmlString);
}

function jsonToXml(jsonObj) {
    return buildXml(jsonObj);
}

module.exports = {
    parseXml,
    buildXml,
    xmlToJson,
    jsonToXml,
};