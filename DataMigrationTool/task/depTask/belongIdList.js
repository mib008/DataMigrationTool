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
    const config = require("../../module/configs").httpClient,
          taskUtil = require("../../module/utility/taskUtility");
    
    var taskName = "belongIdList",
        dependencyTask = path.join(__dirname, "authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function task(resolve, reject) {
        var option = url.parse(config.crmApi.belongIdList.url);
        option.method = config.crmApi.belongIdList.method;
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
                
                global.idMap = function () {
                    if (content && content.records && content.records instanceof Array && content.records.length > 0) {
                        var belongIdMap = {};
                        
                        content.records.forEach(x => {
                            belongIdMap[x.name] = { belongId : x.belongId }
                        });
                        
                        return belongIdMap;
                    } else {
                        return undefined;
                    }
                }();
                
                resolve(content);
            });
        });
        
        req.end();
        
        req.on('error', function (e) {
            console.error(e);
            
            reject(e);
        });
    };
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
    
    return promise;
}();