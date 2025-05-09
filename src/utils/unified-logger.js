/**
 * Unified Logger for Atlantec AI Garden Application
 * 
 * A single logger implementation that works in both development and production environments:
 * - In development: Uses file-based logging with console output
 * - In Netlify: Uses console-only logging (suitable for Netlify logs)
 * 
 * Features:
 * - Environment detection for appropriate logging method
 * - Multiple log levels (debug, info, warn, error)
 * - Timestamps for all log entries
 * - JSON/object logging support
 * - Automatic error object handling
 */

// Dynamic imports for Node.js environment only
const fs = import.meta.env?.SSR ? await import('fs') : null;
const path = import.meta.env?.SSR ? await import('path') : null;
const url = import.meta.env?.SSR ? await import('url') : null;

// Define log levels and their priorities
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Helper function to get root directory for logs (works in both development and production)
function getLogRootDir() {
  try {
    // Only run in Node.js environment
    if (import.meta.env?.SSR && url) {
      // Try using the ES modules approach with import.meta.url
      const __filename = url.fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      return path.resolve(__dirname, '../../logs');
    } else {
      // Browser environment or fallback
      return 'logs';
    }
  } catch (error) {
    console.error('Error resolving log directory:', error.message);

    // Fallback to cwd-based approach for serverless environments
    return import.meta.env?.SSR ? path.resolve(process.cwd(), 'logs') : 'logs';
  }
}

// Detect if running in Netlify environment
function isNetlifyEnvironment() {
  // Check for Netlify or production environment using both process.env and import.meta.env
  return !!(typeof process !== 'undefined' && process.env && (process.env.NETLIFY || process.env.NODE_ENV === 'production')) ||
         !!(import.meta.env && (import.meta.env.NETLIFY || import.meta.env.PROD));
}

// Default configuration
const DEFAULT_CONFIG = {
  // Default log level based on environment
  logLevel: (import.meta.env?.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'))
    ? LOG_LEVELS.INFO
    : LOG_LEVELS.DEBUG,
  // Base directory for log files (only used in development)
  logDir: getLogRootDir(),
  // Main log file (only used in development)
  logFile: 'app.log',
  // Whether to log to console (always true in Netlify)
  console: true,
  // Max log file size in bytes before rotation (5MB)
  maxFileSize: 5 * 1024 * 1024,
  // Prefix for all log messages in Netlify mode
  prefix: '[GARDEN-ASSISTANT]'
};

class UnifiedLogger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isNetlify = isNetlifyEnvironment();

    // Only setup file logging if not in Netlify environment and we have file system access
    if (!this.isNetlify && import.meta.env?.SSR && fs && path) {
      this.logFilePath = path.join(this.config.logDir, this.config.logFile);
      // Ensure log directory exists
      this.ensureLogDirectory();
    }

    // Determine current environment for startup message
    let environment = 'unknown';
    if (this.isNetlify) {
      environment = 'Netlify';
    } else if (import.meta.env?.SSR) {
      environment = 'server';
    } else {
      environment = 'browser';
    }

    // Initialize with an info message
    this.info(`Logger initialized in ${environment} mode`);
  }

  /**
   * Ensure the log directory exists (only for development mode)
   */
  ensureLogDirectory() {
    // Skip in Netlify environment or browser
    if (this.isNetlify || !import.meta.env?.SSR || !fs) return;

    const logDir = this.config.logDir;
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`Created log directory at: ${logDir}`);
      } catch (error) {
        console.error(`Failed to create log directory: ${error.message}`);
      }
    }
  }

  /**
   * Format the log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    
    if (meta instanceof Error) {
      metaStr = JSON.stringify({
        name: meta.name,
        message: meta.message,
        stack: meta.stack
      });
    } else if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta);
    }
    
    if (this.isNetlify) {
      // Netlify format with prefix
      return `${this.config.prefix} [${timestamp}] [${level}] ${message}${metaStr ? ' ' + metaStr : ''}`;
    } else {
      // File format
      return `[${timestamp}] [${level}] ${message}${metaStr ? ' ' + metaStr : ''}`;
    }
  }

  /**
   * Write a log entry to file (development mode only)
   */
  writeToFile(formattedMessage) {
    // Skip in Netlify environment, browser, or if fs is not available
    if (this.isNetlify || !import.meta.env?.SSR || !fs) return;

    try {
      // Check if file exists and if rotation is needed
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        if (stats.size >= this.config.maxFileSize) {
          this.rotateLogFile();
        }
      }

      // Append to log file with newline
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Rotate log file by renaming it with timestamp
   */
  rotateLogFile() {
    // Skip in Netlify environment, browser, or if fs is not available
    if (this.isNetlify || !import.meta.env?.SSR || !fs) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newPath = this.logFilePath.replace('.log', `-${timestamp}.log`);
      fs.renameSync(this.logFilePath, newPath);
    } catch (error) {
      console.error(`Failed to rotate log file: ${error.message}`);
    }
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

    // Write to file in development mode (with file system access)
    if (!this.isNetlify && import.meta.env?.SSR && fs) {
      this.writeToFile(formattedMessage);
    }

    // ALWAYS log to console regardless of environment
    // This ensures logs always appear in Netlify function logs
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
      meta = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack
      };
    }

    // Ensure meta is always an object
    if (typeof meta !== 'object' || meta === null) {
      meta = { value: meta };
    }

    this.log('ERROR', message, meta);
  }

  /**
   * Get all logs from the file (development mode only)
   * Returns the most recent log content
   */
  getLogContent(maxSize = 100 * 1024) {
    // In Netlify environment, browser, or if fs is not available
    if (this.isNetlify || !import.meta.env?.SSR || !fs) {
      return "Logs are not available in file form when running in Netlify environment or browser.";
    }

    try {
      if (!fs.existsSync(this.logFilePath)) {
        return "No logs available yet.";
      }

      const fileSize = fs.statSync(this.logFilePath).size;
      const readSize = Math.min(fileSize, maxSize);
      const position = Math.max(0, fileSize - readSize);

      return fs.readFileSync(
        this.logFilePath,
        { encoding: 'utf8', start: position, end: fileSize }
      );
    } catch (error) {
      console.error(`Failed to read log file: ${error.message}`);
      return `Error reading logs: ${error.message}`;
    }
  }

  /**
   * Get a list of all log files (development mode only)
   */
  getLogFiles() {
    // In Netlify environment, browser, or if fs is not available
    if (this.isNetlify || !import.meta.env?.SSR || !fs || !path) {
      return [];
    }

    try {
      if (!fs.existsSync(this.config.logDir)) {
        return [];
      }

      return fs.readdirSync(this.config.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: `/logs/${file}`,
          size: fs.statSync(path.join(this.config.logDir, file)).size,
          modified: fs.statSync(path.join(this.config.logDir, file)).mtime
        }))
        .sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error(`Failed to list log files: ${error.message}`);
      return [];
    }
  }
}

// Create and export singleton instance
const logger = new UnifiedLogger();

export default logger;