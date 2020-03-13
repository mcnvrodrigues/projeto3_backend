const Installment  = require('./models/installment-model');
const Loan = require('./models/loan-model');

exports.createInstallments = (installments, installmentAmount, dueDate, iof, cet, loan_id) => {

    let date = new Date();
    date.setDate(dueDate);
    ;
    

    for(let i = 0; i < installments; i++){
        
            Installment.create({
                installmentNumber: i+1,
                installments: installments,
                installmentAmount: installmentAmount,
                date: date.setMonth(date.getMonth() + 1),
                iof: iof,
                cet: cet,
                status: 'Pending',
                loan: loan_id
            })
            .then(install => {
                
                Loan.updateOne({_id: loan_id}, {$push: {installmentsCodes: install._id}})
                .then(() => {
                    console.log('Sucesso ao inserir parcela ao emprestimo');
                })
                .catch(err => {
                    console.log('Erro ao inserir parcela ao emprestimo');
                })
               
            })
            .catch(err => {
                return err;
            })
        
    }

    
    
}
