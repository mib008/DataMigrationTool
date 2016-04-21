// ReSharper disable Es6Feature
const Q = require('q');
// ReSharper restore Es6Feature


module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UseOfImplicitGlobalInFunctionScope
    const dbConn        = require("../module/dbConn"),
          config        = require("../module/configs").sql;
    // ReSharper restore UseOfImplicitGlobalInFunctionScope
    // ReSharper restore Es6Feature
    
    // ReSharper disable UndeclaredGlobalVariableUsing
    var promise = new Promise(function (resolve, reject) {
        var sql = config.getCompanyFromDB.sql;
        
        var pool = dbConn.pool;
        
        console.log('SQL: %s', sql);
        
        pool.query(sql, function (err, rows, fields) {
            if (err) {
                reject(err.toString());
                pool.end();
            } else {
                resolve({ rows: rows, fields: fields });
                pool.end();
            }
        });
    });
    // ReSharper restore UndeclaredGlobalVariableUsing
    
    return promise;
}();