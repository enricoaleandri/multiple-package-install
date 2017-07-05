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

  this.setName(obj.name);
  this.setVersion(obj.version);
  this.setPath(obj.path);
  this.setDependencies(obj.dependencies);
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

DependencyDTO.prototype.setDependencies = function (dependencies) {

  if(Array.isArray(dependencies)){

    var deps = dependencies.map(function(dep){
      var newDep = {};
      newDep.name = dep[0].substring(0,dep[0].lastIndexOf("@")-1);
      newDep.version = dep[0].substring(dep[0].lastIndexOf("@"),dep[0].length);
      newDep.path = dep[1];
      return new DependencyDTO(newDep);
    });
    this.dependencies = deps;
  }
};

DependencyDTO.prototype.getDependencies = function () {
  return this.dependencies;
};

module.exports = DependencyDTO;
