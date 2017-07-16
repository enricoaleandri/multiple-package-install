var npm = require("npm");
npm.load(function (err) {
  // catch errors
  npm.commands.install("./", ["text-to-mp3@1.0.3"],function (er, data, dee) {
    console.log("dee",(dee));    // log the error or data
  });
  npm.on("log", function (message) {
    // log the progress of the installation
    console.log(message);
  });
});