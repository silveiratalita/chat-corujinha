const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// pega infos de User no model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // verifica se usuario ja existe
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Email Não registrado' });
        }

        // verifica se a senha bate
        bcrypt.compare(password, user.password, (err, isMatch) => {//ou bate ou não bate usando compare do bcript
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Senha incorreta' });
          }
        });
      });
    })
  );

  //função copiada da documentação passportjd.org/docs/authenticate- codigo que promete  guardar os codigos da sessão quando 
  //o done vem de retorno, ou seja, quando tudo bate, 
  //sendo assim serialized deve guardar as coisas q validamos pq ele associa os dados a sessão
  //deserializer é a chave que validamos para retornar o done.
  //assim deveria funcionar

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};