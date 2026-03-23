function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Acces interdit : Vous devez être un administrateur" });
    }
    next();
  };
}

module.exports = authorize;