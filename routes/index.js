const express= require('express')
const bcrypt = require('bcryptjs') //vai verificar lá embaixo quando bota a senha

const User = require('../models/User'); //onde configuei o par valor de usuário

const router=express.Router()
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth')

// página de boas vindas
router.get('/', (req, res) => res.render('welcome'))

//dashboard
router.get('/dashboard',ensureAuthenticated,(req, res)=> 
    res.render('dashboard',{
        user:req.user
    })
)
//chat
router.get('/chat',ensureAuthenticated,(req, res)=> 
    res.render('chat',{
        user:req.user
    })
)

//Edicao
// show
router.get('/show',ensureAuthenticated,(req, res)=> 
    res.render('show',{
        user:req.user
    })
)

// show
router.post('/show', (req, res) => {
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
    res.render('show', { //renderiza o formulario de registro chamado register
      errors,
      name,
      email,
      password,
      password2,
      user:req.user
    });
  } else { //validou com sucesso
    User.findOne({
      email: email
    }).then(user => {
      if (user) { //se usuario consta no registro
        
        //Remove e inclui para facilitar no hash da senha
        user.deleteOne({email: email}, function(err){})

        const newUser = new User({ //cria um novo obj
          name,
          email,
          password
        });

        //criptografia da senha usando Hashing performs documentanção do bcrypt consultada e copiada
        //https://www.npmjs.com/package/bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => { //possivel erro e hash
            if (err) throw err; //tratamento de erro
            newUser.password = hash; //password hashed
            newUser
              .save() //salva a senha e o usuario- mostra isso em messages com devidas validações
              .then(user => {
                req.logout();
                req.flash('success_msg', 'Conta alterada com sucesso. Logue novamente para continuar.');
                res.redirect('/users/login'); //botão do dashboard
              })
              .catch(err => console.log('Ops, ocorreu um erro aqui!', err)); //não deveria ser feito assim, o certo é usar um log.
          });
        });

      } else {
        console.log("Erro. Email não encontrado")
        errors.push({
          msg: 'ERRO: EMAIL NÃO ENCONTRADO'
        });
        res.render('show', {
          errors,
          name,
          email,
          password,
          password2,
          user:req.user
        });
      }
    });
  }
});


//delete

//  botão DELETAR
router.get('/delete', (req, res) => {
    res.render('delete', {
    user: req.user
  })
});


router.post('/delete', (req, res, next) => {
  const {
    name,
    email,
    password,
    password2
  } = req.body;

  User.findOne({
    email: email
  }).then(user => {
    if (user) { //se usuario consta no registro

      user.deleteOne({ email: email }, function (err) { })

      req.logout();
      req.flash('success_msg', 'Conta excluida.');
      res.redirect('/users/login'); //botão do dashboard
    } else {
      console.log("Erro. Email não encontrado")
      errors.push({
        msg: 'ERRO: EMAIL NÃO ENCONTRADO'
      });
      res.render('delete', {
        errors,
        name,
        email,
        password,
        password2,
        user: req.user
      });
    }
  });

});

module.exports = router