using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace GytCollectorApi.Services
{
    /// <summary>
    /// Service for integrating with Akros Regional Collector API
    /// Handles communication with GYT Continental Bank Web Service
    /// </summary>
    public class AkrosApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AkrosApiService> _logger;
        private readonly IConfiguration _configuration;

        public AkrosApiService(
            HttpClient httpClient,
            ILogger<AkrosApiService> logger,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Sends a payment request to the Akros API
        /// </summary>
        /// <param name="paymentData">Payment information to process</param>
        /// <returns>API response with transaction result</returns>
        public async Task<AkrosApiResponse> SendPaymentAsync(PaymentRequest paymentData)
        {
            try
            {
                _logger.LogInformation("Sending payment request to Akros API");

                var jsonContent = JsonSerializer.Serialize(paymentData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/api/payments", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<AkrosApiResponse>(responseContent);

                _logger.LogInformation("Payment request completed successfully");
                return apiResponse ?? new AkrosApiResponse { Success = false, Message = "Invalid response" };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error sending payment request to Akros API");
                return new AkrosApiResponse
                {
                    Success = false,
                    Message = $"HTTP Error: {ex.Message}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error processing payment request");
                return new AkrosApiResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Queries payment status from the Akros API
        /// </summary>
        /// <param name="transactionId">Transaction identifier</param>
        /// <returns>Payment status information</returns>
        public async Task<PaymentStatus> GetPaymentStatusAsync(string transactionId)
        {
            try
            {
                _logger.LogInformation("Querying payment status for transaction: {TransactionId}", transactionId);

                var response = await _httpClient.GetAsync($"/api/payments/{transactionId}/status");
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var paymentStatus = JsonSerializer.Deserialize<PaymentStatus>(responseContent);

                _logger.LogInformation("Payment status retrieved successfully");
                return paymentStatus ?? new PaymentStatus { Status = "Unknown" };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error retrieving payment status from Akros API");
                return new PaymentStatus
                {
                    Status = "Error",
                    Message = $"HTTP Error: {ex.Message}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving payment status");
                return new PaymentStatus
                {
                    Status = "Error",
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Validates connection to the Akros API
        /// </summary>
        /// <returns>True if connection is successful, false otherwise</returns>
        public async Task<bool> ValidateConnectionAsync()
        {
            try
            {
                _logger.LogInformation("Validating connection to Akros API");

                var response = await _httpClient.GetAsync("/api/health");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating connection to Akros API");
                return false;
            }
        }
    }

    #region DTOs

    /// <summary>
    /// Payment request data transfer object
    /// </summary>
    public class PaymentRequest
    {
        public string? TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public string? AccountNumber { get; set; }
        public string? CustomerName { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// Akros API response data transfer object
    /// </summary>
    public class AkrosApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? ReferenceNumber { get; set; }
    }

    /// <summary>
    /// Payment status data transfer object
    /// </summary>
    public class PaymentStatus
    {
        public string? Status { get; set; }
        public string? TransactionId { get; set; }
        public string? Message { get; set; }
        public DateTime? LastUpdated { get; set; }
    }

    #endregion
}
