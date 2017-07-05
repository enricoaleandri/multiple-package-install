/**
 * Created by enrico on 04/07/17.
 */



var multiInstall = require("./index");
var npm = require('npm');
var DependencyDTO = require('./DependencyDTO');

multiInstall.parsePackages("./project/package.json").then(function(package_json_merged){

  console.log("package_json_merged", package_json_merged);
  if(typeof package_json_merged === "undefined" || typeof package_json_merged.dependencies === "undefined"){
    return; // exit command, impossible to go next
  }

  var installedDependency
  //loading npm from node
  npm.load(function(err) {
    // handle errors

    // install module ffi
    var npmResultDeps = [];
    var npmInstallDeps = package_json_merged.dependencies.map(function(dep){
        return dep.getName+"@"+dep.getVersion().replace("^", "");
    });
    console.log("npmInstallDeps", JSON.stringify(npmInstallDeps));
    npm.commands.install(npmInstallDeps, function(er, allDependencies) {
      if(er){
        console.log("Error", er);
        return;
      }
      var parentDep = allDependencies[allDependencies.length];
      allDependencies.splice(allDependencies.length-1,1);
      var newDep = {};
      newDep.name = parentDep[0].substring(0,parentDep[0].lastIndexOf("@")-1);
      newDep.version = parentDep[0].substring(parentDep[0].lastIndexOf("@"),parentDep[0].length);
      newDep.path = parentDep[1];
      newDep.dependencies = allDependencies;
      npmResultDeps.push(new DependencyDTO(newDep));
      // log errors or data
      console.log("npmResultDeps", npmResultDeps);
    });

    npm.on('log', function(message) {
      // log installation progress
      //console.log("message:",message);
    });
  });
});
