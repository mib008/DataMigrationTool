// ReSharper disable Es6Feature
const Q             = require('q'),
      util          = require('util'),
      path          = require("path"),
      querystring   = require('querystring'),
      SqlGenerator  = require('sql-generator'),
      url           = require('url'),
      https         = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    const config    = require("../../module/configs").httpClient,
        taskUtil    = require("../../module/utility/taskUtility");
    
    var taskName = "utilTask/createTask",
        dependencyTask = path.join(__dirname, "depTask/authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var createTask = function (param) {
        function task(resolve, reject) {
            try {
                var option = url.parse(config.crmApi.bulk.url);
                option.method = config.crmApi.bulk.method;
                option.headers = {
                    Authorization: global.authInfo.access_token
                };
                
                var data = param;
                
                var req = https.request(option, function (res) {
                    var content = "";
                    res.on('data', function (chunk) {
                        content += chunk;
                    }).addListener('end', function () {
                        try {
                            content = JSON.parse(content);
                        } catch (e) {

                        }
                        
                        resolve(content);
                    });
                });
                
                req.on('error', function (e) {
                    console.error(e);
                    
                    reject(e);
                });
                
                req.on('close', function (e) { });
                
                req.write(JSON.stringify(data));
                
                req.end();
            } catch (e) {
                reject(e);
            }
        }
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
        // ReSharper restore UndeclaredGlobalVariableUsing
        
        return promise;
    };
    
    return {
        createTask: createTask
    };
}();
