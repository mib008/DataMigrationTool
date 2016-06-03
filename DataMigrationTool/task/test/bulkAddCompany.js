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
    const config        = require("../../module/configs"),
          taskUtil      = require("../../module/utility/taskUtility"),
          commonUtil    = require("../../module/utility/commonUtility"),
          log           = require('../../module/logProvider');
    
    const taskName          = "test/bulkAddCompany",
          dependencyTask    = path.join(__dirname, "../crmUserList");
    
    const dbConn                = require(path.join(__dirname, "../utilTask/databaseListCompany")),
          crmAddCompanyBulk     = require(path.join(__dirname, "../utilTask/crmAddCompanyBulk")),
          crmDeleteCompanyBulk  = require(path.join(__dirname, "../utilTask/crmDeleteCompanyBulk")),
          crmUpdateCompanyBulk  = require(path.join(__dirname, "../utilTask/crmUpdateCompanyBulk"));
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var testCompany = function () {
        return {
            // accountName: "testCompany2",
            ownerId: "480603",
            dimDepart: "266930",
            createdBy: "",
            createdAt: "",
            updatedBy: "",
            updatedAt: ""
        };
    };
    
    var dataList = function () {
        var list = [];
        
        for (var i = 0; i < 5; i++) {

            var temp = testCompany();
            temp.accountName = '测试客户-名称A' + i;
            
            // list.push(Object.create(testCompany, { accountName: 'testCompany' + i }));
            list.push(temp);
        }
        
        return list;
    }();
    
    function task(resolve, reject) {
        
        console.log("Test, insert list: \s", JSON.stringify(dataList));
        
        console.info("%s : Insert. Insert data to CRM start.".green, taskName);
        crmAddCompanyBulk.addCompany(dataList).then(function (res) {
            console.info("crmAddCompanyBulk.addCompany: %s".green, JSON.stringify(res));
            console.info("%s : Insert. Insert data to CRM Done.".green, taskName);
            
            resolve("%s : Insert. Insert data to CRM Done.", taskName);
        }, function (res) {
            console.error("crmAddCompanyBulk.addCompany: %s".red, JSON.stringify(res));
            
            resolve("%s : Insert. Insert data to CRM Done with error.", taskName);
        });
    };
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    // Dependcy: userList -> depTask/crmCompanyDesc -> this.task
    return new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    // ReSharper restore UndeclaredGlobalVariableUsing

}();
