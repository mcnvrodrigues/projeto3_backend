const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const installmentSchema = new Schema({
  installmentNumber: Number,
  installments: Number,
  installmentAmount: Number,
  date: Date,
  iof: Number,  
  cet: Number,
  status:  {
    type: String,
    enum: ['Pending','Paid'],
  },
  loan: {type: Schema.Types.ObjectId, ref: 'Loan'}  
}, 
{
  timestamps: true
});

const Installment = mongoose.model('Installment', installmentSchema);
module.exports = Installment;