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
    
    var taskName = "utilTask/crmListCompanyPK",
        dependencyTask = path.join(__dirname, "../depTask/authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function getHttpOption(start, pageSize) {
        var columnSet = new Set(global.idMap[config.belongName.company].fields.map(function (item) {
            if (item.unique) return item.propertyname;
            else return undefined;
        }));
        
        columnSet.delete(undefined);
        
        var columns = Array.from(columnSet);
        columns.push("dbcVarchar1");
        
        var data = {
            q: config.crmApi.crmCompanyList.sql.replace("*", columns.join(", ")).replace(";", util.format(" limit %d,%d;", start, pageSize))
        };
        
        var option = url.parse(config.crmApi.soqlQuery.url + "?" + querystring.stringify(data));
        option.method = config.crmApi.soqlQuery.method;
        option.headers = {
            Authorization: global.authInfo.access_token
        };
        
        return option;
    };
    
    var getCompany = function (start, pageSize) {
        if (!start) start = 0;
        // console.info("%s start at: %d", taskName, start);
        
        if (!pageSize) pageSize = 30;
        
        function task(resolve, reject) {
            var result = undefined;
            
            var req = https.request(getHttpOption(start, pageSize), function (res) {
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
            
            req.end();
        }
        
        // ReSharper disable DuplicatingLocalDeclaration
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
        // ReSharper restore DuplicatingLocalDeclaration
        
        return promise;
    };
    
    function seqRequest(start, pageSize, totalSize, finishedCallback) {
        https.request(getHttpOption(start, pageSize), function (res) {
            var content = "";
            res.on('data', function (chunk) {
                content += chunk;
            }).addListener('end', function () {
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
                
                console.info("global.crmCompanyList.length: %d, totalSize: %d", global.crmCompanyList.length, totalSize);
                
                if (start + pageSize <= totalSize) seqRequest(start + pageSize, pageSize, totalSize, finishedCallback);
                else {
                    if (finishedCallback) finishedCallback();
                }
            });
        });
    };
    
    var getCompanySync = function (start, pageSize, totalSize) {
        if (!start) start = 0;
        console.info("%s start at: %d", taskName, start);
        
        if (!pageSize) pageSize = 30;
        
        function task(resolve, reject) {
            try {
                seqRequest(start, pageSize, totalSize, function () {
                    resolve("crmListCompanyPK.getCompanySync resolved.");
                });
            } catch (e) {
                reject(e);
            }
        }
        
        // ReSharper disable DuplicatingLocalDeclaration
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
        // ReSharper restore DuplicatingLocalDeclaration
        
        return promise;
    };
    
    return {
        getCompany: getCompany,
        getCompanySync: getCompanySync
    };
}();
