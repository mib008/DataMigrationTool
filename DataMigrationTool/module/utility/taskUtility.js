// ReSharper disable Es6Feature
const util  = require('util');
// ReSharper restore Es6Feature


// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    const log = require('../logProvider');
    // ReSharper restore Es6Feature
    
    var getDependencyPromiseResolver = function (dependencyGlobalProp, dependencyTask, taskName, task) {
        
        
        return function (resolve, reject) {
            var doTaskResolve = function (msg) {
                console.error("%s resolved.", taskName);
                log.resolvedLogger.info(util.format("%s: %s", taskName, JSON.stringify(msg)));
                resolve(msg);
            };
            
            var doTaskReject = function (msg) {
                console.log("%s rejected." , taskName);
                log.rejectedLogger.warn(util.format("%s: %s", taskName, JSON.stringify(msg)));
                reject(msg);
            };
            
            var doTask = function () {
                task(function (msg) {
                    if (msg.error_code) {
                        doTaskReject(msg);
                    } else {
                        doTaskResolve(msg);
                    }
                }, function (msg) {
                    doTaskReject(msg);
                });
            };
            
            if (dependencyGlobalProp) {
                doTask();
            } else {
                // ReSharper disable UndeclaredGlobalVariableUsing
                require(dependencyTask).then(function () {
                    doTask();
                }, function (res) {
                    if (util.isString(res)) console.error(res.toString().red);
                    else if (util.isObject(res)) {
                        console.error(JSON.stringify(res));
                        
                        if (res.code) {
                            console.error("Code :%s", res.code);
                        }
                        
                        if (res.message) {
                            console.error("Message :%s", res.message);
                        }
                    }
                    
                    console.error("Task: %s executed with error.".red, "authPassword");
                    reject(util.format("Task: %s executed with error.", "authPassword"));
                });
            // ReSharper restore UndeclaredGlobalVariableUsing
            }
        }
    };
    
    
    return {
        getDependencyPromiseResolver: getDependencyPromiseResolver
    };
}();

