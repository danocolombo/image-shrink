const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell} = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash');
const log = require('electron-log');

//set env
process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow;
let aboutWindow;
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: isDev ? 800: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,  //only able to resize when in dev
        webPreferences: {
            nodeIntegration: true,
        }
    })
    //--------------------------------------
    // auto expand devtools if in development
    //--------------------------------------
    if(isDev){
        mainWindow.webContents.openDevTools();
    }
    //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.loadFile('./app/index.html');
    
}
function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: "About ImageShrink",
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false
    })

    //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    aboutWindow.loadFile('./app/about.html');
    
}

app.on('ready', () => {
    createMainWindow()
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)
    //add global shortcuts when not in roles in developer menu 
    //globalShortcut.register('CmdOrCtrl+R',()=>mainWindow.reload())
    //globalShortcut.register(isMac ? 'Command+Alt+I': 'Ctrl+Shift+I',()=>mainWindow.toggleDevTools())
    // next link is garbage collector when closing app...
    mainWindow.on('closed', () => mainWindow = null)
    
})

const menu = [
    ...(isMac) ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }]: [],
    {
        role: 'fileMenu'
        // the following is the long way to replicate the role "fileMenu"
        // label: 'File',
        // submenu: [
        //     {
        //      label: 'Quit',
        //      accelerator: 'CmdOrCtrl+W',
        //      click: () => app.quit()
        //     }
        // ]
    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu: [
                { role: 'reload'},
                { role: 'forcereload'},
                { type: 'separator'},
                { role: 'toggledevtools'},
            ],
        },
    ]:[])
]
// need to catch the event from html file
//----------------------------------------
ipcMain.on('image:minimize', (e, data) => {
    data.dest = path.join(os.homedir(), '/imageshrink');
    imageShrink(data);
})

async function imageShrink({imgPath, quality, dest}){
    try {
        const pngQuality = quality/100;
        const files = await imagemin([slash(imgPath)],{
            destination: dest,
            plugins: [
                imageminMozjpeg({quality}),
                imageminPngquant({quality: [pngQuality, pngQuality]})
            ]
        })
        //console.log(files);
        //log the file information
        log.info(files);
        shell.openPath(dest);  //open the window where the file is
        // send communication back to window
        mainWindow.webContents.send('image:done');
    } catch (err) {
        console.log(err);
        log.error(err);
    }
}
//fix Mac menu displaying Electron
// if(isMac) menu.unshift({role: 'appMenu'})
//make sure we close properly on mac
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })