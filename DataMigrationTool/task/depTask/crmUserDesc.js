// ReSharper disable Es6Feature
const Q     = require('q'),
      util  = require('util'),
      querystring = require('querystring'),
      path  = require("path"),
      url   = require('url'),
      https = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UndeclaredGlobalVariableUsing
    const config = require("../../module/configs").httpClient,
          taskUtil = require("../../module/utility/taskUtility");
    
    var taskName = "crmUserTypeDesc",
        dependencyTask = path.join(__dirname, "crmCompanyDesc");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function task(resolve, reject) {
        
        var belongId = undefined;
        
        if (global.idMap[config.belongName.user]) {
            belongId = global.idMap[config.belongName.user].belongId;
        } else {
            reject("Get belongId failed.");
            return;
        }

        var query = {
            "belongId": belongId 
        };
        
        var option = url.parse(config.crmApi.crmUserDesc.url + "?" + querystring.stringify(query));
        option.method = config.crmApi.crmUserDesc.method;
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

                if (content.error_code) {
                    reject(content);
                }

                if (!global.idMap[config.belongName.user]) {
                    reject("No definition for: " + config.belongName.user);
                    return;
                }
                
                if (!content.entityTypes) {
                    reject("Get entityTypeId failed.");
                    return;
                }
                
                global.idMap[config.belongName.user].entityTypeId = content.entityTypes.id;
                
                if (!content.fields || !(content.fields instanceof Array)) {
                    reject("Get fields failed.");
                    return;
                }
                
                global.idMap[config.belongName.user].fields = content.fields;
                
                resolve(content);
            });
        });
        
        req.end();
        
        req.on('error', function (e) {
            console.error(e);
            
            reject(e);
        });
    };
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    
    return promise;
}();