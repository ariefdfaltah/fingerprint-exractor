var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var groupArray = require('group-array');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/fingerprint-extractor');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var user_dataDB = require('./db/user_data');

// export to mongodb
// var fp = path.join(__dirname, '001_Glog.txt');
// fs.readFile(fp, function(err, f){
//     var array = f.toString().split('\n');
//     var proceedArr = [];
//     var proceedArrBundle = [];
//     array.forEach(function (data) {
//         var  a = data.split('\r\n');
//         var b = a.toString().replace(/\t/g, '-');
//         var c = b.toString().replace(/--/g, '-');
//         var d = c.toString().replace(/ /g, '');
//         d = d.slice(0, -1);
//         var e = d.split('-');
//         if(e.length > 7) {
//             e.splice(-1,1);
//             proceedArr.push(e)
//         } else if (e.length == 7) {
//             var dataObj = {};
//             var date = e[6].substring(0,10);
//             var dateArr = date.split('/');
//             var dateY = dateArr[0];
//             var dateM = dateArr[1];
//             var dateD = dateArr[2];
//             var hour = e[6].substring(10,18);
//             e[6] = new Date(dateY + '-' + dateM + '-' + dateD + 'T' + hour + 'Z');
//             dataObj['_id'] = mongoose.Types.ObjectId();
//             dataObj[proceedArr[0][0]] = e[0];
//             dataObj[proceedArr[0][1]] = e[1];
//             dataObj[proceedArr[0][2]] = e[2];
//             dataObj[proceedArr[0][3]] = e[3];
//             dataObj[proceedArr[0][4]] = e[4];
//             dataObj[proceedArr[0][5]] = e[5];
//             dataObj[proceedArr[0][6]] = e[6];
//             proceedArrBundle.push(dataObj)
//         }
//     });
//     var user_dataDBModel = new user_dataDB();
//     user_dataDBModel.origin = 'sini aja';
//     user_dataDBModel.file_origin = 'sini aja';
//     user_dataDBModel.file_excel = 'sini aja';
//     user_dataDBModel.data_origin = proceedArrBundle;
//     user_dataDBModel.created_at = new Date();
//     user_dataDBModel.save(add);
//     function add(err) {
//         if(err) {
//           console.log(err)
//         }
//         console.log('success')
//     }
// });
// end export

// user_dataDB.find().exec(find);
// function find(err, data) {
//     if(err){
//         console.log(err)
//     } else if(data.length > 0) {
//         user_dataDB.aggregate([
//             {
//                 '$match': {
//                     "_id": data[0]._id
//                 }
//             }, {
//                 '$unwind': '$data_origin'
//             }, {
//                 "$project": {
//                     "y": {
//                         "$year": "$data_origin.DateTime"
//                     },
//                     "m": {
//                         "$month": "$data_origin.DateTime"
//                     },
//                     "d": {
//                         "$dayOfMonth": "$data_origin.DateTime"
//                     },
//                     "name": "$data_origin.Name",
//                     "date": "$data_origin.DateTime"
//                 }
//             },
//             {
//                 "$group": {
//                     "_id": {
//                         "year": "$y",
//                         "month": "$m",
//                         "day": "$d"
//                     },
//                     "data": {
//                         $push: {
//                             "name": "$name",
//                             "date": "$date"
//                         }
//                     }
//                 }
//             },{
//                 "$project": {
//                     data: 1
//
//                 }
//             },
//             {
//                 $sort: {
//                     "_id.year": 1,
//                     "_id.month": 1,
//                     "_id.day": 1
//                 }
//             }
//         ], function (err, data) {
//             if(err) {
//                 console.log(err)
//             } else {
//                 var dataName = groupArray(data[0].data, 'name');
//                 var dataNameArr = Object.keys(dataName).map(function (key) { return dataName[key]; });
//                 console.log(dataNameArr);
//
//             }
//         })
//     }
// }


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

var xx = [{name: 'epul'}]
