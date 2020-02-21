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
  // username: String,
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
  }
}, 
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;