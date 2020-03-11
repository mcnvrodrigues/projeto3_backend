const Installment  = require('./models/installment-model');

exports.createInstallments = (installments, installmentAmount, dueDate, iof, cet, loan_id) => {

    let date = new Date();
    let install_id = [];

    for(let i = 0; i < installments; i++){
        install_id.push(
            Installment.create({
                installmentNumber: i+1,
                installments: installments,
                installmentAmount: installmentAmount,
                date: userId,
                cet: loanId,
                status: 'Pending',
                loan: loan_id
            })
            .then(trans => {
                return trans._id;
            })
            .catch(err => {
                return err;
            })
        )
    }
    
}
