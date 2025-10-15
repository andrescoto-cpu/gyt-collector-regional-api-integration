import { AkrosClient } from '../../src/services/akrosClient';
import axios from 'axios';

jest.mock('axios');

describe('AkrosClient', () => {
    let akrosClient;
    const mockToken = 'mockAccessToken';

    beforeEach(() => {
        akrosClient = new AkrosClient();
        akrosClient.token = mockToken; // Set a mock token for testing
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should authenticate and retrieve access token', async () => {
        const responseData = {
            access_token: mockToken,
            expires_in: 3600,
        };

        axios.post.mockResolvedValue({ data: responseData });

        const token = await akrosClient.authenticate();

        expect(token).toBe(mockToken);
        expect(axios.post).toHaveBeenCalledWith(
            process.env.AKROS_TOKEN_URL,
            {
                grant_type: 'client_credentials',
                client_id: process.env.AKROS_CLIENT_ID,
                client_secret: process.env.AKROS_CLIENT_SECRET,
            }
        );
    });

    test('should handle API call with valid token', async () => {
        const apiResponse = { data: { success: true } };
        axios.post.mockResolvedValue(apiResponse);

        const response = await akrosClient.callApi('/some-endpoint', { some: 'data' });

        expect(response).toEqual(apiResponse.data);
        expect(axios.post).toHaveBeenCalledWith(
            '/some-endpoint',
            { some: 'data' },
            { headers: { Authorization: `Bearer ${mockToken}` } }
        );
    });

    test('should refresh token if expired', async () => {
        const expiredToken = 'expiredToken';
        akrosClient.token = expiredToken;

        axios.post.mockResolvedValueOnce({ data: { access_token: mockToken } });
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        const response = await akrosClient.callApi('/some-endpoint', { some: 'data' });

        expect(response).toEqual({ success: true });
        expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test('should throw error on API call failure', async () => {
        const errorMessage = 'API call failed';
        axios.post.mockRejectedValue(new Error(errorMessage));

        await expect(akrosClient.callApi('/some-endpoint', { some: 'data' })).rejects.toThrow(errorMessage);
    });
});