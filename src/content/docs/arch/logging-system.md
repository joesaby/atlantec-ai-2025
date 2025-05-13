---
title: "Logging System"
description: "Logging System documentation"
category: "arch"
---

This document describes the logging system implemented in the Garden Assistant application, which is especially useful for debugging issues in deployed environments like Netlify.

## Overview

The logging system provides:

1. File-based logging that works in both development and production
2. A secure API endpoint to view logs from deployed environments
3. A web-based log viewer for easy access to logs
4. Structured logging with different log levels
5. Log rotation to prevent excessive file sizes

## Configuration

### Environment Variables

Add the following to your `.env` file:

```
# Logging Configuration
LOGS_API_KEY=your_secure_random_string_here
```

The `LOGS_API_KEY` is used to authenticate requests to the logs API endpoint.

## Accessing Logs

### Local Development

During local development, logs are written to the `/logs` directory in the project root:

- Main log file: `/logs/app.log`
- Rotated log files: `/logs/app-{timestamp}.log`

### Production Deployment

In production (Netlify), access logs through the secure logs viewer at:

```
https://your-site-name.netlify.app/admin/logs?key=your_api_key
```

> **Note**: The logs endpoint is protected by the API key specified in your environment variables to prevent unauthorized access.

## Using the Logger

The logger is available as a module in `src/utils/logger.js`. Import it in your components or API routes:

```javascript
import logger from '../utils/logger';

// Different log levels
logger.debug('Detailed debugging information');
logger.info('Normal application flow information');
logger.warn('Warning conditions');
logger.error('Error conditions');

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

## Important Notes for Netlify Deployments

1. **Ephemeral Filesystem**: Netlify has an ephemeral filesystem, so logs won't persist indefinitely. The logs will be available until the next deployment or until Netlify recycles the environment.

2. **API Key Protection**: Always use a strong, random API key to protect your logs endpoint.

3. **Secret Protection**: The logger automatically redacts common sensitive patterns (like API keys) from the logs, but be careful not to log sensitive information explicitly.

4. **Function Execution Context**: The logs capture information from serverless function executions, which is particularly useful for debugging API issues.

## Netlify Environment Setup

Make sure to set the `LOGS_API_KEY` environment variable in your Netlify site settings:

1. Go to Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add a new variable with key `LOGS_API_KEY` and a secure random value
5. Save the settings

## Advanced Configuration

The logger can be configured by modifying the `DEFAULT_CONFIG` in `src/utils/logger.js`:

- `logLevel`: Sets the minimum level to log
- `logDir`: Directory for log files
- `logFile`: Name of the main log file
- `console`: Whether to also log to console
- `maxFileSize`: Size in bytes before log rotation (default: 5MB)