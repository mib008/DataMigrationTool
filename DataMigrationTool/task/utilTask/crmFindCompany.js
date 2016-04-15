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
    const config = require("../../module/configs").httpClient,
        taskUtil = require("../../module/utility/taskUtility");
    
    var taskName = "crmFindCompany",
        dependencyTask = path.join(__dirname, "depTask/crmCompanyDesc");
    
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var findBy = function (condition) {
        function task(resolve, reject) {
            
            var columns = global.idMap[config.belongName.company].fields.map(function (item) { return item.propertyname; });
            var columnSet = new Set(columns);
            
            var whereStmt = [];
            
            for (var prop in condition) {
                if (!condition.hasOwnProperty(prop) || !columnSet.has(prop)) continue;
                
                whereStmt.push(util.format("%s = '%s'", prop, condition[prop]));
            }
            
            var data = {
                q: config.crmApi.crmCompanyList.sql.replace("*", columns.join(", ")) + " where " + whereStmt.join(" AND ")
            };
            
            var option = url.parse(config.crmApi.soqlQuery.url + "?" + querystring.stringify(data));
            option.method = config.crmApi.soqlQuery.method;
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
                    
                    global.crmCompanyList = content.records;
                    
                    resolve(content);
                });
            });
            
            req.end();
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
        }
        
        // var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };

    var findByAccountName = function (accountName) {
        function task(resolve, reject) {
            
            var columns = global.idMap[config.belongName.company].fields.map(function (item) { return item.propertyname; });
            
            var data = {
                q: config.crmApi.crmCompanyList.sql.replace("*", columns.join(", ")) + util.format(" where accountName = '%s'", accountName)
            };
            
            var option = url.parse(config.crmApi.soqlQuery.url + "?" + querystring.stringify(data));
            option.method = config.crmApi.soqlQuery.method;
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
                    
                    resolve(content);
                });
            });
            
            req.end();
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
        }
        
        // var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };
    
    return {
        findBy: findBy,
        findByAccountName: findByAccountName
        
    };
}();
