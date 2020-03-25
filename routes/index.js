const express = require('express');
const router  = express.Router();
const uploadCloud = require('../configs/cloudinary.js');
// require the user model
const User  = require('../models/user-model');
const Loan  = require('../models/loan-model');
const Transaction = require('../models/transaction-model');
const Installment = require('../models/installment-model');
const install = require('../installments');
const trans = require('../transactions');
const Message = require('../models/message-model');

const pagarme = require('pagarme');

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
  const quotas = req.body.quotas;
  const imgPath = req.body.imgPath;

  const singleQuotaValue = amount / quotas;
  
  
  console.log('cpf >>>', cpf);
  console.log('id >>>', id);
  console.log('installments error value >>>', typeof installments);

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
    claimantName: name,
    quotas: quotas,
    singleQuotaValue: singleQuotaValue,
    claimantPhoto: imgPath
  })
  .then(loan => {
    //processo de criação de parcelas
    install.createInstallments(installments, installmentAmount, dueDate, iof, cet, loan._id);

    User.updateOne({cpf}, {$push: {loans: loan._id}})
    .then((user) => {
      // transação de request
      trans.operation('Request',loan.amount, loan.rate, loan.claimant, loan._id);
      
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

    Loan.find({claimant: id, category: 'A'})
    .then(loans => {
      res.status(200).json({loans})
    })
    .catch(err => {
      console.log('Erro ao recuperar os emprestimos do usuário >> ', err);
    })
})

router.post('/loansapproved', (req, res, next) => {
  const id = req.body.id; 

  Loan.find({claimant: id, status: 'approved', category: 'A'})
  .then(loans => {
    res.status(200).json({loans})
  })
  .catch(err => {
    console.log('Erro ao recuperar os emprestimos do usuário >> ', err);
  })
})

router.post('/myinvestments', (req, res, next) => {
  const id = req.body.id; 

  Loan.find({provider: id})
  .then(loans => {
    res.status(200).json({loans})
  })
  .catch(err => {
    console.log('Erro ao recuperar os investimentos do usuário >> ', err);
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

router.post('/provideloan', (req, res, next) => {
  const id = req.body.id;
  const provider = req.body.provider;
  var loan = null;

  console.log(`id: ${id} - provider: ${provider}`);

  console.log('loan 2 >>',loan);

  Loan.updateOne({_id: id}, { $set: {provider: provider, status: 'approved'}})
  .then(loan => {
    Loan.findOne({_id: id})
    .then(loan_p => {
      trans.operation('Investment',loan_p.amount, loan_p.rate, provider, id);
      res.status(200).json({loan});


      User.findOne({_id: provider})
      .then(user => {
        Message.create({
          info: 'O seu emprestimo foi aprovado por ' + user.nome + '. Verifique suas parcelas em Pagamento',
          status: 'Pending',
          receiver: loan_p.claimant,
          provider: user.nome
        })
        .then(msg => {
          console.log('Mensagem enviada com sucesso >>', msg.info)
        })
        .catch(err => {
          console.log('Mensagem não enviada!')
        })
      })
      .catch(err => {
        console.log('Erro ao encontrar usuario /provideloan')
      })
    })
    .catch(err => {
      console.log('Erro ao procurar por usuario /provideloan')
    })


    
  })
  .catch(err => {
    console.log('Erro ao recuperar os emprestimos disponiveis >> ', err);
  })



})

router.post('/uploadprofilephoto', uploadCloud.single('imageUrl'), (req, res, next) => {
  // const { title, description } = req.body;

  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }

  res.json({ secure_url: req.file.secure_url });
});

router.post('/profile', (req, res, next) => {
  const id = req.body.id;
  const state = req.body.state;
  const city = req.body.city;
  const imageUrl = req.body.imageUrl;

  User.updateOne({"confirmationCode": id}, { $set: {imgPath: imageUrl, state: state, city: city}})
  .then(user => {
    res.status(200).json({user});
    
  })
  .catch(error => {
    console.log(error);
  })
})

router.post('/statements', (req, res, next) => {
  const id = req.body.id; 

  Transaction.find({userId: id})
  .sort({createdAt: -1})
  .then(trans => {
    res.status(200).json({trans})
  })
  .catch(err => {
    console.log('Erro ao recuperar os emprestimos do usuário >> ', err);
  })
})

router.post('/installment', (req, res, next) => {
  const id = req.body.id; 

  Installment.find({loan: id})
  .sort({installmentNumber: 1})
  .then(install => {
    res.status(200).json({install})
  })
  .catch(err => {
    console.log('Erro ao recuperar os dados da parcela >> ', err);
  })
})

router.post('/singleinstallment', (req, res, next) => {
  const id = req.body.id; 

  Installment.findOne({_id: id})  
  .then(install => {
    res.status(200).json({install})
  })
  .catch(err => {
    console.log('Erro ao recuperar os dados da parcela >> ', err);
  })
})

router.post('/paymentconfirmation', (req, res, next) => {
  const id = req.body.id; 
  const amount_v = req.body.amount;
  const cardnumber = req.body.card_number.replace(/[^\d]+/g,'');
  const cardholdername = req.body.card_holder_name;
  const cardexpirationdate = req.body.card_expiration_date;
  const cardcvv = req.body.card_cvv;

  console.log('id >> ',  id);
  console.log('amount >>',  amount_v);
  console.log('card_number >>',  cardnumber);
  console.log('card_holder_name >>',  cardholdername);
  console.log('card_expiration_date >>',  cardexpirationdate);
  console.log('card_cvv >> ',  cardcvv);
  console.log('postback_url >> ', process.env.REACT_APP_GENERAL + 'postback')


  pagarme.client.connect({ api_key: process.env.PAGARMEKEY })
  .then(client => client.transactions.create({
    amount: Math.floor(amount_v),
    card_number: cardnumber,
    card_holder_name: cardholdername,
    card_expiration_date: cardexpirationdate,
    card_cvv: cardcvv
  }))
  .then(transactions => {
    // res.send(transactions)
    

    Installment.updateOne({_id: id}, {$set: {status: 'Paid'}})
    .then(install => {
      console.log('Parcela paga >> ', install)
    })
    .catch(err => console.log('erro ao atualizar pagamento da parcela >>', err))

    Installment.findOne({_id: id})
    .then(install => {
      Loan.findOne({_id: install.loan})
      .then(loan => {
        trans.operation('Payment',amount_v, loan.rate, loan.claimant, loan._id);
        User.updateOne({_id: loan.provider}, {$inc: {balance: amount_v}})
        .then(user => {
          console.log(user);
        })

        User.findOne({_id: loan.claimant})
        .then(user => {
          Message.create({
            info: 'Você acaba de receber um pagamento do emprestimo que você concedeu para ' + user.nome + '. ',
            status: 'Pending',
            receiver: loan.provider,
            provider: user.nome
          })
          .then(msg => {
            console.log('Mensagem enviada com sucesso >>', msg.info)
          })
          .catch(err => {
            console.log('Mensagem não enviada!')
          })
        })
        .catch(err => {
          console.log('Erro ao encontrar usuario /provideloan')
        })

      })
    })

    console.log(transactions)
  })
  .catch(error => {
    res.send(error);
    console.log('Erro ao pagar >>', error)
  });
  
})

router.post('/messagesreq', (req, res, next) => {
  const id = req.body.id; 

  Message.find({receiver: id, status:'Pending'})  
  .then(msg => {
    res.status(200).json({msg})
  })
  .catch(err => {
    console.log('Erro ao recuperar os dados da Mensagem >> ', err);
  })
})

router.post('/messagesres', (req, res, next) => {
  const id = req.body.id; 

  Message.updateOne({_id: id}, {$set: {status: 'Read'}})  
  .then(msg => {
    res.status(200).json({msg})
  })
  .catch(err => {
    console.log('Erro ao recuperar os dados da Mensagem >> ', err);
  })
})



module.exports = router;
