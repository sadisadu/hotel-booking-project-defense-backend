const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  message: { type: String, required: true },

}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;  