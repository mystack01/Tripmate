export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    status = 409;
    message = 'That value already exists';
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }
  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Something went wrong';
  }
  res.status(status).json({ message });
}
