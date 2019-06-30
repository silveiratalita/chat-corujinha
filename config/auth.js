module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Você precisa estar logado para acessar essa página.');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard', {
      name: req.user.name
    });
  }
};
//isso é uma forma de proteger o dashboard para não entrar só usando url