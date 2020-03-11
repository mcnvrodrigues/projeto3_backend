const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const loanSchema = new Schema({
  amount: Number,
  installments: Number,
  dueDate: Number,
  rate: Number,
  iof: Number,  
  cet: Number,
  installmentAmount: Number,
  total: Number,
  category: {
      type: String,
      enum:[
          'A',
          'B'
      ]
  },
  status:  {
    type: String,
    enum: ['Pending_Approval','approved'],
  },
  claimant: {type: Schema.Types.ObjectId, ref: 'User'},
  claimantName: String,
  provider: {type: Schema.Types.ObjectId, ref: 'User'},
  quotas: Number,
  singleQuotaValue: Number,
  claimantPhoto: { type: String, default: 'https://bulma.io/images/placeholders/96x96.png' },
  installments: [{type: Schema.Types.ObjectId, ref: 'Installment'}]
}, 
{
  timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;