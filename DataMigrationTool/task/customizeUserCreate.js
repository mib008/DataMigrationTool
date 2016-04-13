// ReSharper disable Es6Feature
const Q     = require('q'),
      util  = require('util'),
      path  = require("path"),
      url   = require('url'),
      https = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    var taskName = "customizeUserCreate";
    
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
        // ReSharper disable Es6Feature
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        // ReSharper disable UndeclaredGlobalVariableUsing
        const config = require("../module/configs").httpClient;
        // ReSharper restore UndeclaredGlobalVariableUsing
        // ReSharper restore UseOfImplicitGlobalInFunctionScope
        // ReSharper restore Es6Feature
        
        var query = "json=" + JSON.stringify({ record: testUser1 });
        
        var option = url.parse(config.crmApi.customizeUserCreate.url);
        option.method = config.crmApi.customizeUserCreate.method;
        option.headers = {
            Authorization: global.authInfo.access_token,
            "content-type": "application/json"
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
                // console.log(content);
            });
        });
        
        req.write(JSON.stringify({ record: testUser1 }));
        
        req.end();
        
        req.on('error', function (e) {
            console.error(e);
            
            reject(e);
        });
    };
    
    var promise = Q.promise(function (resolve, reject) {
        // ReSharper disable Es6Feature
        // ReSharper disable UndeclaredGlobalVariableUsing
        const log = require('../module/logProvider');
        // ReSharper restore UndeclaredGlobalVariableUsing
        // ReSharper restore Es6Feature
        
        var doTask = function () {
            task(function (msg) {
                if (msg.error_code) {
                    console.log("%s rejected." , taskName);
                    log.rejectedLogger.warn(util.format("%s: %s", taskName, JSON.stringify(msg)));
                    reject(msg);
                } else {
                    console.error("%s resolved.", taskName);
                    log.resolvedLogger.info(util.format("%s: %s", taskName, JSON.stringify(msg)));
                    resolve(msg);
                }
                
            }, function (msg) {
                console.log("%s rejected." , taskName);
                log.rejectedLogger.warn(util.format("%s: %s", taskName, JSON.stringify(msg)));
                reject(msg);
            });
        };
        
        if (global.authInfo) {
            doTask();
        } else {
            // ReSharper disable UseOfImplicitGlobalInFunctionScope
            // ReSharper disable UndeclaredGlobalVariableUsing
            require(path.join(__dirname, "authPassword")).then(function () {
                doTask();
            }, function (res) {
                reject(res);
            });
            // ReSharper restore UndeclaredGlobalVariableUsing
            // ReSharper restore UseOfImplicitGlobalInFunctionScope
        }
    });
    
    return promise;
}();