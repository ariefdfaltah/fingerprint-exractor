var express = require('express');
var router = express.Router();
var fs = require('fs');
var millisec = require('millisec');
var json2xls = require('json2xls');
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
                          var dateData = item.data[0].date.getHours();
                          if(dateData < 15){
                              var nDateData = new Date(item.data[0].date.setHours(15));
                              var newDateData = new Date(nDateData.setMinutes(0));
                          } else {
                              var newDateData = item.data[0].date
                          }
                          var a = {};
                          a.date = item._id.date.year + '-' + item._id.date.month + '-' + item._id.date.day;
                          a.name = item._id.name;
                          a.duration = millisec(item.data[1].date - newDateData).format('hh : mm : ss');
                          // var tag = new Date(item.data[0].dateData);
                          a.inTag = item.data[0].date;
                          a.inTagUTC = item.data[0].date.getUTCHours();
                          a.outTag = item.data[1].date;
                          a.errorTag = '-';
                          return a;
                      } else if(item.data.length > 2) {
                          var a = {};
                          a.date = item._id.date.year + '-' + item._id.date.month + '-' + item._id.date.day;
                          a.name = item._id.name;
                          a.duration = '-';
                          a.inTag = '-';
                          a.outTag = '-';
                          a.errorTag = item.data;
                          return a;
                      } else {
                          var a = {};
                          a.date = 'error';
                          a.name = 'error';
                          a.duration = 'error';
                          a.inTag = 'error';
                          a.outTag = 'error';
                          a.errorTag = 'error';
                          return a;
                      }
                    });
                    // res.xls('data.xlsx', aMap);
                    res.json(aMap)
                }
            })
        }
    }
});

module.exports = router;
