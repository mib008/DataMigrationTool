// ReSharper disable Es6Feature
const Q     = require('q'),
      util  = require('util'),
      path  = require("path"),
      url   = require('url'),
      https = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    const config = require("../module/configs").httpClient,
          taskUtil = require("../module/utility/taskUtility");
    
    var taskName = "customizeUserCreate",
        dependencyTask = path.join(__dirname, "depTask/crmUserDesc");
    
    const crmFindCompany = require(path.join(__dirname, "utilTask/crmFindCompany"));
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var testUser1 = {
        name: "testUser",
        ownerId: "480603",
        dimDepart: "266930",
        customItem1: "TestCompany",
        entityType: "100006535",
        createdBy: "",
        createdAt: "",
        updatedBy: "",
        updatedAt: ""
    };

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
    
    function task(resolve, reject) {
        var data = undefined;
        
        try {
            data = getTargetData(testUser1);
        } catch (e) {
            reject(e);
            return;
        }
        
        if (!data) reject("Create insert data failed.");

        crmFindCompany.findByAccountName(data.customItem1).then(function (res) {
            if (!res || !res.records || res.records.length < 1) reject("No company found by name :" + data.customItem1);

            if (res.records.length === 1) {
                // 用户.机构ID = 公司.ID
                data.customItem1 = res.records[0].id;
                // 用户.所有者ID = 公司.所有者ID
                data.ownerId = res.records[0].ownerId;
            } else {
                res.records.forEach(function(item, index) {
                    if (item.accountName === data.customItem1) {
                        data.customItem1 = item.id;
                        data.ownerId = item.ownerId;
                    }
                });
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
        }, function(res) {
            reject("Call utilTask/crmFindCompany failed.");
        });
    };
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    
    return promise;
}();