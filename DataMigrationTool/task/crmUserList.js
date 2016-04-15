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
    const config = require("../module/configs").httpClient,
          taskUtil = require("../module/utility/taskUtility");
    
    var taskName = "userList",
        dependencyTask = path.join(__dirname, "depTask/crmUserDesc");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function task(resolve, reject) {
        var columns = global.idMap[config.belongName.user].fields.map(function (item) { return item.propertyname });
        
        var data = {
            q: config.crmApi.crmUserList.sql.replace("*", columns.join(", "))
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

                global.crmUserList = content.records;
                
                resolve(content);
            });
        });
        
        req.end();
        
        req.on('error', function (e) {
            console.error(e);
            
            reject(e);
        });
    }
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));

    return promise;
}();
