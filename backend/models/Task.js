const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    desc: String,
    priority: String,
    status: { type: String, default: 'pending' },
    date: Date
});
module.exports = mongoose.model('Task', TaskSchema);
