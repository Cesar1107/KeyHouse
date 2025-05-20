// src/middleware/csp.js
function csp(req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' http://localhost:4000/uploads/ data: https://maps.googleapis.com https://maps.gstatic.com; " +
    "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com; " +
    "frame-src 'self' https://www.google.com;"
  );
  next();
}

module.exports = csp;
