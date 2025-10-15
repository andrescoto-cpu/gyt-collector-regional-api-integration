using System;
using GytCollectorRegionalApi.Services;

namespace GytCollectorRegionalApi.Examples
{
    /// <summary>
    /// Example program demonstrating the LoggingService usage
    /// </summary>
    class Program
    {
        static void Main(string[] args)
        {
            // Initialize the logging service
            ILoggingService logger = new LoggingService();

            // Example usage of different log levels
            logger.LogInfo("Application started successfully");
            logger.LogDebug("Debug information: Initializing components");
            logger.LogWarning("This is a warning message");
            
            try
            {
                // Simulate an error scenario
                throw new InvalidOperationException("Example exception for demonstration");
            }
            catch (Exception ex)
            {
                logger.LogError("An error occurred during execution", ex);
            }

            logger.LogInfo("Application completed");
        }
    }
}
