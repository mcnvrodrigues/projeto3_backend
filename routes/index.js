const express = require('express');
const router  = express.Router();
// require the user model
const User       = require('../models/user-model');


router.post('/education', (req, res, next) => {
  const confirmation = req.body.confirmationCode;
  const degree = req.body.degree;

  console.log('ConfirmationCode >>>', confirmation);
  console.log('Grau de instrução >>>', degree);

  User.updateOne({"confirmationCode": confirmation},
  {$set: {"education": degree}})
  .then((user) => {
    // console.log('Senha criada');
    // res.render("auth/account-created");
    res.status(200).json({user})
    return;
  })
  .catch((error) => {
    res.status(500).json({ message: 'erro ao criar senha!' });
    // console.log("falha ao criar a senha", {layout: false});
  });  
});


router.post('/dependents', (req, res, next) => {
  const confirmation = req.body.confirmationCode;
  const dependents = req.body.dependents;

  console.log('ConfirmationCode >>>', confirmation);
  console.log('Dependentes >>>', dependents);

  User.updateOne({"confirmationCode": confirmation},
  {$set: {"dependents": dependents}})
  .then((user) => {
    // console.log('Senha criada');
    // res.render("auth/account-created");
    res.status(200).json({user})
    return;
  })
  .catch((error) => {
    res.status(500).json({ message: 'erro ao criar senha!' });
    // console.log("falha ao criar a senha", {layout: false});
  });  
});

module.exports = router;
