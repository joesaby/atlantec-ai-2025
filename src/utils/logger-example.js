/**
 * Example usage of the logger utility
 */

import logger from './logger';

// Basic logging examples
function demonstrateLogging() {
  // Log different levels
  logger.debug('Debug message for detailed troubleshooting');
  logger.info('Application started successfully');
  logger.warn('API rate limit approaching threshold', { limit: '80%', endpoint: '/api/data' });
  
  // Log errors with stack trace
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Failed to process request', { error, requestId: '12345' });
  }
  
  // Log objects/structured data
  const userData = {
    id: '123',
    action: 'login',
    timestamp: Date.now()
  };
  
  logger.info('User login', userData);
}

export default demonstrateLogging;