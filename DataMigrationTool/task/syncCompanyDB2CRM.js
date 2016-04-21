// ReSharper disable Es6Feature
const Q             = require('q'),
      util          = require('util'),
      path          = require("path"),
      querystring   = require('querystring'),
      url           = require('url'),
      https         = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    const config    = require("../module/configs"),
          taskUtil  = require("../module/utility/taskUtility"),
          log       = require('../module/logProvider');

    const taskName          = "syncCompanyDB2CRM";

    const dbConn            = require(path.join(__dirname, "utilTask/databaseListCompany")),
          userList          = require(path.join(__dirname, "userList")),
          addCompany        = require(path.join(__dirname, "utilTask/crmAddCompany"));
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    //var testUser1 = {
    //    accountName: "testCompany2",
    //    ownerId: "480603",
    //    dimDepart: "266930",
    //    createdBy: "",
    //    createdAt: "",
    //    updatedBy: "",
    //    updatedAt: ""
    //};
    
    function task(resolve, reject) {
     
        var rejectFunc = function (res) {
            reject(res);
        };

     


        dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.insert)).then(function (record) {
            // Insert

            if (record.rows && record.rows instanceof Array && record.rows.length > 0) {

                addCompany.addCompany(record.rows).then(function(recordRst) {
                    log.resolvedLogger.info(util.format("%s: %s, rows: %d, succeed: %d", taskName + ":insert", record.rows.length));

                    resolve(util.format("%s done.", taskName + ":insert"));
                }, function(recordRst) {
                    log.resolvedLogger.info(util.format("%s: %s, rows: %d", taskName + ":insert", record.rows.length));

                    resolve(util.format("%s done.", taskName + ":insert"));
                });

               
            } else {

                log.resolvedLogger.info(util.format("%s: %s, rows: none.", taskName + ":insert"));
            }

            // console.info("record.rows: %s, record.fields: %s", record.rows.length, JSON.stringify(record.fields));
            
        }, rejectFunc).then(function(record) {
            // update
            // resolve(util.format("%s done.", taskName + ":update"));
        }, rejectFunc).then(function(record) {
            // delete
            // resolve(util.format("%s done.", taskName + ":delete"));
        }, rejectFunc);
    }
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    // Dependcy: userList -> depTask/crmCompanyDesc -> this.task
    return new Promise(taskUtil.getDependencyPromiseResolver(global.crmUserList, path.join(__dirname, "userList"), taskName, new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, path.join(__dirname, "depTask/crmCompanyDesc"), taskName, task))));    
    // ReSharper restore UndeclaredGlobalVariableUsing
    
}();
