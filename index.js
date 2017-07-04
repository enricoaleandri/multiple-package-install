"use strict";

var DEBUGNAME = __filename.slice(__dirname.length + 1, -3);
var debug = require("debug")(DEBUGNAME);
var fs = require('fs');

const BASE_URL = "";
var MultiInstall = function () { }

    MultiInstall.prototype.build = function (text, callback) {

    var data = [];
    var err = null;

    if(typeof callback !== 'undefined' && typeof(callback) == 'function'){

      if(typeof text === "undefined" || text === ""){
        callback("missing required params");
      }
      if(err)
        return callback(err);

      callback(null, data);

    }else {
      return new Promise(function(resolve, reject) {

        if(typeof text === "undefined" || text === ""){
          reject("missing required params");
        }
        if(err)
          return reject(err);
        resolve( data);
      });
    }

  };


module.exports = new MultiInstall();