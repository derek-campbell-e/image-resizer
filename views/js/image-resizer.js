module.exports = function ImageResizer(){
  const {ipcRenderer} = require('electron');
  window.$ = window.jQuery = require('jquery');

  let truncate = function(string){
    let newString = "";
    if(string.length > 20){
      newString = string.substring(0, 40) + "...";
    } else {
      newString = string;
    }
    return newString;
  };

  let ir = {};

  ir.delegates = {};

  ir.delegates.chosenFolder = function(event, dataTarget, folder){
    let folderText = truncate(folder);
    let dom = $("."+dataTarget);
    if(folder){
      dom.find(".folder-text").text(folderText).attr('folder', folder);
      //dom.find(".folder-icon i").text('folder');
    } else {
      //dom.find(".folder-icon i").text('create_new_folder');
    }
    ir.delegates.folderIconText(dom);
  };

  ir.delegates.folderIconText = function(dom){
    let folderIconText = "create_new_folder";
    let domFolderAttr = dom.find(".folder-text").attr('folder')
    if(typeof domFolderAttr !== "undefined" && domFolderAttr.length > 0) {
      folderIconText = "folder";
    } else {
      folderIconText = "create_new_folder";
    }
    dom.find(".folder-icon i").text(folderIconText);
  };

  ir.delegates.resizeProgress = function(event, progress){
    let progressValue = "";
    switch(progress){
      case 0:
        progressValue = "Starting";
      break;
      case 100:
        progressValue = "DONE";
      break;
      default:
        progressValue = progress+"%"; 
      break;
    }
    $(".progress-bar").css('width', progress+"%").text(progressValue);
  };

  ir.delegates.clickProgress = function(){
    if(!ir.delegates.isValidForResizing()) {
      return false;
    }

    let inputFolder = $('.inputDirectory .folder-text').attr('folder');
    let outputFolder = $('.outputDirectory .folder-text').attr('folder');
    let maxDimensions = {width: parseInt($("#width").val()), height: parseInt($("#height").val())};
    ipcRenderer.send('start-resizing', inputFolder, outputFolder, maxDimensions);
  };

  ir.delegates.clickOpenDirectory = function(){
    let dataTarget = $(this).attr('data-target');
    ipcRenderer.send('open-folder-picker', dataTarget);
    $(this).find('.folder-icon i').text('folder_open');
  };

  ir.delegates.metaData = function(event, meta){
    let dom = $("#version");
    dom.text(meta.version);
  };

  ir.delegates.isValidForResizing = function(){
    let isValidForResizing = false;
    let inputFolder = $('.inputDirectory .folder-text').attr('folder') || "";
    let outputFolder = $('.outputDirectory .folder-text').attr('folder') || "";
    let maxDimensions = {width: parseInt($("#width").val()), height: parseInt($("#height").val())};
    let truthConditions = {};
    truthConditions.hasInputFolder = inputFolder.length !== 0;
    truthConditions.hasOutputFolder = outputFolder.length !== 0;
    truthConditions.validNumbersForMaxDimensions = !isNaN(maxDimensions.width) && !isNaN(maxDimensions.height);
    truthConditions.maxDimensionsGreaterThanZero = maxDimensions.width > 0 && maxDimensions.height > 0;

    for(let truthConditionKey in truthConditions){
      let truthCondition = truthConditions[truthConditionKey];
      if (!truthCondition){
        ir.createError(truthConditionKey);
        return false;
      }
    }

    return true;

  };

  ir.errors = {};
  ir.errors.default = {title: "An error has occured", message: "Please try again"};
  ir.errors.hasInputFolder = {title: "No input folder chosen", message: "Please select an input directory"};
  ir.errors.hasOutputFolder = {title: "No output folder chosen", message: "Please select an output directory"};
  ir.errors.validNumbersForMaxDimensions = {title: "Invalid resize dimensions", message: "Please enter an integer value for width and height"};
  ir.errors.maxDimensionsGreaterThanZero = {title: "Greater than zero size", message: "Please enter a value for resizing that is greater than zero"};

  ir.createError = function(errorKey){
    let dom = $("#errorModal");
    dom.find('.modal-title').text(ir.errors[errorKey].title || ir.errors['default'].title);
    dom.find('.modal-body').text(ir.errors[errorKey].message || ir.errors['default'].message);
    dom.modal();
  };

  ir.bind = function(){
    ipcRenderer.on('chosen-folder', ir.delegates.chosenFolder);
    ipcRenderer.on('resize-progress', ir.delegates.resizeProgress);
    ipcRenderer.on('meta-data', ir.delegates.metaData);
    ipcRenderer.send('get-meta-data', null);
    $(document).on('click', '.progress', ir.delegates.clickProgress);
    $(document).on('click', ".inputDirectory, .outputDirectory", ir.delegates.clickOpenDirectory);
  };

  let init = function(){
    ir.bind();
    return ir;
  };

  return init();
};
