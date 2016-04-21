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
    
    const userList = require(path.join(__dirname, "utilTask/listUser"));
    
    const taskName = "userList",
          pageSize = 30;
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    return new Promise(function (resolve, reject) {
        var position = 0;
        var totalSize = pageSize;
        
        var rejectFunc = function (res) {
            console.error("%s: Get user list failed. position: %d, totalSize: %d".red, taskName, position, totalSize);
            console.error("%s".red, JSON.stringify(res));
            reject(res);
        };
        
        userList.getUser(position, pageSize).then(function (res) {
            totalSize = res.totalSize;

            if (global.crmUserList.length === totalSize) {
                resolve();
                return;
            }

            while (position + pageSize <= totalSize) {
                position += res.count;
                userList.getUser(position, pageSize).then(function() {
                    console.info("Size of global.crmUserList: %d", global.crmUserList.length);
                    if (global.crmUserList.length === totalSize) {
                        resolve();
                    }
                }, rejectFunc);
            };

        }, rejectFunc);
    });
    // ReSharper restore UndeclaredGlobalVariableUsing
}();
