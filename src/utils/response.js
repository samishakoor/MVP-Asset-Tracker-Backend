export function success(message) {
  return {
    success: true,
    message,
  };
}

export function successWithData(data, message) {
  const body = {
    success: true,
    data,
  };
  if (message) {
    body.message = message;
  }
  return body;
}
