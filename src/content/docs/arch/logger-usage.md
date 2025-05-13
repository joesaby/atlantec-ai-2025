---
title: "Logger Utility"
description: "Logger Utility documentation"
category: "arch"
---

This document describes how to use the logging utility in the Atlantec AI Garden Assistant application.

## Overview

The logger utility provides a consistent way to log messages throughout the application. It supports:

- Multiple log levels (debug, info, warn, error)
- Timestamps for all log entries
- File-based logging to the `/logs` directory
- Console logging (configurable)
- JSON/object logging
- Environment-based log level configuration
- Log file rotation

## Basic Usage

```javascript
import logger from '../utils/logger';

// Simple logging
logger.debug('Detailed debug information');
logger.info('Normal operation information');
logger.warn('Warning message');
logger.error('Error message');

// Log with additional metadata
logger.info('User action completed', { 
  userId: '123', 
  action: 'update-profile',
  timeElapsed: 250
});

// Log errors with stack traces
try {
  // Some operation that might fail
} catch (error) {
  logger.error('Operation failed', error);
}
```

## Log Levels

The logger uses the following log levels in order of increasing severity:

1. `DEBUG` - Detailed troubleshooting information
2. `INFO` - Normal operation information
3. `WARN` - Warning conditions
4. `ERROR` - Error conditions

In production, only INFO, WARN, and ERROR messages are logged by default. In development, all levels are logged.

## Log Files

Logs are written to the `/logs` directory in the project root:

- Main log file: `/logs/app.log`
- Rotated log files: `/logs/app-{timestamp}.log`

Log files are automatically rotated when they reach 5MB in size.

## Netlify Integration

The logs directory is accessible in Netlify deployments. However, since Netlify has an ephemeral filesystem, logs will not persist between deployments or function executions. For long-term log storage, consider integrating with an external logging service.

## Custom Configuration

You can create a logger instance with custom configuration:

```javascript
import { Logger } from '../utils/logger';

const customLogger = new Logger({
  logLevel: 0, // DEBUG level
  console: false, // Disable console logging
  logDir: '../../custom-logs', // Custom log directory
  logFile: 'component.log', // Custom log filename
  maxFileSize: 1024 * 1024 // 1MB max file size
});

export default customLogger;
```