module.exports = function Application(ImageResizer){
  const electron = require('electron')
  // Module to control application life.
  const app = electron.app
  // Module to create native browser window.
  const BrowserWindow = electron.BrowserWindow
  const ipcMain = electron.ipcMain;
  
  const path = require('path')
  const url = require('url')
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let mainWindow

  let application = {};
  application.window = mainWindow;
  application.mainScreen = path.join(__dirname, '..', 'views', 'image-resizer.html');

  application.meta = require('../package.json');

  ipcMain.on('get-meta-data', function(event, args){
    console.log("MNETAA");
    event.sender.send('meta-data', application.meta);
  });

  ipcMain.on('open-folder-picker', function(event, args){
    const dialog = electron.dialog;
    dialog.showOpenDialog({properties: ['openDirectory']}, function(folder){
      if(typeof folder === "undefined"){
        event.sender.send('chosen-folder', args, false);
        return false;
      }
      if(folder.length > 0){
        event.sender.send('chosen-folder', args, folder[0]);
      }
    });
  });

  ipcMain.on('start-resizing', function(event, inputFolder, outputFolder, maxDimensions){
    ImageResizer.delegate = event.sender;
    ImageResizer.resize(maxDimensions, inputFolder, outputFolder, null, function(){
      console.log("DONE");
    })
  });

  
  function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800, 
      height: 450, 
      //frame: false, 
      resizable: false, 
      titleBarStyle: 'hiddenInset',
      movable: true,
      fullscreenable: false,
      nodeIntegration: true, 
    });
    console.log(application.mainScreen);
  
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: application.mainScreen,
      protocol: 'file:',
      slashes: true
    }))
  
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
  
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })
  console.log("AAAAA");

  return application;
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
};