/**
 * Created by enrico on 05/07/17.
 */


var DependencyDTO = function (obj) {
  if (!(this instanceof DependencyDTO)) {
    return new DependencyDTO(obj);
  }
  if (typeof obj === 'undefined') {
    return this;
  }

  this.setPackage(obj.package);
  this.setName(obj.name);
  this.setVersion(obj.version);
  this.setPath(obj.path);
  this.setDependencies(obj.dependencies);
};


DependencyDTO.prototype.getFullName = function () {
  return this.getName()+"@"+this.getVersion();
};

DependencyDTO.prototype.setName = function (name) {
  this.name = name;
};
DependencyDTO.prototype.getName = function () {
  return this.name;
};

DependencyDTO.prototype.setVersion = function (version) {
  this.version = version;
};
DependencyDTO.prototype.getVersion = function () {
  return this.version;
};

DependencyDTO.prototype.setPath = function (path) {
  this.path = path;
};
DependencyDTO.prototype.getPath = function () {
  return this.path;
};

DependencyDTO.prototype.setPackage = function (package) {
  this.package = package;
};
DependencyDTO.prototype.getPackage = function () {
  return this.package;
};

DependencyDTO.prototype.setDependencies = function (dependencies) {

  if(Array.isArray(dependencies)){

    var deps = dependencies.map(function(dep){
      var newDep = {};
      var from  = dep.from.split("@");
      newDep.name = from[0];
      newDep.version = from[1];
      newDep.path = dep.where;
      return new DependencyDTO(newDep);
    });
    this.dependencies = deps;
  }
};

DependencyDTO.prototype.getDependencies = function () {
  return this.dependencies;
};

module.exports = DependencyDTO;
