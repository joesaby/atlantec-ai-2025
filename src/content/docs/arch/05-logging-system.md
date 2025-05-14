---
title: "Logging System"
description: "Comprehensive documentation of Bloom's logging infrastructure"
category: "arch"
---

# Logging System

This document describes the logging system implemented in Bloom, which provides comprehensive monitoring and debugging capabilities for both development and production environments.

## Logging System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Application    │────▶│  Logger Utility │────▶│  Storage        │
│  Components     │     │  (logger.js)    │     │  (Files/Console)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Log API        │────▶│  Web-based      │
                        │  Endpoints      │     │  Log Viewer     │
                        └─────────────────┘     └─────────────────┘
```

The logging system is designed to:
1. Capture detailed operational information across all application components
2. Work consistently in both development and production (Netlify) environments 
3. Provide secure access to logs through authenticated API endpoints
4. Implement appropriate log rotation and management
5. Support different log levels for varying degrees of detail

## Core Components

### 1. Logger Utility (`src/utils/logger.js`)

The central logging utility provides a consistent interface for all application components:

```javascript
// Logger class implementation
class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupLogDirectory();
  }
  
  debug(message, metadata) { this.log(0, message, metadata); }
  info(message, metadata) { this.log(1, message, metadata); }
  warn(message, metadata) { this.log(2, message, metadata); }
  error(message, metadata) { this.log(3, message, metadata); }
  
  log(level, message, metadata) {
    if (level < this.config.logLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVELS[level];
    const metadataStr = metadata ? JSON.stringify(metadata) : '';
    
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      ...metadata
    };
    
    // Write to log file
    this.writeToFile(logEntry);
    
    // Also log to console if enabled
    if (this.config.console) {
      console[levelName.toLowerCase()](
        `[${timestamp}] [${levelName}] ${message} ${metadataStr}`
      );
    }
  }
  
  // File writing, rotation, and management methods...
}

// Default configuration
const DEFAULT_CONFIG = {
  logLevel: process.env.NODE_ENV === 'production' ? 1 : 0, // INFO in prod, DEBUG in dev
  logDir: path.join(process.cwd(), 'logs'),
  logFile: 'app.log',
  console: process.env.NODE_ENV !== 'production',
  maxFileSize: 5 * 1024 * 1024 // 5MB
};

// Create and export the default instance
const logger = new Logger();
export default logger;
```

The logger supports multiple log levels:
- **DEBUG (0)**: Detailed troubleshooting information
- **INFO (1)**: Normal operation information
- **WARN (2)**: Warning conditions
- **ERROR (3)**: Error conditions

### 2. Unified Logger (`src/utils/unified-logger.js`)

An extended implementation that adds special handling for Netlify environments:

```javascript
import logger from './logger';
import path from 'path';
import fs from 'fs';

// Detect if we're running in Netlify
const isNetlify = process.env.NETLIFY === 'true';

// Setup Netlify-specific configurations
if (isNetlify) {
  // Configure netlify-specific paths and settings
  logger.config.logDir = path.join('/tmp', 'bloom-logs');
  logger.config.preserveLogs = true; // Special flag for Netlify environment
}

export default {
  debug: (message, metadata) => logger.debug(message, metadata),
  info: (message, metadata) => logger.info(message, metadata),
  warn: (message, metadata) => logger.warn(message, metadata),
  error: (message, metadata) => logger.error(message, metadata),
  
  // Netlify-specific methods
  getNetlifyLogs: async () => {
    if (!isNetlify) return [];
    // Implementation to retrieve logs from Netlify's ephemeral filesystem
  },
  
  // More Netlify-specific methods...
};
```

### 3. Log API Endpoints

The system includes secure API endpoints for accessing logs:

#### General Logs Endpoint (`src/pages/api/logs.js`)

```javascript
export default async function handler(req, res) {
  // Authenticate the request
  const apiKey = req.query.key;
  if (apiKey !== process.env.LOGS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const logs = await readLogFile();
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function readLogFile() {
  // Implementation to read and parse log files
}
```

#### Netlify-Specific Logs Endpoint (`src/pages/api/netlify-logs.js`)

```javascript
import { getNetlifyLogs } from '../../utils/unified-logger';

export default async function handler(req, res) {
  // Authenticate the request
  const apiKey = req.query.key;
  if (apiKey !== process.env.LOGS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const logs = await getNetlifyLogs();
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 4. Log Viewer UI

A web-based interface for viewing logs (`src/pages/admin/logs-dashboard.astro`):

```jsx
import { useEffect, useState } from 'react';

const LogsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Get API key from query parameter or local storage
        const urlParams = new URLSearchParams(window.location.search);
        const apiKey = urlParams.get('key');
        
        if (!apiKey) {
          throw new Error('API key is required');
        }
        
        const response = await fetch(`/api/logs?key=${apiKey}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.status}`);
        }
        
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);
  
  // Filtering and rendering logic...
  
  return (
    <div className="logs-dashboard">
      {/* UI implementation */}
    </div>
  );
};

export default LogsDashboard;
```

## Log Storage and Management

### Local Development

In development, logs are stored in the `/logs` directory:
- Main log file: `/logs/app.log`
- Rotated log files: `/logs/app-{timestamp}.log`

### Netlify Production

In Netlify, the system adapts to the ephemeral filesystem:
1. Logs are written to `/tmp/bloom-logs/app.log`
2. The log API endpoint retrieves logs from this location
3. Logs persist until the next deployment or until Netlify recycles the environment

### Log Rotation

The system implements log rotation to prevent excessive file sizes:
1. When a log file exceeds `maxFileSize` (default: 5MB)
2. The current log file is renamed with a timestamp
3. A new empty log file is created
4. The system maintains a limited number of historical log files

## Using the Logger

### Basic Usage

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

### Custom Logger Creation

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

## Security Considerations

### API Key Protection

The logs API endpoint is protected by an API key:
1. Store the API key in environment variables (`LOGS_API_KEY`)
2. Pass the key as a query parameter to authenticate requests
3. Use a strong, random string for the API key

### Sensitive Data Protection

The logger automatically redacts common sensitive patterns:
1. API keys and tokens
2. Password fields
3. Personal information
4. Credentials and secrets

```javascript
function redactSensitiveData(data) {
  if (typeof data !== 'string') return data;
  
  // Redact API keys
  data = data.replace(/(['"](api[_-]?key|api[_-]?token|access[_-]?token)['"]\s*:\s*['"])[^'"]+(['"])/gi, '$1[REDACTED]$3');
  
  // Redact passwords
  data = data.replace(/(['"](password|passwd|pwd)['"]\s*:\s*['"])[^'"]+(['"])/gi, '$1[REDACTED]$3');
  
  // Redact other sensitive patterns...
  
  return data;
}
```

## Accessing Logs in Production

### Direct Access Method

1. Navigate to the secure logs viewer at:
   ```
   https://irish-gardening.netlify.app/admin/logs?key=YOUR_API_KEY
   ```
2. Replace `YOUR_API_KEY` with the value from environment variables
3. The dashboard displays logs with filtering and search capabilities

### API Access Method

To programmatically access logs:

```javascript
// Fetch logs via API
const response = await fetch(
  `https://irish-gardening.netlify.app/api/logs?key=YOUR_API_KEY`
);
const logs = await response.json();
```

## Netlify Environment Setup

To configure the logging system in Netlify:

1. Go to Netlify dashboard
2. Select the Bloom site
3. Go to Site settings > Environment variables
4. Add a variable with key `LOGS_API_KEY` and a secure random value
5. Save the settings

## Advanced Configuration

### Environment-Based Configuration

The logger uses different defaults based on the environment:

```javascript
// Development: All log levels, console output enabled
if (process.env.NODE_ENV !== 'production') {
  logger.config.logLevel = 0; // DEBUG
  logger.config.console = true;
}

// Production: INFO and above, console output disabled
else {
  logger.config.logLevel = 1; // INFO
  logger.config.console = false;
}
```

### Custom Log Formatting

For specialized logging needs, the format can be customized:

```javascript
// Custom log entry formatter
function formatLogEntry(entry) {
  const { timestamp, level, message, ...metadata } = entry;
  return `${timestamp} [${level.padEnd(5)}] ${message} ${JSON.stringify(metadata)}`;
}
```

## Troubleshooting

### Common Issues

1. **Missing Logs in Netlify**: 
   - Logs in Netlify are stored in an ephemeral filesystem
   - They won't persist after a deployment or environment recycle
   - Use the logs API to retrieve current logs before they're lost

2. **Authentication Failures**:
   - Ensure the API key matches the one in environment variables
   - Check that the key is being passed correctly in the query parameter

3. **Log File Size Issues**:
   - Adjust `maxFileSize` in the logger configuration
   - Implement more aggressive log rotation if needed