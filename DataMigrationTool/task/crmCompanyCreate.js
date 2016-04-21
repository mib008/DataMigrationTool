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
    
    var taskName = "crmCompanyCreate",
        dependencyTask = path.join(__dirname, "depTask/crmUserDesc");
    
    const crmFindCompany = require(path.join(__dirname, "utilTask/crmFindCompany"));
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
        
        var requireList = [];
        global.idMap[config.belongName.company].fields.forEach(function (item, index) {
            if (!item.enabled || !item.createable) return;
            
            if (item.required && !company[item.propertyname]) {
                requireList.push(item);
                return;
            }
            
            target[item.propertyname] = company[item.propertyname];
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
        
        data = {
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
}();