using System;
using System.IO;

namespace GytCollectorRegionalApi.Services
{
    /// <summary>
    /// Implementation of logging service for the GYT Collector Regional API
    /// Provides logging to both console and file with timestamp support
    /// </summary>
    public class LoggingService : ILoggingService
    {
        private readonly string? _logFilePath;
        private readonly bool _enableFileLogging;
        private readonly bool _enableConsoleLogging;
        private readonly object _lockObject = new object();

        /// <summary>
        /// Initializes a new instance of the LoggingService class
        /// </summary>
        /// <param name="logFilePath">Path to the log file (optional)</param>
        /// <param name="enableFileLogging">Enable logging to file</param>
        /// <param name="enableConsoleLogging">Enable logging to console</param>
        public LoggingService(string? logFilePath = null, bool enableFileLogging = true, bool enableConsoleLogging = true)
        {
            _enableFileLogging = enableFileLogging;
            _enableConsoleLogging = enableConsoleLogging;

            if (_enableFileLogging)
            {
                _logFilePath = logFilePath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs", "application.log");
                
                // Ensure log directory exists
                var logDirectory = Path.GetDirectoryName(_logFilePath);
                if (!string.IsNullOrEmpty(logDirectory) && !Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }
            }
        }

        /// <summary>
        /// Logs an informational message
        /// </summary>
        /// <param name="message">The message to log</param>
        public void LogInfo(string message)
        {
            Log("INFO", message);
        }

        /// <summary>
        /// Logs a warning message
        /// </summary>
        /// <param name="message">The message to log</param>
        public void LogWarning(string message)
        {
            Log("WARNING", message);
        }

        /// <summary>
        /// Logs an error message
        /// </summary>
        /// <param name="message">The message to log</param>
        public void LogError(string message)
        {
            Log("ERROR", message);
        }

        /// <summary>
        /// Logs an error message with exception details
        /// </summary>
        /// <param name="message">The message to log</param>
        /// <param name="exception">The exception to log</param>
        public void LogError(string message, Exception exception)
        {
            var exceptionDetails = $"{message}\nException: {exception.GetType().Name}\nMessage: {exception.Message}\nStackTrace: {exception.StackTrace}";
            Log("ERROR", exceptionDetails);
        }

        /// <summary>
        /// Logs a debug message
        /// </summary>
        /// <param name="message">The message to log</param>
        public void LogDebug(string message)
        {
            Log("DEBUG", message);
        }

        /// <summary>
        /// Core logging method that writes to console and/or file
        /// </summary>
        /// <param name="level">Log level</param>
        /// <param name="message">The message to log</param>
        private void Log(string level, string message)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff");
            var logEntry = $"[{timestamp}] [{level}] {message}";

            lock (_lockObject)
            {
                // Log to console
                if (_enableConsoleLogging)
                {
                    switch (level)
                    {
                        case "ERROR":
                            Console.ForegroundColor = ConsoleColor.Red;
                            break;
                        case "WARNING":
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            break;
                        case "INFO":
                            Console.ForegroundColor = ConsoleColor.Green;
                            break;
                        case "DEBUG":
                            Console.ForegroundColor = ConsoleColor.Cyan;
                            break;
                    }
                    Console.WriteLine(logEntry);
                    Console.ResetColor();
                }

                // Log to file
                if (_enableFileLogging && !string.IsNullOrEmpty(_logFilePath))
                {
                    try
                    {
                        File.AppendAllText(_logFilePath, logEntry + Environment.NewLine);
                    }
                    catch (Exception ex)
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"Failed to write to log file: {ex.Message}");
                        Console.ResetColor();
                    }
                }
            }
        }
    }
}
