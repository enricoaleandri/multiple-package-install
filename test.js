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

  multiInstall.installDependencies({path : BASE_DIR}, package_json_merged.dependencies).then(function(installedDep){

    console.log("dependenci Installed");
    console.log("toInstallDep :",JSON.stringify(package_json_merged.dependencies));
    console.log("\n\n\ninstalledDep :",JSON.stringify(installedDep));
  });
});
