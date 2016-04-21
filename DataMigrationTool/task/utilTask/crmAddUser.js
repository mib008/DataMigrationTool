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
        taskUtil    = require("../../module/utility/taskUtility"),
        commonUtil  = require("../../module/utility/commonUtility");
    
    var taskName = "crmFindCompany",
        dependencyTask = path.join(__dirname, "depTask/crmCompanyDesc");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function getTargetData(user) {
        var target = {};
        
        var requireList = [];
        global.idMap[config.belongName.user].fields.forEach(function (item, index) {
            if (!item.enabled || !item.createable) return;
            
            if (item.required && !user[item.propertyname]) {
                requireList.push(item);
                return;
            }
            
            target[item.propertyname] = user[item.propertyname];
        });
        
        if (requireList.length > 0) {
            throw util.format("Required property must be specified: %s", requireList.map(function (x) { return x.propertyname; }).join('\r\n'));
            
            return undefined;
        }
        
        return target;
    };
    
    function addOne(user) {
        function task(resolve, reject) {
            
            var data = undefined;
            
            try {
                data = getTargetData(user);
            } catch (e) {
                reject(e);
                return;
            }
            
            if (!data) reject("Create insert data failed.");
            
            data = {
                belongId: global.idMap[config.belongName.user].belongId, 
                record: data
            };
            
            var option = url.parse(util.format(config.crmApi.customizeUserCreate.url));
            option.method = config.crmApi.customizeUserCreate.method;
            option.headers = {
                Authorization: global.authInfo.access_token,
                "content-type": "x-www-form-urlencoded"
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
            
            req.write(JSON.stringify(data));
            
            req.end();
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
        };
        
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };
    
    function addMuti(users) {
        if (users.length === 1) return users[0];
        
        function task(resolve, reject) {
            
            var data = [];
            
            var failedDatas = [];
            users.forEach(function (item, index) {
                try {
                    data = push(getTargetData(item));
                } catch (e) {
                    failedDatas.push(e);
                }
            });
            
            if (failedDatas.length > 0) {
                reject(e);
                return;
            }
            
            data = {
                belongId: global.idMap[config.belongName.user].belongId, 
                record: data
            };
            
            var option = url.parse(util.format(config.crmApi.customizeUserCreate.url));
            option.method = config.crmApi.customizeUserCreate.method;
            option.headers = {
                Authorization: global.authInfo.access_token,
                "content-type": "x-www-form-urlencoded"
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
            
            req.write(JSON.stringify(data));
            
            req.end();
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
        };
        
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };
    
    
    var addUser = function (users) {
        if (!users) return undefined;
        
        if (users instanceof Array) return addOne(users);
        
        if (users instanceof Object) return addMuti(users);
        
        return undefined;
    };
    
    return {
        addUser: addUser
    };
}();
