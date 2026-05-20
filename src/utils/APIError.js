class APIError extends Error {
  constructor(message, statusCode, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.name = 'APIError';
  }
}

export default APIError;
