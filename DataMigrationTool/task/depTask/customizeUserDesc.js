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
    
    var taskName = "customizeUserDesc",
        dependencyTask = path.join(__dirname, "belongIdList");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var testUser1 = {
        name: "testUser1",
        entityType: "entityType1",
        ownerId: "ownerId1",
        dimDepart: "dimDepart1",
        createdBy: "",
        createdAt: "",
        updatedBy: "",
        updatedAt: ""
    };
    
    function task(resolve, reject) {

        var belongId = undefined;

        if (global.idMap[config.belongName.user]) {
            belongId = global.idMap[config.belongName.user].belongId;
        } else {
            reject("Get belongId failed.");
        }

        var option = url.parse(util.format(config.crmApi.customizeUserDesc.url, belongId));
        option.method = config.crmApi.customizeUserDesc.method;
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
    };
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.idMap, dependencyTask, taskName, task));
    
    return promise;
}();