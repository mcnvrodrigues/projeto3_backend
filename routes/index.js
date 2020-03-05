const express = require('express');
const router  = express.Router();
// require the user model
const User  = require('../models/user-model');
const Loan  = require('../models/loan-model');


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

router.post('/loanrequest', (req, res, next) => {
  const amount = req.body.amount;
  const installments = req.body.installments;
  const dueDate = req.body.dueDate;
  const rate = req.body.rate;
  const iof = req.body.iof;
  const cet = req.body.cet;
  const installmentAmount = req.body.installmentAmount;
  const total = req.body.total;
  const type = req.body.type;
  const cpf = req.body.cpf;
  const id = req.body.id;
  const name = req.body.name;

  console.log('cpf >>>', cpf);
  console.log('id >>>', id);

  Loan.create({
    amount: amount,
    installments: installments,
    dueDate: dueDate,
    rate: rate,
    iof: iof,
    cet: cet,
    installmentAmount: installmentAmount,
    total: total,
    type: type,
    cpf: cpf,
    status: 'Pending_Approval',
    category: 'A',
    claimant: id,
    claimantName: name
  })
  .then(loan => {
    User.updateOne({cpf}, {$push: {loans: loan._id}})
    .then((user) => {
      console.log('sucesso ao gravar loan ao usuario');
      res.status(200).json({user})
    })
    .catch((err) => {
      console.log('erro ao gravar loan ao usuario : ', err);
    })
  })
  .catch(err => {
    console.log('erro ao criar Loan : ', err);
  })


  console.log('Amount >>>', amount);
})

router.post('/requestedloans', (req, res, next) => {
    const id = req.body.id; 

    Loan.find({claimant: id, status: 'Pending_Approval', category: 'A'})
    .then(loans => {
      res.status(200).json({loans})
    })
    .catch(err => {
      console.log('Erro ao recuperar os emprestimos do usuário >> ', err);
    })
})

router.post('/singleRequestedloan', (req, res, next) => {
  const id = req.body.id; 

  Loan.findOne({_id: id})
  .then(loans => {
    res.status(200).json({loans})
  })
  .catch(err => {
    console.log('Erro ao recuperar os emprestimos (single) do usuário >> ', err);
  })
})

router.post('/availableloans', (req, res, next) => {
  const id = req.body.id;

  Loan.find({claimant: {$ne: id}, status: 'Pending_Approval'})
  .then(loans => {
    res.status(200).json({loans})
  })
  .catch(err => {
    console.log('Erro ao recuperar os emprestimos disponiveis >> ', err);
  })

})

module.exports = router;
