// ReSharper disable Es6Feature
const Q     = require('q'),
      util  = require('util'),
      querystring = require('querystring'),
      url  = require('url'),
      https  = require('https');
// ReSharper restore Es6Feature

module.exports = function () {
    'use strict';
    
    var promise = Q.promise(function (resolve, reject) {
        
        // ReSharper disable Es6Feature
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        // ReSharper disable UndeclaredGlobalVariableUsing
        const config = require("../../module/configs").httpClient;
        // ReSharper restore UndeclaredGlobalVariableUsing
        // ReSharper restore UseOfImplicitGlobalInFunctionScope
        // ReSharper restore Es6Feature
        
        // https://api.xiaoshouyi.com/oauth2/token.action?
        // grant_type=%s&
        // client_id=%s&
        // client_secret=%s&
        // redirect_uri=%s&
        // username=%s&
        // password=%s
        
        var query = {
            "grant_type": "password",
            "client_id": config.clientId,
            "client_secret": config.clientSecret,
            "redirect_uri": config.redirectUri,
            "username": config.userAccount,
            "password": config.userPassword + config.userToken
        };
        
        var option = url.parse(config.authApi.authPassword.url + "?" + querystring.stringify(query));
        option.method = config.authApi.authPassword.method;
        
        //var option = url.parse(config.authApi.authPassword.url);
        //option.query = querystring.stringify({
        //    "grant_type": "password",
        //    "client_id": config.clientId,
        //    "client_secret": config.clientSecret,
        //    "redirect_uri ": config.redirectUri,
        //    "username ": config.userAccount,
        //    "password ": config.userPassword + config.userToken});
        //option.method = config.authApi.authPassword.method;
        //option.search = "?" + option.query;
        
        var req = https.request(option, function (res) {
            //console.log('statusCode: ', res.statusCode);
            //console.log('headers: ', res.headers);
            
            var content = "";
            res.on('data', function (chunk) {
                content += chunk;
            }).addListener('end', function () {
                // console.log("content: %s", content);
                
                content = JSON.parse(content);
                
                if (content.error) {
                    console.error("authPassword rejected.");
                    reject(content);
                } else {
                    global.authInfo = content;
                    console.log("authPassword resolved.");
                    resolve(content);
                }
            });
        });
        
        req.end();
        
        req.on('error', (e) => {
            console.error(e);
            console.error("authPassword rejected.");
            
            reject(e);
        });
});

return promise;
}();