using System;
using System.IO;
using Xunit;
using GytCollectorRegionalApi.Services;

namespace GytCollectorRegionalApi.Tests
{
    public class LoggingServiceTests
    {
        [Fact]
        public void LoggingService_CanBeInstantiated()
        {
            // Arrange & Act
            var logger = new LoggingService(enableFileLogging: false, enableConsoleLogging: false);

            // Assert
            Assert.NotNull(logger);
        }

        [Fact]
        public void LoggingService_ImplementsInterface()
        {
            // Arrange & Act
            ILoggingService logger = new LoggingService(enableFileLogging: false, enableConsoleLogging: false);

            // Assert
            Assert.NotNull(logger);
            Assert.IsAssignableFrom<ILoggingService>(logger);
        }

        [Fact]
        public void LoggingService_LogsToFile()
        {
            // Arrange
            var tempLogFile = Path.Combine(Path.GetTempPath(), $"test-log-{Guid.NewGuid()}.log");
            var logger = new LoggingService(tempLogFile, enableFileLogging: true, enableConsoleLogging: false);

            try
            {
                // Act
                logger.LogInfo("Test message");

                // Assert
                Assert.True(File.Exists(tempLogFile), "Log file should be created");
                var logContent = File.ReadAllText(tempLogFile);
                Assert.Contains("[INFO] Test message", logContent);
            }
            finally
            {
                // Cleanup
                if (File.Exists(tempLogFile))
                {
                    File.Delete(tempLogFile);
                }
            }
        }

        [Fact]
        public void LoggingService_LogsException()
        {
            // Arrange
            var tempLogFile = Path.Combine(Path.GetTempPath(), $"test-log-{Guid.NewGuid()}.log");
            var logger = new LoggingService(tempLogFile, enableFileLogging: true, enableConsoleLogging: false);
            var exception = new InvalidOperationException("Test exception");

            try
            {
                // Act
                logger.LogError("Error occurred", exception);

                // Assert
                Assert.True(File.Exists(tempLogFile), "Log file should be created");
                var logContent = File.ReadAllText(tempLogFile);
                Assert.Contains("[ERROR] Error occurred", logContent);
                Assert.Contains("InvalidOperationException", logContent);
                Assert.Contains("Test exception", logContent);
            }
            finally
            {
                // Cleanup
                if (File.Exists(tempLogFile))
                {
                    File.Delete(tempLogFile);
                }
            }
        }

        [Fact]
        public void LoggingService_SupportsAllLogLevels()
        {
            // Arrange
            var tempLogFile = Path.Combine(Path.GetTempPath(), $"test-log-{Guid.NewGuid()}.log");
            var logger = new LoggingService(tempLogFile, enableFileLogging: true, enableConsoleLogging: false);

            try
            {
                // Act
                logger.LogInfo("Info message");
                logger.LogWarning("Warning message");
                logger.LogError("Error message");
                logger.LogDebug("Debug message");

                // Assert
                var logContent = File.ReadAllText(tempLogFile);
                Assert.Contains("[INFO] Info message", logContent);
                Assert.Contains("[WARNING] Warning message", logContent);
                Assert.Contains("[ERROR] Error message", logContent);
                Assert.Contains("[DEBUG] Debug message", logContent);
            }
            finally
            {
                // Cleanup
                if (File.Exists(tempLogFile))
                {
                    File.Delete(tempLogFile);
                }
            }
        }

        [Fact]
        public void LoggingService_IncludesTimestamp()
        {
            // Arrange
            var tempLogFile = Path.Combine(Path.GetTempPath(), $"test-log-{Guid.NewGuid()}.log");
            var logger = new LoggingService(tempLogFile, enableFileLogging: true, enableConsoleLogging: false);

            try
            {
                // Act
                logger.LogInfo("Test with timestamp");

                // Assert
                var logContent = File.ReadAllText(tempLogFile);
                // Check for timestamp pattern [YYYY-MM-DD HH:MM:SS.mmm]
                Assert.Matches(@"\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\]", logContent);
            }
            finally
            {
                // Cleanup
                if (File.Exists(tempLogFile))
                {
                    File.Delete(tempLogFile);
                }
            }
        }
    }
}
