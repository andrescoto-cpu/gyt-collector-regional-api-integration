using Microsoft.AspNetCore.Mvc;
using GytCollectorApi.Services;

namespace GytCollectorApi.Controllers
{
    /// <summary>
    /// Controller for handling payment operations with Akros API
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly AkrosApiService _akrosApiService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            AkrosApiService akrosApiService,
            ILogger<PaymentsController> logger)
        {
            _akrosApiService = akrosApiService;
            _logger = logger;
        }

        /// <summary>
        /// Process a new payment through the Akros API
        /// </summary>
        /// <param name="paymentRequest">Payment details</param>
        /// <returns>Payment processing result</returns>
        [HttpPost]
        public async Task<ActionResult<AkrosApiResponse>> ProcessPayment([FromBody] PaymentRequest paymentRequest)
        {
            _logger.LogInformation("Processing payment request");

            var response = await _akrosApiService.SendPaymentAsync(paymentRequest);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        /// <summary>
        /// Get the status of a payment transaction
        /// </summary>
        /// <param name="transactionId">Transaction identifier</param>
        /// <returns>Payment status information</returns>
        [HttpGet("{transactionId}/status")]
        public async Task<ActionResult<PaymentStatus>> GetPaymentStatus(string transactionId)
        {
            _logger.LogInformation("Getting payment status for transaction: {TransactionId}", transactionId);

            var status = await _akrosApiService.GetPaymentStatusAsync(transactionId);

            if (status.Status == "Error")
            {
                return BadRequest(status);
            }

            return Ok(status);
        }

        /// <summary>
        /// Health check endpoint to verify Akros API connectivity
        /// </summary>
        /// <returns>Connection status</returns>
        [HttpGet("health")]
        public async Task<ActionResult> HealthCheck()
        {
            _logger.LogInformation("Performing health check");

            var isConnected = await _akrosApiService.ValidateConnectionAsync();

            if (isConnected)
            {
                return Ok(new { Status = "Healthy", Message = "Connected to Akros API" });
            }

            return ServiceUnavailable(new { Status = "Unhealthy", Message = "Cannot connect to Akros API" });
        }

        private ActionResult ServiceUnavailable(object value)
        {
            return StatusCode(503, value);
        }
    }
}
