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
    
    var taskName = "syncDB2CRM",
        dependencyTask = path.join(__dirname, "depTask/userList");
    // ReSharper restore UndeclaredGlobalVariableUsing
    // ReSharper restore Es6Feature
    
    var dataDefine = [
        { column: "ins_code", prop: "dbcVarchar1" },
        { column: "ins_full_name", prop: "accountName" },
        { column: "ins_name", prop: "dbcVarchar2" },
        { column: "province", prop: "state" },
        { column: "type", prop: "dbcVarchar4" },
        { column: "city", prop: "city" }
    ];
    
    var testUser1 = {
        accountName: "testCompany2",
        ownerId: "480603",
        dimDepart: "266930",
        createdBy: "",
        createdAt: "",
        updatedBy: "",
        updatedAt: ""
    };    

    //"address": "",
    //"zipCode": "",
    //"state": "上海市",
    //"dbcVarchar4": "基金公司",
    //"parentAccountId": "",
    //"city": "上海",
    //"dbcReal1": 0,
    //"region": "",
    //"longitude": "",
    //"dbcVarchar3": "",
    //"latitude": "",
    //"ownerId": 485932,
    //"dbcVarchar5": "",
    //"recentActivityRecordTime": "",
    //"createdAt": "2016-04-12 11:13",
    //"recentActivityCreatedBy": "",
    //"createdBy": 480603,
    //"updatedAt": "2016-04-12 11:36",
    //"updatedBy": 480603,
    //"comment": "",
    //"approvalStatus": 0,
    //"dimDepart": 266930,
    //"applicantId": ""
    
    function task(resolve, reject) {
        
    }
    
    var promise = Q.promise(taskUtil.getDependencyPromiseResolver(global.authInfo, dependencyTask, taskName, task));
    
    return promise;
}();
