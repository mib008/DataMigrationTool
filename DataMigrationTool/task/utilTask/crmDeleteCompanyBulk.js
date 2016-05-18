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
        commonUtil  = require("../../module/utility/commonUtility");
    
    var taskName = "utilTask/crmDeleteCompanyBulk",
        crmCreateBulkTask = path.join(__dirname, "crmCreateBulkTask");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    function getTargetData(company) {
        var target = {};
        
        if (company.hasOwnProperty("id")) {
            target.id = company.id;
        } else {
            throw util.format("Task: %s, company id not specified: %s", taskName, JSON.stringify(company));
        }
        
        return target;
    };
    
    var deleteCompany = function (companys) {
        if (!companys) return undefined;
        
        var data = [];
        
        companys.forEach(function (item, index) {
            try {
                data.push(getTargetData(item));
            } catch (e) {
                console.warn(e);
            }
            
        });
        
        // ReSharper disable UndeclaredGlobalVariableUsing
        function task(resolve, reject) {
            require(crmCreateBulkTask).createTask({ object: config.belongName.company, operation: "delete" }).then(function (res) {
                var result = undefined;
                
                data = {
                    jobId: res.id, 
                    datas: data
                };
                
                console.info("utilTask/crmUpdateCompanyBulk data:%s", JSON.stringify(data));
                
                var option = url.parse(config.crmApi.bulkRun.url);
                option.method = config.crmApi.soqlQuery.method;
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

                        }
                        
                        result = content;
                    });
                });
                
                req.on('error', function (e) {
                    console.error(e);
                    
                    reject(e);
                });
                
                req.on('close', function (e) {
                    
                    if (result.totalSize) {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                });
                
                req.write(JSON.stringify(data));
                
                req.end();
            }, reject);
        };

        return new Promise(task);
        // ReSharper restore UndeclaredGlobalVariableUsing
    };
    
    return {
        deleteCompany: deleteCompany
    };
}();
