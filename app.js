const express = require('express')
const expressLayouts=require('express-ejs-layouts')
const mongoose=require('mongoose')
const flash=require('connect-flash')
const session=require('express-session')
const passport=require('passport')

const app= express() 

//configuração do passport
require('./config/passport')(passport)

//configurar  db
const db=require('./config/keys').MongoURI;
//conectar ao db
mongoose.connect(db,{ useNewUrlParser: true})
.then(()=>console.log('MongoDB Conectado! Você é quase uma Corujinha!!!... '))
.catch(err => console.log(err))



//render ejs
app.use(expressLayouts)
app.set('view engine', 'ejs')

//bodyparser
app.use(express.urlencoded({extended: false}))

//express session-copiado daqui https://www.npmjs.com/package/express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())//devido ao uso se serialize e local stratetegy do passport

//protocolo http definido
const server = require('http').createServer(app)

//protocolo wss
//protocolos configurados
const io = require('socket.io')(server)

//array de mensagens criado.
let messages = []

//conexão flash 
app.use(flash())

//Variaveis de escopo glogal-var
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  
//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

io.on('connection', socket => {
  console.log(`Corujinha conectada ao Socket :${socket.id}`)
  //escuta a mensagem 

  socket.emit('previousMessages', messages)
  //que é o meu array, que aparece quando abro uma nova
  //não temos banco de dados até o momento portanto, ele guarda as msgs anteriores

  socket.on('sendMessage', data => {
      //uso o sendmessage, que é o evento do front, e recebo os dados da msg que enviei lá do outro lá
     
      messages.push(data)
      // função que coloca dentro do array de menssagens declarado acima

      socket.broadcast.emit('receivedMessage', data)
      //faz um broadcast em sockets conectados
      
  })
})

const PORT= process.env.PORT || 3000;

server.listen(PORT, console.log(`Servidor Corujinha rodando na porta ${PORT}`))