# Logging Service Documentation

## Overview
The LoggingService provides a simple and efficient logging mechanism for the GYT Collector Regional API Integration project. It supports logging to both console and file with different log levels and colored console output.

## Features
- **Multiple Log Levels**: Info, Warning, Error, and Debug
- **Dual Output**: Console and file logging
- **Colored Console Output**: Different colors for different log levels
- **Thread-Safe**: Uses locking mechanism for concurrent logging
- **Timestamp Support**: UTC timestamps in ISO format
- **Exception Logging**: Detailed exception information including stack traces
- **Configurable**: Enable/disable console or file logging independently

## Usage

### Basic Usage
```csharp
using GytCollectorRegionalApi.Services;

// Create a logging service instance with default settings
ILoggingService logger = new LoggingService();

// Log different levels of messages
logger.LogInfo("Application started");
logger.LogWarning("This is a warning");
logger.LogError("An error occurred");
logger.LogDebug("Debug information");
```

### Custom Configuration
```csharp
// Custom log file path
var logger = new LoggingService(
    logFilePath: "/var/logs/myapp.log",
    enableFileLogging: true,
    enableConsoleLogging: true
);
```

### Exception Logging
```csharp
try
{
    // Your code here
}
catch (Exception ex)
{
    logger.LogError("Operation failed", ex);
}
```

## Log Format
Each log entry follows this format:
```
[yyyy-MM-dd HH:mm:ss.fff] [LEVEL] Message
```

Example:
```
[2025-10-15 18:30:45.123] [INFO] Application started successfully
[2025-10-15 18:30:45.456] [ERROR] An error occurred
```

## Console Colors
- **INFO**: Green
- **WARNING**: Yellow
- **ERROR**: Red
- **DEBUG**: Cyan

## File Logging
By default, logs are written to `{BaseDirectory}/logs/application.log`. The directory is created automatically if it doesn't exist.

## Thread Safety
The LoggingService uses a lock object to ensure thread-safe logging operations, making it safe to use in multi-threaded applications.

## Interface
The service implements the `ILoggingService` interface, making it easy to mock for testing or swap implementations:

```csharp
public interface ILoggingService
{
    void LogInfo(string message);
    void LogWarning(string message);
    void LogError(string message);
    void LogError(string message, Exception exception);
    void LogDebug(string message);
}
```
