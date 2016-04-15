// ReSharper disable UseOfImplicitGlobalInFunctionScope

// ReSharper disable Es6Feature
const path = require("path"),
    util = require('util'),
    colors = require("colors");
// ReSharper restore Es6Feature





//var taskName = process.argv[2];

//if (!taskName) taskName = "default";

//var task = require(path.join(__dirname, "task/", taskName));

//if (task) task.then(function (message) {
//    if (message) console.log(message.toString().green);
//    else console.log("Task: %s executed.".green, taskName);
//    // process.exit(0);
//}, function (error) {
//    if (error) console.log(error.toString().red);
//    else console.log("Task: %s executed with error.".red, taskName);
//    // process.exit(1);
//}); 


var taskList = [];

for (var i = 2; i < process.argv.length; i++) {
    if (util.isNullOrUndefined(process.argv[i])) {
        break;
    } else {
        taskList.push(process.argv[i]);
    }
}

if (taskList < 1) {
    console.error("No task(s) specified.");
    process.exit(1);
}


var temp = undefined;
var lastTaskName = undefined;

taskList.forEach(function (item, index) {
    if (temp) {
        temp.then(function () {
            temp = require(path.join(__dirname, "task/", item));
            
        }, function () {
            console.error("Task: %s failed.", taskList[index - 1]);
            process.exit(1);
        });
    } else {
        temp = require(path.join(__dirname, "task/", item));
    }
    
    lastTaskName = item;

    if (index === taskList.length - 1) {
        temp.then(function (message) {
            if (util.isString(message)) console.log(message.toString().green);
            else if (util.isObject(message)) // console.log(JSON.stringify(message));
            
            console.log("Task: %s executed.".green, lastTaskName);
                    // process.exit(0);
        }, function (error) {
            if (util.isString(error)) console.error(error.toString().red);
            else if (util.isObject(error)) {
                console.error(JSON.stringify(error));

                if (error.code) {
                    console.error("Code :%s", error.code);
                }

                if (error.message) {
                    console.error("Message :%s", error.message);
                }
            }
            
            console.error("Task: %s executed with error.".red, lastTaskName);
                    // process.exit(1);
        });
    }
});