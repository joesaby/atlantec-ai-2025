/**
 * Logger utility for Atlantec AI Garden Application
 * 
 * Provides structured logging capabilities for the application, with:
 * - File-based logging to a Netlify-accessible location
 * - Multiple log levels (debug, info, warn, error)
 * - Timestamps for all log entries
 * - JSON/object logging support
 * - Environment-based log level configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules (replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Try using the ES modules approach with import.meta.url
    return path.resolve(__dirname, '../../logs');
  } catch (error) {
    console.error('Error resolving log directory with ES modules approach:', error.message);
    
    // Fallback to cwd-based approach for serverless environments
    return path.resolve(process.cwd(), 'logs');
  }
}

// Default configuration
const DEFAULT_CONFIG = {
  // Default log level based on environment
  logLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  // Base directory for log files
  logDir: getLogRootDir(),
  // Main log file
  logFile: 'app.log',
  // Whether to also log to console
  console: true,
  // Max log file size in bytes before rotation (5MB)
  maxFileSize: 5 * 1024 * 1024
};

class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // The logDir is now already a full path from getLogRootDir()
    this.logFilePath = path.join(this.config.logDir, this.config.logFile);
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure the log directory exists
   */
  ensureLogDirectory() {
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
    const metaData = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    
    return `[${timestamp}] [${level}] ${message} ${metaData}`.trim() + '\n';
  }

  /**
   * Write a log entry to file
   */
  writeToFile(formattedMessage) {
    try {
      // Check if file exists and if rotation is needed
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        if (stats.size >= this.config.maxFileSize) {
          this.rotateLogFile();
        }
      }
      
      // Append to log file
      fs.appendFileSync(this.logFilePath, formattedMessage);
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Rotate log file by renaming it with timestamp
   */
  rotateLogFile() {
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
    
    // Write to file
    this.writeToFile(formattedMessage);
    
    // Also log to console if enabled
    if (this.config.console) {
      const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
      console[consoleMethod](formattedMessage.trim());
    }
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
    this.log('ERROR', message, meta);
  }
}

// Create and export singleton instance
const logger = new Logger();

export default logger;