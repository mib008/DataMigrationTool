// ReSharper disable NativeTypePrototypeExtending
module.exports = function () {
    'use strict';
    
    String.prototype.startWith = function (str) {
        var reg = new RegExp("^" + str);
        return reg.test(this);
    };
    
    String.prototype.endWith = function (str) {
        var reg = new RegExp(str + "$");
        return reg.test(this);
    };
    
    String.prototype.isNullOrWhitespace = function () {
        return (this.length === 0 || this.replace(/\s+?/).length === 0);
    };
}();
