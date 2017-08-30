var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var user_data = new Schema({
    origin: String,
    file_origin: String,
    file_excel: String,
    data_origin: [],
    created_at:  {type: Date, required: true}
});
module.exports = mongoose.model('user_data', user_data);