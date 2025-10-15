class AkrosClient {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.clientId = process.env.AKROS_CLIENT_ID;
        this.clientSecret = process.env.AKROS_CLIENT_SECRET;
        this.tokenUrl = process.env.AKROS_TOKEN_URL;
    }

    async authenticate() {
        if (this.token && this.tokenExpiry > Date.now()) {
            return this.token;
        }

        const response = await this.requestToken();
        this.token = response.access_token;
        this.tokenExpiry = Date.now() + (response.expires_in * 1000);
        return this.token;
    }

    async requestToken() {
        const response = await axios.post(this.tokenUrl, {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret
        });

        if (response.status !== 200) {
            throw new Error('Failed to retrieve access token');
        }

        return response.data;
    }

    async apiCall(endpoint, data) {
        const token = await this.authenticate();
        const response = await axios.post(endpoint, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status !== 200) {
            throw new Error('API call failed');
        }

        return response.data;
    }
}

export default new AkrosClient();