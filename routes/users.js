const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs') //vai verificar lá embaixo quando bota a senha
const passport = require('passport')
const mongoose = require('mongoose')
// Load User model
const User = require('../models/User'); //onde configuei o par valor de usuário
const {
  forwardAuthenticated
} = require('../config/auth');

// login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// registro
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const {
    name,
    email,
    password,
    password2
  } = req.body;
  let errors = [];
  //validações que a cada falha são agregadas em um array, que deveria funcionar como um log.
  if (!name || !email || !password || !password2) {
    errors.push({
      msg: 'POR FAVOR PREENCHA TODOS OS CAMPOS'
    });
  }

  if (password != password2) {
    errors.push({
      msg: 'AS SENHAS NÃO BATEM'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'A SENHA DEVE TER NO MÍNIMO 6 CARACTERES'
    });
  }

  if (errors.length > 0) {
    res.render('register', { //renderisa o formulario de registro chamado register
      errors,
      name,
      email,
      password,
      password2
    });
  } else { //validou com sucesso
    User.findOne({
      email: email
    }).then(user => { //email preenchido bate com o do bco?
      if (user) { //se usuario consta no registro
        errors.push({
          msg: 'Este e-mail já está cadastrado na nossa base!'
        }); //vai usar a msg
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else { //usuario não consta, deve se criar um
        const newUser = new User({ //cria um novo obj
          name,
          email,
          password
        });

        //criptografia da senha usando Hashing performs documentanção do bcrypty consultada e copiada
        //https://www.npmjs.com/package/bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => { //possivel erro e hash
            if (err) throw err; //tratamento de erro
            newUser.password = hash; //password hashed
            newUser
              .save() //salva a senha e o usuario- mostra isso em messages com devidas validações
              .then(user => {
                req.flash(
                  'success_msg',
                  'Agora você está registrado, use nosso chat a vontade e veja como é lindo ser uma corujinha!'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log('Ops, ocorreu um erro aqui!', err)); //não deveria ser feito assim, o certo é usar um log.
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard', //direcionamento
    failureRedirect: '/users/login', //falha no direcionamento para o dashboard
    failureFlash: true
  })(req, res, next);
});

//  botão sair
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Você se deslogou do chat corujinha!');
  res.redirect('/users/login'); //botão do dashboard
});







module.exports = router;