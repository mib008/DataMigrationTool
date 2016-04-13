// ReSharper disable Es6Feature
const log4js = require("log4js"),
      path = require("path");
// ReSharper restore Es6Feature

// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';

    var init = function () {
        try {
            log4js.configure("module/log4jsConfig.json");
        } catch (e) {
            console.error(e);
        }   
    }();
    
    var resolvedLogger = function () {
        try {
            var logger = log4js.getLogger("task_resolved");
            
            return logger;
        } catch (e) {
            console.error(e);

            return undefined;
        }         
    }();
    
    var rejectedLogger = function () {
        try {
            var logger = log4js.getLogger("task_rejected");
            
            return logger;
        } catch (e) {
            console.error(e);
            
            return undefined;
        }         
    }();
    
    return {
        resolvedLogger: resolvedLogger,
        rejectedLogger: rejectedLogger
    };
}();

