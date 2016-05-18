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
    const PAGESIZE              = 30,
          MAX_PARALLEL_REQUEEST = 10;
    // ReSharper restore InconsistentNaming
    // ReSharper restore AssignToImplicitGlobalInFunctionScope
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
   
    var getTask = function (urlInfo, receivedDataCallback) {

        return function task(resolve, reject) {

            var option = url.parse(urlInfo.url);
            option.method = urlInfo.method;
            option.headers = {
                Authorization: global.authInfo.access_token
            };

            console.log("Http Get options:".green + JSON.stringify(option));

            var req = https.request(option, function(res) {
                var content = "";
                res.on('data', function(chunk) {
                    content += chunk;
                }).addListener('end', function () {
                    console.log("Http Get Received data:".green + content);                    

                    try {
                        content = JSON.parse(content);
                    } catch (e) {

                    }

                    if(receivedDataCallback) receivedDataCallback(content);

                    resolve(content);
                });
            });

            req.on('error', function(e) {
                console.error(e);

                reject(e);
            });

            req.end();
        };
    };
    
    var postTask = function (urlInfo, jsonData, receivedDataCallback) {
        
        return function task(resolve, reject) {
            
            var option = url.parse(urlInfo.url);
            option.method = urlInfo.method;
            option.headers = {
                Authorization: global.authInfo.access_token
            };
            
            var req = https.request(option, function (res) {
                var content = "";
                res.on('data', function (chunk) {
                    content += chunk;
                }).addListener('end', function () {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {

                    }
                    
                    if (receivedDataCallback) receivedDataCallback(content);
                    
                    resolve(content);
                });
            });

            req.write(JSON.stringify(jsonData));
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
            
            req.end();
        };
    };

    var queuePostParallelTask = function (taskName, dataList, task, targetGlobalProperty) {

        return function task(resolve, reject) {
            
            if (task) {
                var rejectFunc = function (res) {
                    console.error("%s".red, JSON.stringify(res));
                    reject(res);
                };

                var paramIndex = 0;
                
                var q = async.queue(function (obj, cb) {
                    task(dataList[paramIndex++]).then(function (res) {
                        
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
                    if (paramIndex < dataList.length) q.push(dataList[paramIndex++]);
                }
                
                q.drain = function () {
                    if (global[targetGlobalProperty].length === totalSize) resolve();
                    else rejectFunc();
                };
                
                for (paramIndex = 0; paramIndex < MAX_PARALLEL_REQUEEST && paramIndex < dataList.length; paramIndex++) {
                    q.push(dataList[paramIndex]);
                }
            }
        };
    };


    var queuePostPagedTask = function (taskName, pagedTask, targetGlobalProperty) {

        return function task(resolve, reject) {

            var position = 0;
            var totalSize = PAGESIZE;

            if (pagedTask) {
                var rejectFunc = function (res) {
                    console.error("%s: Get company list failed. %s.length: %d, totalSize: %d".red, taskName, targetGlobalProperty, global[targetGlobalProperty].length, totalSize);
                    console.error("%s".red, JSON.stringify(res));
                    reject(res);
                };                

                pagedTask(position, PAGESIZE).then(function (res) {
                    totalSize = res.totalSize;
                    
                    if (global[targetGlobalProperty].length === totalSize) {
                        resolve(res);
                        return;
                    }
                    
                    var paramList = [];
                    var paramIndex = 0;
                    
                    var q = async.queue(function (obj, cb) {
                        pagedTask(obj.position, obj.pageSize).then(function (res) {
                            
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
                        if (global[targetGlobalProperty].length === totalSize) resolve(res);
                        else rejectFunc(res);
                    };
                    
                    position += PAGESIZE;
                    while (position <= totalSize) {
                        paramList.push({ position: position, pageSize: PAGESIZE });
                        
                        position += PAGESIZE;
                    }
                    
                    for (paramIndex = 0; paramIndex < MAX_PARALLEL_REQUEEST && paramIndex < paramList.length; paramIndex++) {
                        q.push(paramList[paramIndex]);
                    }

                }, rejectFunc);
            }
        };
    };

    return {
        getTask: getTask,
        postTask: postTask,
        queuePostParallelTask: queuePostParallelTask,
        queuePostPagedTask: queuePostPagedTask
    };
}();
