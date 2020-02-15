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
  password: String
}, 
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;