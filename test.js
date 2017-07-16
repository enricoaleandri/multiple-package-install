/**
 * Created by enrico on 04/07/17.
 */



var multiInstall = require("./index");
var npm = require('npm');
var DependencyDTO = require('./DependencyDTO');
const BASE_DIR="./project/";

multiInstall.parsePackages(BASE_DIR+"package.json").then(function(package_json_merged){

  //console.log("package_json_merged", package_json_merged);
  if(typeof package_json_merged === "undefined" || typeof package_json_merged.dependencies === "undefined"){
    return; // exit command, impossible to go next
  }

  //loading npm from node
  npm.load(function(err) {
    // handle errors

    // install module ffi
    var npmResultDeps = [];
    var npmInstallDeps = package_json_merged.dependencies.map(function(dep){
        return dep.getName()+"@"+dep.getVersion();
    });
    console.log("npmInstallDeps", JSON.stringify(npmInstallDeps));
    npm.commands.install(BASE_DIR, npmInstallDeps, function(er, allDependencies, installed) {
      if(er){
        console.log("Error", er);
        return;
      }

      var requires = installed.requires;
      for (var index = 0; index < requires.length ; index++){
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

        var recursiveDependenciesExtractor = function RDE(_requires, __dependecies){

          for(var depIndex = 0 ; depIndex < _requires.length ; depIndex ++){
            var currentDep = _requires[depIndex];
            var childDep = {};
            childDep.from = currentDep.package._from;
            childDep.where = currentDep.path;
            __dependecies.push(childDep); //
            if(Array.isArray(currentDep.requires) && currentDep.requires.length > 0){
              RDE(currentDep.requires, __dependecies);
            }
          }
          return __dependecies;
        };

        newDep.dependencies = recursiveDependenciesExtractor(currentTopDep.requires, _dependencies);
        //DEP_END
        npmResultDeps.push(new DependencyDTO(newDep));
      } // END FOR OF TOP DEPENDENCIES


      console.log("npmResultDeps", JSON.stringify(npmResultDeps));// log the  real deep tree
    });

    npm.on('log', function(message) {
      // log installation progress
      //console.log("message:",message);
    });
  });
});
