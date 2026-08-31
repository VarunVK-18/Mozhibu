const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not change state and don't need CSRF protection
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // For POST, PUT, DELETE, PATCH we require a custom header.
  // Standard cross-site HTML forms cannot send custom headers.
  // By requiring this, we ensure the request was made via your Frontend's HttpClient (AJAX/Fetch)
  const requestedWith = req.headers["x-requested-with"];
  
  if (!requestedWith || requestedWith !== "XMLHttpRequest") {
    console.error(`[CSRF Blocked] Method: ${req.method}, Path: ${req.originalUrl}, IP: ${req.ip}`);
    return res.status(403).json({ 
      msg: "Forbidden: Missing or invalid CSRF header. Please include 'X-Requested-With: XMLHttpRequest' in your request headers." 
    });
  }

  next();
};

module.exports = csrfProtection;
