"use strict";

var DEBUGNAME = __filename.slice(__dirname.length + 1, -3);
var debug = require("debug")(DEBUGNAME);
var fs = require('fs');
var json = require('jju');
var npm = require('npm');
var validate = require("aproba");
var DependencyDTO = require('./DependencyDTO');
var merge = require('merge-package-json');

const BASE_URL = "";

var MultiInstall = function () { };

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
    //console.log("NextPackage", NextPackage);
    var dst = require(NextPackage);

    // Create a new `package.json`
    packageMergedBuffer = merge(dst, packageMergedBuffer);
  });

  var packageMergedParsed = JSON.parse(packageMergedBuffer);
  if(typeof packageMergedParsed.dependencies !== "undefined"){
    var deps = [];
    Object.keys(packageMergedParsed.dependencies).forEach(function(name){
      //console.log("name", name, "versione", packageMergedParsed.dependencies[name]);
      deps.push(new DependencyDTO({oackage : otherPackage, name : name, version : packageMergedParsed.dependencies[name]}));
    });
    packageMergedParsed.dependencies = deps;
  }

  resolve( packageMergedParsed);
});

};

MultiInstall.prototype.installDependencies = function(configObj, dependencies){

      if(typeof dependencies == "undefined"){
        dependencies = configObj;
        configObj = {};
      }
      validate('OA', [configObj,dependencies]);
      return new Promise(function(resolve, reject) {

        //loading npm from node
        npm.load(function (err) {
          // handle errors
          if(err){
            reject("Error Loading NPM :",err);
          }
          // install module ffi
          var npmResultDeps = [];
          var npmInstallDeps = dependencies.map(function (dep) {
            return dep.getFullName(); // DTO api
          });

          var BASE_DIR = configObj.path || "./";
          npm.commands.install(BASE_DIR, npmInstallDeps, function (er, allDependencies, installed) {

            if(err){
              reject("Error NPM Install:",err);
            }
            var requires = installed.requires;
            for (var index = 0; index < requires.length; index++) {
              var currentTopDep = requires[index];
              var from = currentTopDep.package._from.split("@");
              var where = currentTopDep.path;
              var newDep = {};
              newDep.name = from[0];
              newDep.version = from[1];
              newDep.path = where;

              //DEP_BEGIN-create dependecies tree
              var _dependencies = [];
              //installed.chidren

              var recursiveDependenciesExtractor = function RDE(_requires, __dependecies) {

                for (var depIndex = 0; depIndex < _requires.length; depIndex++) {
                  var currentDep = _requires[depIndex];
                  var childDep = {};
                  childDep.from = currentDep.package._from;
                  childDep.where = currentDep.path;
                  __dependecies.push(childDep); //
                  if (Array.isArray(currentDep.requires) && currentDep.requires.length > 0) {
                    RDE(currentDep.requires, __dependecies);
                  }
                }
                return __dependecies;
              };

              newDep.dependencies = recursiveDependenciesExtractor(currentTopDep.requires, _dependencies);
              //DEP_END
              npmResultDeps.push(new DependencyDTO(newDep));
            } // END FOR OF TOP DEPENDENCIES

            debug("npmResultDeps", JSON.stringify(npmResultDeps));// log the  real deep tree
            resolve (npmResultDeps );
          });

          npm.on('log', function (message) {
            // log installation progress
            //console.log("message:",message);
          });
          npm.on('error', function (err) {
            reject("Error NPM:",err);
          });
        });
      });
    };



module.exports = new MultiInstall();