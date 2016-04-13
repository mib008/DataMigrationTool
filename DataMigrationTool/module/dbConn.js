// ReSharper disable Es6Feature
const colors   = require("colors"),
      mysql    = require('mysql');
// ReSharper restore Es6Feature

// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
// ReSharper disable Es6Feature
    const config = require("./configs");
// ReSharper restore Es6Feature

    var pool = (function () {
        var instance;
        
        function init() {
            var po = mysql.createPool(config.dbPoolConfig);
            
            return po;
        };
        
        return (function () {
            if (!instance) instance = init();
            return instance;
        })();
    })();
    
    return {
        pool: pool
    };
}();

