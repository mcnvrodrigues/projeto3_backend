const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const messageSchema = new Schema({
  info: String,  
  status:  {
    type: String,
    enum: ['Pending','Read'],
  },
  receiver: {type: Schema.Types.ObjectId, ref: 'User'},
  provider: String
}, 
{
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;