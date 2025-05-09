/**
 * Netlify-compatible logger utility for Atlantec AI Garden Application
 * 
 * This is a minimal logger that only logs to console, making it compatible with Netlify's
 * serverless environment which has an ephemeral filesystem.
 */

// Define log levels and their priorities
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class NetlifyLogger {
  constructor(config = {}) {
    this.config = {
      // Default log level based on environment
      logLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
      // Prefix for all log messages
      prefix: '[GARDEN-ASSISTANT]',
      ...config
    };
  }

  /**
   * Format the log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    
    if (meta instanceof Error) {
      metaStr = ` ${JSON.stringify({
        name: meta.name,
        message: meta.message,
        stack: meta.stack
      })}`;
    } else if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    
    return `${this.config.prefix} [${timestamp}] [${level}] ${message}${metaStr}`;
  }

  /**
   * Generic log method
   */
  log(level, message, meta = {}) {
    // Check if we should log this level
    if (LOG_LEVELS[level] < this.config.logLevel) {
      return;
    }

    // Format the log message
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Log to console based on level
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](formattedMessage);
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    // If meta contains an Error object, extract useful properties
    if (meta instanceof Error) {
      const error = meta;
      meta = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    this.log('ERROR', message, meta);
  }
}

// Create and export singleton instance
const logger = new NetlifyLogger();

export default logger;