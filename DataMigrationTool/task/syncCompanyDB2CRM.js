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
    
    const dbConn                = require(path.join(__dirname, "utilTask/databaseListCompany")),
          crmAddCompanyBulk     = require(path.join(__dirname, "utilTask/crmAddCompanyBulk")),
          crmDeleteCompanyBulk  = require(path.join(__dirname, "utilTask/crmDeleteCompanyBulk")),
          crmUpdateCompanyBulk  = require(path.join(__dirname, "utilTask/crmUpdateCompanyBulk"));
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
    
    var modifyList = [];
    var insertList = [];
    var deleteList = [];
    
    function insertTask(resolve, reject) {
        console.info("%s : Insert. get data from DB start.".green, taskName);
        
        dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.insert)).then(function (record) {
            console.info("%s : Insert get data from DB done.".green, taskName);
            
            // Insert
            if (!record.rows || !(record.rows instanceof Array) || record.rows.length <= 0) {
                log.resolvedLogger.info(util.format("%s: %s, 0 rows found.", taskName, "insert"));
                resolve(util.format("%s: %s, 0 rows found.", taskName, "insert"));
                return;
            }
            
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
                console.info("crmAddCompanyBulk.addCompany: %s".green, JSON.stringify(res));
                console.info("%s : Insert. Insert data to CRM Done.".green, taskName);
                
                resolve("%s : Insert. Insert data to CRM Done.", taskName);
            }, function (res) {
                console.error("crmAddCompanyBulk.addCompany: %s".red, JSON.stringify(res));
                
                resolve("%s : Insert. Insert data to CRM Done with error.", taskName);
            });

        }, function (res) {
            console.error("%s : Insert. Insert data to CRM Done with error. : %s".red, taskName, JSON.stringify(res));
            
            resolve("%s : Insert. Insert data to CRM Done with error.", taskName);
        });
    };
    
    function updateTask(resolve, reject) {
        console.info("%s : Update. get data from DB start.".green, taskName);
        
        // update
        dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.update)).then(function (record) {
            console.info("%s : Update. get data from DB done.".green, taskName);
            
            if (record.rows && record.rows instanceof Array) {
                record.rows.forEach(function (item, index) {
                    modifyList.push(item);
                });
            }
            
            if (modifyList.length === 0) {
                log.resolvedLogger.info(util.format("%s: update, 0 rows found.", taskName));
                resolve(util.format("%s: update, 0 rows found.", taskName));
                return;
            }
            
            console.info("%s : Update. Update data to CRM start.".green, taskName);
            crmUpdateCompanyBulk.updateCompany(modifyList).then(function (res) {
                console.info("crmUpdateCompanyBulk.updateCompany: %s".green, JSON.stringify(res));
                console.info("%s : Update. Update data to CRM Done.".green, taskName);
                
                resolve("%s : Update. Update data to CRM Done.", taskName);
            }, function (res) {
                console.error("crmUpdateCompanyBulk.updateCompany: %s".red, JSON.stringify(res));
                
                resolve("%s : Update. Update data to CRM Done with error.", taskName);
            });

        }, function (res) {
            console.error("%s : Update. Update data to CRM Done with error. : %s".red, taskName, JSON.stringify(res));
            
            resolve("%s : Update. Update data to CRM Done with error.", taskName);
        });
    };
    
    function deleteTask(resolve, reject) {
        console.info("%s : Delete. get data from DB start.".green, taskName);
        
        // delete
        dbConn.query(config.sql.getCompanyFromDB.sql.replace(";", config.sql.getCompanyFromDB.delete)).then(function (record) {
            console.info("%s : Delete. get data from DB done.".green, taskName);
            
            if (record.rows && record.rows instanceof Array) {
                record.rows.forEach(function (item, index) {
                    deleteList.push(item);
                });
            }
            
            if (deleteList.length === 0) {
                log.resolvedLogger.info(util.format("%s: Delete, 0 rows found.", taskName));
                resolve(util.format("%s: Delete, 0 rows found.", taskName));
                return;
            }
            
            console.info("%s : Delete. Delete data to CRM start.".green, taskName);
            crmDeleteCompanyBulk.deleteCompany(deleteList).then(function (res) {
                console.info("crmDeleteCompanyBulk.deleteCompany: %s".green, JSON.stringify(res));
                console.info("%s : Update. Update data to CRM Done.".green, taskName);
                
                resolve("%s : Update. Update data to CRM Done.", taskName);
            }, function (res) {
                console.error("crmDeleteCompanyBulk.deleteCompany: %s".red, JSON.stringify(res));
                
                resolve("%s : Update. Update data to CRM Done with error.", taskName);
            });

        }, function (res) {
            console.error("%s : Update. Update data to CRM Done with error. : %s".red, taskName, JSON.stringify(res));
            
            resolve("%s : Update. Update data to CRM Done with error.", taskName);
        });
    };
    
    function task(resolve, reject) {
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        //new Promise(insertTask).then(updateTask).then(deleteTask).then(function (res) {
        //    console.error("Task: %s executed. : %s".green, taskName, JSON.stringify(res));
            
        //}, function (res) {
        //    console.error("Task: %s executed with error. : %s".red, taskName, JSON.stringify(res));
        //    reject(res);
        //});
        // ReSharper restore UndeclaredGlobalVariableUsing
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        new Promise(insertTask).then(function () {
            new Promise(updateTask).then(function () {
                new Promise(deleteTask).then(function (res) {
                    console.error("Task: %s executed. : %s".green, taskName, JSON.stringify(res));

                }, function (res) {
                    console.error("Task: %s executed with error. : %s".red, taskName, JSON.stringify(res));
                    reject(res);
                });
                // ReSharper restore UndeclaredGlobalVariableUsing
            });
        });
    };
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    // Dependcy: userList -> depTask/crmCompanyDesc -> this.task
    return new Promise(taskUtil.getDependencyPromiseResolver(global.crmUserList, path.join(__dirname, "userList"), taskName, 
            new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, path.join(__dirname, "depTask/crmCompanyDesc"), taskName, 
             new Promise(taskUtil.getDependencyPromiseResolver(global.crmCompanyList, path.join(__dirname, "crmCompanyPKList"), taskName, task))))));
    // ReSharper restore UndeclaredGlobalVariableUsing
    
}();
