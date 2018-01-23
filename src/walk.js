module.exports = function Walk(currentDirectory, callback){
  const fs = require('fs');
  let self = this;
  console.log("THIS IS MYSELF", self, self.walk());
};