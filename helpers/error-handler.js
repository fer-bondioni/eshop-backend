function errorHandler(err, req, res, next) {
  //jwt authentication error
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ error: "The user is not authorized" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).send({ error: err.message });
  }
  //default to 500 server error
  return res.status(500).json(err);
}

module.exports = errorHandler;
