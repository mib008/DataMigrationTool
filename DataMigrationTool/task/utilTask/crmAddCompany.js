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
    const config        = require("../../module/configs").httpClient,
          httpsService  = require("../../module/httpsService"),
          taskUtil      = require("../../module/utility/taskUtility"),
          commonUtil    = require("../../module/utility/commonUtility");
    
    var taskName = "crmFindCompany",
        dependencyTask = path.join(__dirname, "depTask/crmCompanyDesc");
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

        if (company.ownerId) {
            target.ownerId = company.ownerId;
            target.dimDepart = company.departId;
        } else {
            var owner = commonUtil.findFromArrayBy(global.crmUserList, company.ownerName, "name");

            if (owner) {
                target.ownerId = owner.id;
                target.dimDepart = owner.departId;
            } else {
                throw util.format("Owner name: %s not found.", company.ownerName);
            }
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
    
    function addOne_bak(company, converted) {
        function task(resolve, reject) {
            
            var data = undefined;

            if (converted) {
                data = company;
            } else {
                try {
                    data = getTargetData(company);
                } catch (e) {
                    reject(e);
                    return;
                }
            }

            if (!data) reject("Create insert data failed.");
            
            data = {
                belongId: global.idMap[config.belongName.company].belongId, 
                record: data
            };
            
            var option = url.parse(util.format(config.crmApi.crmCompanyCreate.url));
            option.method = config.crmApi.crmCompanyCreate.method;
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
    
    function addOne(company, converted) {
        
        var data = undefined;
        
        if (converted) {
            data = company;
        } else {
            try {
                data = getTargetData(company);
            } catch (e) {
                console.log(e);
            }
        }

        if (!data) {
            console.log("Create insert data failed.");
            return undefined;
        }
        
        data = {
            belongId: global.idMap[config.belongName.company].belongId, 
            record: data
        };

        var task = httpsService.postTask(config.crmApi.crmCompanyCreate, data, function(content) {});
        
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };

    
    function addMuti(companys) {
        function task(resolve, reject) {
            
            var data = [];
            
            var failedDatas = [];
            companys.forEach(function (item, index) {
                try {
                    data.push(getTargetData(item));
                } catch (e) {
                    failedDatas.push(e);
                }
            });
            
            var failedDatas2 = [];
            var succeedDatas2 = [];
            
            var finishFunc = function () {
                if (failedDatas2.length + succeedDatas2.length >= data.length) {
                    resolve({ succeed: succeedDatas2, failed1: failedDatas, failed2: failedDatas2 });
                }
            };
            
            data.forEach(function (item, index) {
                addOne(item, true).then(function (res) {
                    succeedDatas2.push(item);
                    
                    finishFunc();
                }, function (res) {
                    failedDatas2.push(item);
                    
                    finishFunc();
                });
            });
        };
        
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
        
        return promise;
    };
    
    var addCompany = function (companys) {
        if (!companys) return undefined;
        
        if (companys instanceof Array) {
            if (companys.length === 1) return addOne(companys[0]);
            else return addMuti(companys);
        }
        
        
        if (companys instanceof Object) return addOne(companys);
        
        return undefined;
    };
    
    return {
        addCompany: addCompany
    };
}();
