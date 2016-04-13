// ReSharper disable Es6Feature
const Q     = require('q'),
      util  = require('util'),
      url  = require('url'),
      https  = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';

    var promise = Q.promise(function (resolve, reject) {
        
        // ReSharper disable Es6Feature
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        const config = require("../../module/configs").httpClient;
        // ReSharper restore UseOfImplicitGlobalInFunctionScope
        // ReSharper restore Es6Feature

        var option = url.parse(util.format(config.authApi.authCode.url, config.userToken, "127.0.0.1/"));

        var req = https.request(option, (res) => {
            console.log('statusCode: ', res.statusCode);
            console.log('headers: ', res.headers);
            
            var content = "";
            res.on('data', (chunk) => {
                // console.log("getAuthCode : %s", JSON.stringify(res));

                content += chunk;
            }).addListener('end', () => {
                console.log(content);
            });
        });

        req.end();

        req.on('error', (e) => {
            console.error(e);
        });
    });
    
    return promise;
}();