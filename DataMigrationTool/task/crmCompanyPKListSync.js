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
    const config    = require("../module/configs").httpClient,
          taskUtil  = require("../module/utility/taskUtility");
    
    const companyList       = require(path.join(__dirname, "utilTask/crmListCompanyPK"));
    
    const taskName          = "crmCompanyPKList",
          dependencyTask    = path.join(__dirname, "depTask/crmCompanyDesc"),
          pageSize          = 30;
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    function task(resolve, reject) {
        var position = 0;
        var totalSize = pageSize;
        
        var rejectFunc = function (res) {
            console.error("%s: Get company list failed. position: %d, totalSize: %d".red, taskName, position, totalSize);
            console.error("%s".red, JSON.stringify(res));
            reject(res);
        };
        
        companyList.getCompany(position, pageSize).then(function (res) {
            totalSize = res.totalSize;
            
            if (global.crmCompanyList.length === totalSize) {
                resolve(util.format("%s resolved.", taskName));
                return;
            }

            companyList.getCompanySync(position + 30, pageSize, totalSize).then(function(res) {
                resolve(util.format("%s resolved.", taskName));
            }, rejectFunc);
        }, rejectFunc);
    };
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    
    return promise;
}();
