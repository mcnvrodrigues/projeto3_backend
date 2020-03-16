// routes/auth-routes.js

const express    = require('express');
const authRoutes = express.Router();
const nodemailer = require("nodemailer");
const passport   = require('passport');
const bcrypt     = require('bcryptjs');

// require the user model
const User       = require('../models/user-model');


const bcryptSalt = 10;

authRoutes.post('/signup', (req, res, next) => {

    const cpf_r = req.body.cpf;
    const email_r = req.body.email;
    const celular_r = req.body.celular;
    const nome_r = req.body.nome;    

    if(!cpf_r || !email_r || !celular_r || !nome_r){

      res.status(400).json({ message: 'Provide the information above' });
      
    }else{
      User.findOne({ "cpf": cpf_r }, (err, foundUser) => {
        
        if(err){

            res.status(500).json({message: "cpf check went bad."});   

        }else{

          if (foundUser) {

            res.status(400).json({ message: 'cpf taken. Choose another one.' });       

          }else{
          
            const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

            let token = '';

            for (let i = 0; i < 25; i++) {
                token += characters[Math.floor(Math.random() * characters.length)];
            }
  
            const aNewUser = new User({
                // username:username,
                // password: hashPass
                cpf:cpf_r,
                email:email_r,
                celular:celular_r,
                nome:nome_r,
                confirmationCode: token,
                status: 'Pending_Confirmation',
                password: '',
                balance: 0
            });
  
            aNewUser.save(err => {
              if (err) {
                  res.status(400).json({ message: 'Saving user to database went wrong.' });
                  
              }else{
                res.status(200).json(aNewUser);             
              }
              
              
            });

            // send email

            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.NODEMAILER,
                    pass: process.env.NODEMAILERPSW
                }
            });

            let message = 'Seja bem vindo, favor confirme o seu cadastro clicando';        

            transporter.sendMail({
                from: '"COMMONEY" <commoneycadastro@gmail.com>',
                to: email_r,
                subject: 'Confirmação de cadastro',
                text: message,
                html: `<b>${message} <a href="${process.env.EMAIL_RESPONSE}/${token}">aqui</a></b>`
            })
            .then(info => console.log('email enviado com sucesso :', info))
            .catch(error => console.log(error));
          }
        }         
      });
    } 
});

authRoutes.post('/auth', (req, res) => {
    let userToken = req.body.confirmationToken;
    
    console.log('userToken >> ', userToken);
  
    User.findOne({ "confirmationCode": userToken })
      .then(user => {
        if (user !== null) {
  
          User.updateOne(
            { "email": user.email },
            { $set: { "status": "Active" } }
          )
            .then(() => {
              console.log('E-mail confirmado, criar senha');
            //   res.render('auth/createPassword', {email: user.email, layout: false});
                res.status(200).json({user});
              return;
            })
            .catch((error) => {
              console.log("falha ao atualizar o perfil");
            })
  
        } else {
            res.status(400).json({ message: 'codigo de informação não encontrado' });
        //   res.render("auth/confirmation", { message: "Cadastro não realizado!" });
        }
      })
      .catch(error => {
        next(error)
      })
  
});

authRoutes.post('/password', (req, res) => {
  console.log('entrou');
  const email = req.body.email;
  const psswd = req.body.psswd;
  const confPsswd = req.body.confpsswd;
  const confirmation = req.body.confirmation;

  console.log(`email = ${email} - psswd = ${psswd} - confPsswd - ${confPsswd} - confirmationCode - ${confirmation}`)
  
  
  if(psswd === confPsswd) {
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(psswd, salt);
    User.updateOne(
      {"confirmationCode": confirmation},
      { $set: { "password": hashPass } }
      )
      .then((user) => {
        console.log('Senha criada');

        res.status(200).json({user})
        return;
      })
      .catch((error) => {
        res.status(500).json({ message: 'erro ao criar senha!' });
        console.log("falha ao criar a senha", {layout: false});
      })
  }
  else{
    res.status(500).json({message: 'senhas sao diferentes'});
  }
  
})


authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    
      if (err) {
          res.status(500).json({ message: 'Something went wrong authenticating user' });
          return;
      }
  
      if (!theUser) {
          // "failureDetails" contains the error messages
          // from our logic in "LocalStrategy" { message: '...' }.
          res.status(401).json(failureDetails);
          return;
      }

      // save user in session
      req.login(theUser, (err) => {
          if (err) {
              res.status(500).json({ message: 'Session save went bad.' });
              return;
          }

          // We are now logged in (that's why we can also send req.user)
          res.status(200).json(theUser);
      });
  })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});


authRoutes.get('/loggedin', (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});


module.exports = authRoutes;