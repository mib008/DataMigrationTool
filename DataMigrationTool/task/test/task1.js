// ReSharper disable Es6Feature
const Q = require('q');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';

    var promise = Q.promise(function (resolve, reject) {
        
        resolve("task1");
    });
    
    return promise;
}();