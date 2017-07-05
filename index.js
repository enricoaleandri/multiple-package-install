"use strict";

var DEBUGNAME = __filename.slice(__dirname.length + 1, -3);
var debug = require("debug")(DEBUGNAME);
var fs = require('fs');
var json = require('jju');
var DependencyDTO = require('./DependencyDTO');
var merge = require('merge-package-json');

const BASE_URL = "";
var MultiInstall = function () { }

    MultiInstall.prototype.parsePackages = function (packageFile) {

    return new Promise(function(resolve, reject) {

      if(typeof packageFile === "undefined" || packageFile === ""){
        reject("Missing package.json file");
      }
      var packageParsed = require(packageFile);
      if(typeof packageParsed === "undefined" || packageParsed === ""){
        reject("package.json : " + packageFile + " not recognize");
      }
      if(typeof packageParsed.packages === "undefined" || packageParsed.packages === ""){
        reject("package.json :",packageFile,"do not have other package references");
      }
      var packageMergedBuffer = packageParsed;
      packageParsed.packages.forEach(function (otherPackage, index) {

        var basePackagePath = packageFile.substring(0, packageFile.lastIndexOf("/")+1);
        var NextPackage = basePackagePath+ otherPackage+'package.json';
        console.log("NextPackage", NextPackage);
        var dst = require(NextPackage);

        // Create a new `package.json`
        packageMergedBuffer = merge(dst, packageMergedBuffer);
      });

      var packageMergedParsed = JSON.parse(packageMergedBuffer);
      if(typeof packageMergedParsed.dependencies !== "undefined"){
        var deps = [];
        Object.keys(packageMergedParsed.dependencies).forEach(function(name){
          console.log("name", name, "versione", packageMergedParsed.dependencies[name]);
          deps.push(new DependencyDTO({name : name, version : packageMergedParsed.dependencies[name]}));
        });
        packageMergedParsed.dependencies = deps;
      }

      resolve( packageMergedParsed);
    });

  };



module.exports = new MultiInstall();