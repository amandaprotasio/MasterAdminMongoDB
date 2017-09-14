const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
// const usuarios = require('./data/usuarios.json')

const app = express()

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//Middlewares
app.use(express.static('assets'))
app.use(bodyParser.urlencoded())
app.use(session({secret: 'mastertech backend'}))

// conectar ao bd
mongoose.connect('mongodb://localhost/masteradmin');

// Schema
const User = mongoose.model('User',
{ nome: String,
  acesso: String,
  email: String,
  senha: String}
)

app.get('/', (request, response) => {
  response.render('index');
})

app.get('/login', (request, response) => {
  response.render('login');
})


const validaUsuario = (request) => {

  User.findOne({"email": request.body.email,
                "senha": request.body.senha },
               'nome acesso email',
               (err, user) => {
                                if (err) {
                                  console.log(err);
                                }
                                else {
                                  return user
                                }
                              }
              )
}

app.post('/login', (request, response) => {
  if(request.body.email == '' || request.body.senha == '' ){
    response.status(400).render('login', {erro: 'Preencha todos campos!'});

    // }else if(request.body.email == 'master@tech' || request.body.senha == '123' ){
  }else if(request.body.email && request.body.senha) {

    let oUser = validaUsuario(request);
    if (oUser) {
      request.session.email = request.body.email
      request.session.oUser = oUser
      switch (oUser.acesso) {
        case 'admin':
        response.redirect('/admin')
        break;
        case 'aluno':
        response.redirect('/aluno')
        break;
      }
    }else{
      response.status(400).render('login', {erro: 'Email ou senha inválidos!'});
    }
  }else{
    response.status(400).render('login', {erro: 'Email ou senha inválidos!'});
  }
}
)

app.get('/cadastro', (request, response) => {
  response.render('cadastro')
})

app.post('/salvar', (req, res) => {
    let user = new User(req.body)
    user.acesso = 'aluno'
    user.save((err, userCriado) => {
      res.redirect('/aluno')
    })
})

app.get('/admin', (request, response) => {
  if (request.session.email) {
    console.log(request.session);
    response.render('admin', {usuarioLogado: request.session.oUser });
  }else {
    response.redirect('/login')
  }

})

app.get('/aluno', (request, response) => {
  if (request.session.email) {
    console.log(request.session);
    response.render('aluno', {usuarioLogado: request.session.oUser });
  }else {
    response.redirect('/login')
  }

})


app.listen(3000, () => {
  console.log('Servidor inicializado');
})
