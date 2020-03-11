const Transaction  = require('./models/transaction-model');

exports.operation = (code, amount, rate, userId, loanId) => {
    Transaction.create({
        code: code,
        amount: amount,
        rate: rate,
        userId: userId,
        loanId: loanId
    })
    .then(trans => {
        return trans._id;
    })
    .catch(err => {
        return err;
    })
}
