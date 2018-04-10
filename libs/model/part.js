var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Part = new Schema({
    carId: { type: String, required: true },
    model: { type: String, required: true },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Part', Part);
