// ReSharper disable Es6Feature
const colors = require("colors"),
    path = require('path'),
    fs = require('fs'),
    mysql = require('mysql');
// ReSharper restore Es6Feature

// ReSharper disable UndeclaredGlobalVariableUsing
module.exports = function () {
    'use strict';
    
    var config = eval("(" + fs.readFileSync('./module/config.json', 'utf8') + ")");
    
    var dbConfig = function () {
        return config.database.dbConfig;
    }();
    
    var dbPoolConfig = function () {
        var cfg = dbConfig;
        cfg.connectionLimit = config.database.dbPoolConfig.connectionLimit;
        return cfg;
    }();
    
    var httpClient = function () {
        return config.httpClient;
    }();
    
    var sql = function () {
        return {
            getCompanyFromDB: config.database.getCompanyFromDB,
            getUserFromDB: config.database.getUserFromDB
        };
    }();
    
    return {
        dbConfig: dbConfig,
        dbPoolConfig: dbPoolConfig,
        httpClient: httpClient,
        
        sql: sql
    };
}();

