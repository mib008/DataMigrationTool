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
    const config = require("../../module/configs").httpClient,
          taskUtil = require("../../module/utility/taskUtility");
    
    var taskName = "utilTask/crmListCompanyPKBulk",
        dependencyTask = path.join(__dirname, "../depTask/authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var createTask = function () {
        function task(resolve, reject) {
            try {
                var option = url.parse(config.crmApi.bulk.url);
                option.method = config.crmApi.soqlQuery.method;
                option.headers = {
                    Authorization: global.authInfo.access_token
                };
                
                var data = { object: config.belongName.company, operation: "query" };
                
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
        var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName + "/createTask", task));
        // ReSharper restore UndeclaredGlobalVariableUsing
        
        return promise;
    };
    
    var getCompany = function (start, pageSize) {
        if (!start) start = 0;
        // console.info("%s start at: %d", taskName, start);
        
        if (!pageSize) pageSize = 5000;
        
        function task(resolve, reject) {
            createTask().then(function (res) {
                var result = undefined;
                
                var columnSet = new Set(global.idMap[config.belongName.company].fields.map(function (item) {
                    if (item.unique) return item.propertyname;
                    else return undefined;
                }));
                
                columnSet.delete(undefined);
                
                var columns = Array.from(columnSet);
                columns.push("dbcVarchar1");
                
                var data = {
                    jobId: res.id, 
                    datas: [
                        { q : config.crmApi.crmCompanyList.sql.replace("*", columns.join(", ")).replace(";", util.format(" limit %d,%d;", start, pageSize)) }
                    ]
                };
                
                var option = url.parse(config.crmApi.bulkRun.url);
                option.method = config.crmApi.soqlQuery.method;
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
                        
                        if (global.crmCompanyList) {
                            if (content.records && content.records instanceof Array && content.records.length > 0) {
                                content.records.forEach(function (item, index) {
                                    global.crmCompanyList.push(item);
                                });
                            }
                        } else global.crmCompanyList = content.records;
                        
                        if (!content.totalSize) {
                            result = util.format("Failed: %s", JSON.stringify(content));
                        }
                        
                        result = {
                            message : util.format("global.crmCompanyList.length: %d, totalSize: %d", global.crmCompanyList.length, content.totalSize),
                            totalSize: content.totalSize
                        };
                    });
                });
                
                req.on('error', function (e) {
                    console.error(e);
                    
                    reject(e);
                });
                
                req.on('close', function (e) {
                    
                    if (result.totalSize) {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                });
                
                req.write(JSON.stringify(data));
                
                req.end();
            }, reject);
        }
        
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        return new Promise(task);
        // ReSharper restore UndeclaredGlobalVariableUsing
    };
    
    return {
        getCompany: getCompany
    };
}();
