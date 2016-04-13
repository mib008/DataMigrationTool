// ReSharper disable Es6Feature
const SqlGenerator  = require('sql-generator'),
      Q             = require('q');
// ReSharper restore Es6Feature


module.exports = function () {
    'use strict';
    
    // ReSharper disable Es6Feature
    // ReSharper disable UseOfImplicitGlobalInFunctionScope
    const commonUtil    = require("../module/utility/commonUtility"),
          dbConn        = require("../module/dbConn");
    // ReSharper restore UseOfImplicitGlobalInFunctionScope
    // ReSharper restore Es6Feature
    
    function generateSql(searchCriteria) {
        var sqlgen = new SqlGenerator();
        
        var stmt = sqlgen.select('idb_center.idb_account', '*');

        stmt.sql += " LIMIT 100";

        return stmt;
    };
    
    var promise = Q.promise(function (resolve, reject) {
        var stmt = generateSql();
        
        var sql = commonUtil.parseSql(stmt);
        
        var pool = dbConn.pool;
        
        console.log('SQL: %s', sql);
        
        pool.query(sql, function (err, rows, fields) {
            if (err) {
                reject(err.toString());
            } else {
                if (rows && (rows instanceof Array) && rows.length > 0) {
                    
                    rows.forEach(function (item, index) {
                        console.log('index: %d - Company Name: %s, User Name: %s', index, item.COMPANY_NAME, item.USERNAME);
                    });

                    resolve();
                } else {
                    reject('No records.');
                }
            }
        });
    });

    return promise;
}();