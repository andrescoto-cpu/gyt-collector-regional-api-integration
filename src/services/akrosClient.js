const axios = require('axios');
const logger = require('../utils/logger');

class AkrosApiClient {
  constructor() {
    this.baseUrl = process.env.AKROS_API_URL;
    this.clientId = process.env.AKROS_CLIENT_ID;
    this.clientSecret = process.env.AKROS_CLIENT_SECRET;
    this.tokenUrl = process.env.AKROS_TOKEN_URL;
    this.apiEndpoint = process.env.AKROS_API_ENDPOINT;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth 2.0 access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      logger.info('Requesting new OAuth 2.0 token from Akros API');
      
      const response = await axios.post(
        this.tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 60 seconds as buffer)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      
      logger.info('Successfully obtained OAuth 2.0 token');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to obtain OAuth 2.0 token:', error.message);
      throw new Error('OAuth 2.0 authentication failed');
    }
  }

  /**
   * Call Akros API with JSON payload
   * @param {object} jsonPayload - JSON data to send to Akros
   * @returns {Promise<object>} Response from Akros API
   */
  async callApi(jsonPayload) {
    try {
      const token = await this.getAccessToken();
      
      logger.info('Calling Akros API', { endpoint: this.apiEndpoint });
      
      const response = await axios.post(
        `${this.baseUrl}${this.apiEndpoint}`,
        jsonPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      logger.info('Successfully received response from Akros API');
      return response.data;
    } catch (error) {
      logger.error('Akros API call failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      throw new Error(`Akros API error: ${error.message}`);
    }
  }
}

module.exports = new AkrosApiClient();
