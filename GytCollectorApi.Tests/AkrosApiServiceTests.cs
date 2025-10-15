using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using GytCollectorApi.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace GytCollectorApi.Tests
{
    public class AkrosApiServiceTests
    {
        private readonly Mock<ILogger<AkrosApiService>> _mockLogger;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public AkrosApiServiceTests()
        {
            _mockLogger = new Mock<ILogger<AkrosApiService>>();
            _mockConfiguration = new Mock<IConfiguration>();
        }

        [Fact]
        public async Task SendPaymentAsync_WhenSuccessful_ReturnsSuccessResponse()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(@"{
                        ""success"": true,
                        ""message"": ""Payment processed successfully"",
                        ""transactionId"": ""TXN123456"",
                        ""processedDate"": ""2025-10-15T12:00:00"",
                        ""referenceNumber"": ""REF123""
                    }")
                });

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            var paymentRequest = new PaymentRequest
            {
                TransactionId = "TXN123456",
                Amount = 100.50m,
                Currency = "GTQ",
                AccountNumber = "1234567890",
                CustomerName = "Juan Pérez",
                TransactionDate = DateTime.Now,
                Description = "Test payment"
            };

            // Act
            var result = await service.SendPaymentAsync(paymentRequest);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal("Payment processed successfully", result.Message);
            Assert.Equal("TXN123456", result.TransactionId);
        }

        [Fact]
        public async Task SendPaymentAsync_WhenHttpError_ReturnsFailureResponse()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Connection failed"));

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            var paymentRequest = new PaymentRequest
            {
                TransactionId = "TXN123456",
                Amount = 100.50m,
                Currency = "GTQ"
            };

            // Act
            var result = await service.SendPaymentAsync(paymentRequest);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.Success);
            Assert.Contains("HTTP Error", result.Message);
        }

        [Fact]
        public async Task GetPaymentStatusAsync_WhenSuccessful_ReturnsStatus()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(@"{
                        ""status"": ""Completed"",
                        ""transactionId"": ""TXN123456"",
                        ""message"": ""Payment completed successfully"",
                        ""lastUpdated"": ""2025-10-15T12:00:00""
                    }")
                });

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            // Act
            var result = await service.GetPaymentStatusAsync("TXN123456");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Completed", result.Status);
            Assert.Equal("TXN123456", result.TransactionId);
        }

        [Fact]
        public async Task GetPaymentStatusAsync_WhenHttpError_ReturnsErrorStatus()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Connection failed"));

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            // Act
            var result = await service.GetPaymentStatusAsync("TXN123456");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Error", result.Status);
            Assert.Contains("HTTP Error", result.Message);
        }

        [Fact]
        public async Task ValidateConnectionAsync_WhenHealthy_ReturnsTrue()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK
                });

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            // Act
            var result = await service.ValidateConnectionAsync();

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ValidateConnectionAsync_WhenUnhealthy_ReturnsFalse()
        {
            // Arrange
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Connection failed"));

            var httpClient = new HttpClient(mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("http://test.com")
            };

            var service = new AkrosApiService(httpClient, _mockLogger.Object, _mockConfiguration.Object);

            // Act
            var result = await service.ValidateConnectionAsync();

            // Assert
            Assert.False(result);
        }
    }
}
