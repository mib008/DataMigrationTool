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
    const config        = require("../../module/configs").httpClient,
          httpsService  = require("../../module/httpsService"),
          taskUtil      = require("../../module/utility/taskUtility");
    
    var taskName = "bulkJobList",
        dependencyTask = path.join(__dirname, "../depTask/authPassword");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var task = httpsService.getTask(config.crmApi.bulkJobList, function (content) {
        if (!global.bulkTask) global.bulkJobList = {};

        if (content.hasOwnProperty('jobs')) {
            content.jobs.forEach(function(item, index) {
                global.bulkJobList[item.id] = {};
            });
        }

        // console.log("global.bulkTask: ", JSON.stringify(global.bulkTask));
    });
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    var promise = new Promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    return promise;
}();
