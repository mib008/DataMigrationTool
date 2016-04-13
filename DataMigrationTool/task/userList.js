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
    
    function task(resolve, reject) {
        // ReSharper disable Es6Feature
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        const config = require("../module/configs").httpClient;
        // ReSharper restore UseOfImplicitGlobalInFunctionScope
        // ReSharper restore Es6Feature
        
        var option = url.parse(config.crmApi.userList.url);
        option.method = config.crmApi.userList.method;
        option.headers = {
            Authorization: global.authInfo.access_token
        };
        
        var data = querystring.stringify({
            start : 0,
            count : 100
        });
        
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
        
        req.write(data);
        
        req.end();
        
        req.on('error', function (e) {
            console.error(e);
            
            reject(e);
        });
    }
    
    var promise = Q.promise(function (resolve, reject) {
        // ReSharper disable Es6Feature
        // ReSharper disable UndeclaredGlobalVariableUsing
        const log = require('../module/logProvider');
        // ReSharper restore UndeclaredGlobalVariableUsing
        // ReSharper restore Es6Feature        

        var doTask = function () {
            task(function (msg) {
                if (msg.error_code) {
                    console.log("userList rejected.");
                    log.rejectedLogger.warn(util.format("userList: %s", JSON.stringify(msg)));
                    reject(msg);
                } else {
                    console.error("userList resolved.");
                    log.resolvedLogger.info(util.format("userList: %s", JSON.stringify(msg)));
                    resolve(msg);
                }                
            }, function (msg) {
                console.log("userList rejected.");
                log.rejectedLogger.warn(util.format("userList: %s", JSON.stringify(msg)));
                reject(msg);
            });
        };
        
        if (global.authInfo) {
            doTask();
        } else {
            // ReSharper disable UseOfImplicitGlobalInFunctionScope
            // ReSharper disable UndeclaredGlobalVariableUsing
            require(path.join(__dirname, "depTask/authPassword")).then(function () {
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
