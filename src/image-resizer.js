module.exports = function ImageResizer(){
  const sharp = require('sharp');
  const fs = require('fs');
  const path = require('path');
  const dir = require('node-dir');

  let ir = {};
  
  ir.application = require('./application')(ir);

  ir.isImage = require('./is-image');

  ir.progress = 0;
  ir.items = 0;
  ir.processed = 0;
  ir.errors = 0;

  ir.delegate = null;

  ir.gatherItems = function(inputDirectory, callback){
    let items = [];
    dir.files(inputDirectory, function(error, files){
      if(error){
        console.log(error);
        callback(items);
        return;
      }

      for(let fileIndex in files){
        let file = files[fileIndex];
        if(ir.isImage(file)) {
          items.push(file);
        }
      }

      callback(items);
      return;
    });
  };

  ir.resizeEach = function(maxDimensions, outputDirectory, imageFilePath, callback){
    let basename = path.basename(imageFilePath);
    let resizedFilePath = path.join(outputDirectory, basename);
    sharp(imageFilePath)
      .resize(maxDimensions.width, maxDimensions.height)
      .max()
      .toFile(resizedFilePath, function(error){
        callback(error);
      });
  };

  ir.progressUpdate = function(error){
    ir.processed ++;
    ir.progress = (ir.processed / ir.items) * 100;
    if(ir.delegate !== null){
      ir.delegate.send('resize-progress', ir.progress);
    }
  };

  ir.resize = function(maxDimensions, inputDirectory, outputDirectory, fileRename, callback){
    ir.processed = 0;
    ir.items = 0;
    ir.progress = 0;

    ir.gatherItems(inputDirectory, function afterGatherItems(imagesArray){
      let imageArrayCopy = [...imagesArray];
      ir.items = imageArrayCopy.length;

      let loop = function(){
        let image = imageArrayCopy.shift();
        if(typeof image === "undefined"){
          callback();
          return;
        }
        ir.resizeEach(maxDimensions, outputDirectory, image, function afterResizeEach(error){
          ir.progressUpdate(error);
          loop();
        });
      };

      loop();

    });
  };
  

  return ir;
};