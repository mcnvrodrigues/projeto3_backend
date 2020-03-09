const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  cpf: String,
  email: String,
  celular: String,
  nome: String,
  confirmationCode: String,
  status:  {
    type: String,
    enum: ['Pending_Confirmation','Active'],
  },
  password: String,
  education: {
    type: String,
    enum: [
            'Sem instrução', 
            'Ensino Fundamental 1', 
            'Ensino Fundamental 2', 
            'Ensino Médio', 
            'Ensino Superior',
            'Pós Graduação'
          ]
  },
  dependents: Number,
  loans: [{type: Schema.Types.ObjectId, ref: 'Loan'}],
  imgName: String,
  imgPath: { type: String, default: 'https://bulma.io/images/placeholders/96x96.png' },
  state: String,
  city: String
}, 
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;