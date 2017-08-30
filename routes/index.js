var express = require('express');
var router = express.Router();
var fs = require('fs');
var millisec = require('millisec');
var json2xls = require('json2xls');
var mongoose = require('mongoose');
var user_dataDB = require('../db/user_data');

var app = express();
router.use(json2xls.middleware);

/* GET home page. */
router.get('/', function(req, res) {
    user_dataDB.find().exec(find);
    function find(err, data) {
        if(err){
            console.log(err)
        } else if(data.length > 0) {
            user_dataDB.aggregate([
                {
                    '$match': {
                        "_id": data[0]._id
                    }
                }, {
                    '$unwind': '$data_origin'
                }, {
                    "$project": {
                        "y": {
                            "$year": "$data_origin.DateTime"
                        },
                        "m": {
                            "$month": "$data_origin.DateTime"
                        },
                        "d": {
                            "$dayOfMonth": "$data_origin.DateTime"
                        },
                        "name": "$data_origin.Name",
                        "date": "$data_origin.DateTime"
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "year": "$y",
                            "month": "$m",
                            "day": "$d"
                        },
                        "data": {
                            $push: {
                                "name": "$name",
                                "date": "$date"
                            }
                        }
                    }
                },{
                    '$unwind': '$data'
                },{
                    "$group": {
                        "_id": {
                            "date": "$_id",
                            "name": "$data.name"
                        },
                        "data": {
                            $push: {
                                "date": "$data.date"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                        "_id.day": 1
                    }
                }
            ], function (err, data) {
                if(err) {
                    console.log(err)
                } else {
                    var aMap = data.map(function (item) {
                      if(item.data.length == 1) {
                          var a = {};
                          a.date = item._id.date.year + '-' + item._id.date.month + '-' + item._id.date.day;
                          a.name = item._id.name;
                          a.duration = '-';
                          a.inTag = '-';
                          a.outTag = '-';
                          a.errorTag = new Date(item.data[0].date);
                          return a;
                      } else if(item.data.length == 2) {
                          var dateData = item.data[0].date.getUTCHours();
                          if(dateData < 8){
                              var oriDateData = new Date(item.data[0].date);
                              var nDateData = new Date(item.data[0].date.setUTCHours(8));
                              var newDateData = new Date(nDateData.setUTCMinutes(0));
                          } else {
                              var oriDateData = new Date(item.data[0].date);
                              var newDateData = item.data[0].date;
                          }
                          var a = {};
                          a._id = mongoose.Types.ObjectId();
                          a.date = item._id.date.year + '-' + item._id.date.month + '-' + item._id.date.day;
                          a.name = item._id.name;
                          a.duration = millisec(item.data[1].date - newDateData).format('hh : mm : ss');
                          // var tag = new Date(item.data[0].dateData);
                          a.inTag = oriDateData.toGMTString();
                          a.inTagUTC = item.data[0].date.getUTCHours();
                          a.outTag = item.data[1].date.toGMTString();
                          a.errorTag = '-';
                          return a;
                      } else if(item.data.length > 2) {
                          var b = item.data.map(function(item,i) {
                            var c = {};
                            return c[item] = item.date.toGMTString();
                          });
                          var a = {};
                          a._id = mongoose.Types.ObjectId();
                          a.date = item._id.date.year + '-' + item._id.date.month + '-' + item._id.date.day;
                          a.name = item._id.name;
                          a.duration = '-';
                          a.inTag = '-';
                          a.outTag = '-';
                          a.errorTag = b;
                          return a;
                      } else {
                          var a = {};
                          a._id = mongoose.Types.ObjectId();
                          a.date = 'error';
                          a.name = 'error';
                          a.duration = 'error';
                          a.inTag = 'error';
                          a.outTag = 'error';
                          a.errorTag = 'error';
                          // return a;
                      }
                    });
                    // res.json(aMap);
                    res.xls('data.xlsx', aMap);
                }
            })
        }
    }
});

module.exports = router;
