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
    
    var taskName = "utilTask/crmAddCompanyBulk",
        crmCreateBulkTask = path.join(__dirname, "crmCreateBulkTask");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var testUser1 = {
        accountName: "testCompany2",
        ownerId: "480603",
        dimDepart: "266930",
        createdBy: "",
        createdAt: "",
        updatedBy: "",
        updatedAt: ""
    };
    
    function getTargetData(company) {
        var target = {};
        
        var owner = commonUtil.findFromArrayBy(global.crmUserList, company.ownerName, "name");
        
        if (owner) {
            target.ownerId = owner.id;
            target.dimDepart = owner.departId;
        } else {
            throw util.format("Task: %s, Owner name: %s not found. company: %s", taskName, company.ownerName, JSON.stringify(company));
        }
        
        var requireList = [];
        global.idMap[config.belongName.company].fields.forEach(function (item, index) {
            if (!item.enabled || !item.createable) return;
            
            if (item.required && !company[item.propertyname]) {
                if (item.propertyname !== "ownerId" && item.propertyname !== "dimDepart") {
                    requireList.push(item);
                    return;
                } else {
                    return;
                }
            }
            
            target[item.propertyname] = company[item.propertyname];
        });
        
        if (requireList.length > 0) {
            throw util.format("Required property must be specified: %s", requireList.map(function (x) { return x.propertyname; }).join('\r\n'));
        }
        
        return target;
    };
    
    var addCompany = function (companys) {
        if (!companys) return undefined;

        var data = [];

        companys.forEach(function(item, index) {
            try {
                data.push(getTargetData(item));
            } catch (e) {
                console.warn(e);
            } 
        });
        
        function task(resolve, reject) {
            require(crmCreateBulkTask).createTask({ object: config.belongName.company, operation: "insert"}).then(function (res) {
                var result = undefined;
                
                data = {
                    jobId: res.id, 
                    datas: data
                };

                console.info("utilTask/crmAddCompanyBulk data:%s", JSON.stringify(data));
                
                var option = url.parse(config.crmApi.bulkRun.url);
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
                            result = e;
                            return;
                        }

                        result = content;
                    });
                });
                
                req.on('error', function (e) {
                    console.error(e);
                    
                    reject(e);
                });
                
                req.on('close', function (e) {
                    
                    if (result.error_code) {
                        result.httpInfo = option;
                        reject(result);
                    } else {
                        resolve(result);
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
        addCompany: addCompany
    };
}();
