// ReSharper disable Es6Feature
const Q             = require('q'),
      util          = require('util'),
      path          = require("path"),
      querystring   = require('querystring'),
      async         = require('async'),
      url           = require('url'),
      https         = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    // ReSharper disable AssignToImplicitGlobalInFunctionScope
    // ReSharper disable InconsistentNaming
    const config    = require("../module/configs").httpClient,
          taskUtil  = require("../module/utility/taskUtility");
    
    const companyList       = require(path.join(__dirname, "utilTask/crmListCompanyPK"));
    
    const taskName          = "crmCompanyPKList",
          dependencyTask    = path.join(__dirname, "depTask/crmCompanyDesc"),
          pageSize          = 30,
          MAX_PARALLEL_REQUEEST = 10;
    // ReSharper restore InconsistentNaming
    // ReSharper restore AssignToImplicitGlobalInFunctionScope
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function task(resolve, reject) {
        var position = 0;
        var totalSize = pageSize;
        
        var rejectFunc = function (res) {
            console.error("%s: Get company list failed. global.crmCompanyList.length: %d, totalSize: %d".red, taskName, global.crmCompanyList.length, totalSize);
            console.error("%s".red, JSON.stringify(res));
            reject(res);
        };
        
        companyList.getCompany(position, pageSize).then(function (res) {
            totalSize = res.totalSize;
            
            if (global.crmCompanyList.length === totalSize) {
                resolve(res);
                return;
            }
            
            var paramList = [];
            var paramIndex = 0;
            
            var q = async.queue(function (obj, cb) {
                companyList.getCompany(obj.position, obj.pageSize).then(function (res) {
                    
                    setTimeout(function () {
                        if (cb) cb();
                    }, 1000);
                    
                }, function (res) {
                    setTimeout(function () {
                        rejectFunc(res);
                        if (cb) cb();
                    }, 1000);
                });
            }, MAX_PARALLEL_REQUEEST);
            
            q.saturated = function () {
                if (paramIndex < paramList.length) q.push(paramList[paramIndex++]);
            }
            
            q.drain = function () {
                if (global.crmCompanyList.length === totalSize) resolve(res);
                else rejectFunc(res);
            };
            
            position += pageSize;
            while (position <= totalSize) {
                paramList.push({ position: position, pageSize: pageSize });
                
                position += pageSize;
            }
            
            for (paramIndex = 0; paramIndex < MAX_PARALLEL_REQUEEST && paramIndex < paramList.length; paramIndex++) {
                q.push(paramList[paramIndex]);
            }

        }, rejectFunc);
    };
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    return promise;
}();
