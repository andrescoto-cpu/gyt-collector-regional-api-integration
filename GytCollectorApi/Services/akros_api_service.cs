using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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
        [JsonPropertyName("transactionId")]
        public string? TransactionId { get; set; }
        
        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }
        
        [JsonPropertyName("currency")]
        public string? Currency { get; set; }
        
        [JsonPropertyName("accountNumber")]
        public string? AccountNumber { get; set; }
        
        [JsonPropertyName("customerName")]
        public string? CustomerName { get; set; }
        
        [JsonPropertyName("transactionDate")]
        public DateTime TransactionDate { get; set; }
        
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    /// <summary>
    /// Akros API response data transfer object
    /// </summary>
    public class AkrosApiResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("message")]
        public string? Message { get; set; }
        
        [JsonPropertyName("transactionId")]
        public string? TransactionId { get; set; }
        
        [JsonPropertyName("processedDate")]
        public DateTime? ProcessedDate { get; set; }
        
        [JsonPropertyName("referenceNumber")]
        public string? ReferenceNumber { get; set; }
    }

    /// <summary>
    /// Payment status data transfer object
    /// </summary>
    public class PaymentStatus
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }
        
        [JsonPropertyName("transactionId")]
        public string? TransactionId { get; set; }
        
        [JsonPropertyName("message")]
        public string? Message { get; set; }
        
        [JsonPropertyName("lastUpdated")]
        public DateTime? LastUpdated { get; set; }
    }

    #endregion
}
