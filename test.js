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
        var where = currentTopDep.package._where;
        var newDep = {};
        newDep.name = from[0];
        newDep.version = from[1];
        newDep.path = where;

        //DEP_BEGIN-create dependecies tree
        var _dependencies = [];
        //installed.chidren

        var depRequires = currentTopDep.requires;
        var depIndex = 0;
        while(Array.isArray(depRequires) && depRequires.length > 0){
          var currentDep = depRequires[depIndex];
          var childDep = {};
          childDep.from = currentDep.package._from;
          childDep.where = currentDep.package._where;
          _dependencies.push(childDep); //
          depIndex++; // go over next element
          if(depIndex == depRequires.length){ // if array has been navigated at all,
            depRequires = depRequires.requires; // I move in deepper node of requires
            depIndex = 0; // and reset the counter
          }
        }

        newDep.dependencies = _dependencies;
        //DEP_END
        npmResultDeps.push(new DependencyDTO(newDep));
      } // END FOR OF TOP DEPENDENCIES


      console.log("npmResultDeps", JSON.stringify(npmResultDeps));
      // WORKING ON SECOND INSTALL

      var onlyTop = installed.children.filter(function(item, index, array){
        if(item.requiredBy.length == 1 && item.requiredBy[0].path == BASE_DIR) {
          item.index = index;
          //array[index].index = index;
          return item.requiredBy.length == 1 && item.requiredBy[0].path == BASE_DIR;
        }else{
          return false;
        }
      });
      //END
      // log errors or data
      console.log("npmResultDeps", JSON.stringify(npmResultDeps));
    });

    npm.on('log', function(message) {
      // log installation progress
      //console.log("message:",message);
    });
  });
});
