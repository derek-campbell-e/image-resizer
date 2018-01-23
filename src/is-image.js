module.exports = function IsImage(filepath){
  const readChunk = require('read-chunk');
  const imageType = require('image-type');

  const buffer = readChunk.sync(filepath, 0, 12);
  const thisType = imageType(buffer);

  if (thisType){
    switch(thisType.ext){
      case 'jxr':
      case 'psd':
        return false; // we dont want to resize these two types
        break;
      default:
        return true;
      break;
    }
  }

  return false;

};