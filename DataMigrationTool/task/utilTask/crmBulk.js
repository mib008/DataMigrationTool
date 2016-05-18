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
    const config    = require("../../module/configs").httpClient;
    
    var taskName = "utilTask/crmBulk",
        crmCreateBulkTask = path.join(__dirname, "crmCreateBulkTask");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var createBatch = function (jobOption, data) {
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        function task(resolve, reject) {
            require(crmCreateBulkTask).createTask(jobOption).then(function (res) {
                var result = undefined;
                
                data = {
                    jobId: res.id, 
                    datas: data
                };
                
                console.info("%s data:%s", taskName, JSON.stringify(data));
                
                var option = url.parse(config.crmApi.bulkRun.url);
                // var option = url.parse("http://localhost:1237/service/hole");
                option.method = config.crmApi.bulkRun.method;
                option.headers = {
                    Authorization: global.authInfo.access_token,
                    "Content-Type": "application/json"
                };
                
                var req = https.request(option, function (res) {
                    var content = "";
                    res.on('data', function (chunk) {
                        content += chunk;
                    }).on('end', function () {
                        try {
                            content = JSON.parse(content);
                        } catch (e) {

                        }
                        
                        result = content;
                    });
                });
                
                req.on('error', function (e) {
                    console.error(e);
                    
                    reject(e);
                });
                
                req.on('close', function (e) {
                    resolve(result);
                });
                
                req.write(JSON.stringify(data));
                
                req.end();
            }, reject);
        };
        
        return new Promise(task);
        // ReSharper restore UndeclaredGlobalVariableUsing
    };
    
    return {
        createBatch: createBatch
    };
}();
