const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const transactionSchema = new Schema({ 
  code: {
      type: String,
      enum:[
          'Request',
          'Investment',
          'Deposit',
          'Withdrawal',
          'Transfer',
          'Payment'
      ]
  },
  amount: Number,
  rate: Number,
  userId : {type: Schema.Types.ObjectId, ref: 'User'},
  loanId : {type: Schema.Types.ObjectId, ref: 'Loan'}
}, 
{
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;