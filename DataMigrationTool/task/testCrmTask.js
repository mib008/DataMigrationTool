// ReSharper disable Es6Feature
const Q             = require('q'),
      util          = require('util'),
      path          = require("path"),
      colors        = require("colors"),
      querystring   = require('querystring'),
      url           = require('url'),
      https         = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    const config        = require("../module/configs").httpClient,
          taskUtil      = require("../module/utility/taskUtility"),
          commonUtil    = require("../module/utility/commonUtility"),
          log           = require('../module/logProvider');
    
    const taskName      = "testCrmTask";
    
    const dbConn        = require(path.join(__dirname, "utilTask/databaseListCompany")),
          crmBulk       = require(path.join(__dirname, "utilTask/crmBulk"));
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
    var insertList = [
        { accountName: "testCompany1", ownerId: "480603", dimDepart: "266930", createdBy: "", createdAt: "", updatedBy: "", updatedAt: "" },
        { accountName: "testCompany2", ownerId: "480603", dimDepart: "266930", createdBy: "", createdAt: "", updatedBy: "", updatedAt: "" }
    ];
    var deleteList = [];

    function doTestI(resolve, reject) {
        crmBulk.createBatch({ object: config.belongName.company, operation: "insert" }, insertList).then(function(res) {
            resolve(res);
        }, function(res) {
            reject(res);
        });
    };
    
    function task(resolve, reject) {
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        new Promise(doTestI).then(function (res) {
            console.info("Task: %s executed. : %s", taskName, JSON.stringify(res));
            resolve(res);
        }, function (res) {
            console.error("Task: %s executed with error. : %s - %s", taskName, res, JSON.stringify(res));
            reject(res);
        });
        // ReSharper restore UndeclaredGlobalVariableUsing
    }
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    // Dependcy: userList -> depTask/crmCompanyDesc -> this.task
    return new Promise(taskUtil.getDependencyPromiseResolver(global.crmUserList, path.join(__dirname, "userList"), taskName, 
            new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, path.join(__dirname, "depTask/crmCompanyDesc"), taskName, 
             new Promise(taskUtil.getDependencyPromiseResolver(global.crmCompanyList, path.join(__dirname, "crmCompanyPKList"), taskName, task))))));
    // ReSharper restore UndeclaredGlobalVariableUsing
    
}();
