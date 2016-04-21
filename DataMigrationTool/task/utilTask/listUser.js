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
    const config = require("../../module/configs").httpClient,
          taskUtil = require("../../module/utility/taskUtility");
    
    var taskName = "utilTask/listUser",
        dependencyTask = path.join(__dirname, "../depTask/authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var getUser = function (start, pageSize) {
        if (!start) start = 0;
        console.info("%s start at: %d", taskName, start);

        if (!pageSize) pageSize = 30;
        
        function task(resolve, reject) {
            var option = url.parse(config.crmApi.userList.url + "?" + querystring.stringify({ start : start, count : pageSize }));
            option.method = config.crmApi.userList.method;
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
                    
                    if (global.crmUserList) {
                        if (content.records && content.records instanceof Array && content.records.length > 0) {
                            content.records.forEach(function (item, index) {
                                global.crmUserList.push(item);
                            });
                        }
                    } else global.crmUserList = content.records;
                    
                    resolve(content);
                });
            });
            
            req.end();
            
            req.on('error', function (e) {
                console.error(e);
                
                reject(e);
            });
        }
        
        // ReSharper disable DuplicatingLocalDeclaration
        var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
        // ReSharper restore DuplicatingLocalDeclaration
        
        return promise;
    };
    
    return {
        getUser: getUser
    };
}();
