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
    const config        = require("../module/configs"),
          taskUtil      = require("../module/utility/taskUtility"),
          commonUtil    = require("../module/utility/commonUtility"),
          log           = require('../module/logProvider');

    const taskName          = "syncCompanyDB2CRM";

    const dbConn            = require(path.join(__dirname, "utilTask/databaseListCompany")),
          crmAddCompanyBulk = require(path.join(__dirname, "utilTask/crmAddCompanyBulk"));
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
        
        var modifyList = [];
        var insertList = [];
        
        console.info("%s : Insert. get data from DB start.".green, taskName);

        dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.insert)).then(function (record) {
            console.info("%s : Insert get data from DB done.".green, taskName);            

            // Insert
            if (record.rows && record.rows instanceof Array && record.rows.length > 0) {
                
                record.rows.forEach(function (item, index) {
                    var comp = commonUtil.findFromArrayBy(global.crmCompanyList, item.id);
                    var compSameName = commonUtil.findFromArrayBy(global.crmCompanyList, item.accountName, "accountName");

                    if (comp) {
                        modifyList.push(item);
                    } else {
                        if (compSameName) {
                            modifyList.push(item);
                        } else {
                            insertList.push(item);
                        }
                    }
                });
                
                console.info("%s : Insert. Insert data to CRM start.".green, taskName);
                crmAddCompanyBulk.addCompany(insertList).then(function (res) {
                    console.info("%s : Insert. Insert data to CRM Done.".green, taskName);
                    console.info("crmAddCompanyBulk.addCompany: %s".green, JSON.stringify(res));

                    res.modifyList = modifyList;

                    return modifyList;
                }, function (res) {
                    console.error("crmAddCompanyBulk.addCompany: %s".red, JSON.stringify(res) );
                }).then(function (record) {
                    console.info("%s : Update. get data from DB start.".green, taskName);
                    console.info("crmAddCompanyBulk.addCompany: %s".green, JSON.stringify(record));
                    
                    dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.update)).then();
                    
                    // update
                    resolve(util.format("%s done.", taskName + ":update"));
                }, rejectFunc).then(function (record) {
            // delete
            // resolve(util.format("%s done.", taskName + ":delete"));
                }, rejectFunc);
            } else {
                log.resolvedLogger.info(util.format("%s: %s, rows: none.", taskName + ":insert"));
            }
            
        }, rejectFunc);
    }
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    // Dependcy: userList -> depTask/crmCompanyDesc -> this.task
    return new Promise(taskUtil.getDependencyPromiseResolver(global.crmUserList, path.join(__dirname, "userList"), taskName, 
            new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, path.join(__dirname, "depTask/crmCompanyDesc"), taskName, 
             new Promise(taskUtil.getDependencyPromiseResolver(global.crmCompanyList, path.join(__dirname, "crmCompanyPKList"), taskName, task))))));    
    // ReSharper restore UndeclaredGlobalVariableUsing
    
}();
