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
    const config    = require("../module/configs").httpClient,
          taskUtil  = require("../module/utility/taskUtility");
    
    const companyList       = require(path.join(__dirname, "utilTask/crmListCompanyPK"));
    
    const taskName          = "crmCompanyPKList",
          dependencyTask    = path.join(__dirname, "depTask/crmCompanyDesc"),
          pageSize          = 30;
          MAX_PARALLEL_REQUEEST = 10;
    // ReSharper restore AssignToImplicitGlobalInFunctionScope
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    function task1(resolve, reject) {
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
                resolve();
                return;
            }
            
            while (position + pageSize <= totalSize) {
                position += res.count;
                companyList.getCompany(position, pageSize).then(function () {
                    console.info("Size of global.crmCompanyList: %d", global.crmCompanyList.length);
                    if (global.crmCompanyList.length === totalSize) {
                        resolve();
                    }
                }, rejectFunc);
            };

        }, rejectFunc);
    };
    
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
                resolve();
                return;
            }
            
            var paramList = [];
            var paramIndex = 0;
            
            var q = async.queue(function (obj, cb) {
                companyList.getCompany(obj.position, obj.pageSize).then(function (res) {
                    if (global.crmCompanyList.length === totalSize) resolve(res);
                    
                    if (cb) cb();
                }, function (res) {
                    rejectFunc(res);
                    if (cb) cb();
                });
            }, MAX_PARALLEL_REQUEEST);
            
            q.saturated = function () {
                q.push(paramList[paramIndex++]);
            }
            
            position += pageSize;
            while (position <= totalSize) {
                paramList.push({ position: position, pageSize: pageSize });
                
                position += pageSize;
            }
            
            for (paramIndex = 0; paramIndex < MAX_PARALLEL_REQUEEST && paramIndex < paramList.length ; paramIndex++) {
                q.push(paramList[paramIndex]);
            }

        }, rejectFunc);
    };
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    
    return promise;
}();
