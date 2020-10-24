const appErrorFormatter = function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: err.message, data: null });
};

export { appErrorFormatter };
