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
    const config        = require("../module/configs").httpClient,
          httpsService  = require("../module/httpsService"),
          taskUtil      = require("../module/utility/taskUtility");
    
    const taskName          = "bulkBatchList",
          dependencyTask    = path.join(__dirname, "depTask/bulkJobList"),
          pageSize          = 30,
          MAX_PARALLEL_REQUEEST = 10;
    // ReSharper restore InconsistentNaming
    // ReSharper restore AssignToImplicitGlobalInFunctionScope
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature

    function task(resolve, reject) {
        var getBatch = function (jobId) {
            
            var postTask = httpsService.postTask(config.crmApi.bulkBatchInfo, { jobId: jobId }, function (content) {
                if (!global.bulkTask) global.bulkJobList = {};
                
                if (content.hasOwnProperty('batches')) {
                    content.batches.forEach(function (item, index) {
                        global.bulkJobList[item.jobId] = item;
                    });
                }
                
                console.log("global.bulkJobList: ", JSON.stringify(global.bulkJobList));
            });
            
            // ReSharper disable DuplicatingLocalDeclaration
            var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, postTask));
            // ReSharper restore DuplicatingLocalDeclaration
            
            return promise;
        };
        
        var dataList = function () {
            var target = [];
            
            if (!global.bulkJobList) return target;
            
            for (var prop in global.bulkJobList) {
                if (global.bulkJobList.hasOwnProperty(prop)) {
                    target.push(prop);
                }
            }
            
            return target;
        }();

        httpsService.queuePostParallelTask(taskName, dataList, getBatch, global.bulkJobList)(function(r1) {
            resolve(r1);
        }, function(r2) {
            reject(r2);
        });
    };
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    var promise = new Promise(taskUtil.getDependencyPromiseResolver(config.bulkJobList, dependencyTask, taskName, task));
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    return promise;
}();
