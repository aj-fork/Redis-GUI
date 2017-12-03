"use strict";

const electron = require("electron");
const {ipcMain, BrowserWindow} = electron;
const config = require("../config");
const fs = require("fs");
const myUtils = require("./lib/util");
const RedisCommander = require("./bin/redis-commander");

const PRIVATE = {
    SAVE_CONFIG: Symbol("_saveConfig"),

    // events handlers
    INIT_EVENT: Symbol("_initEvent"),
    ON_CLOSED: Symbol("_onClosed"),
    ON_RP_EVENT: Symbol("_onRendererEvent"),
};

const WINDOW_EVENTS = {
    CLOSED: "closed",
    RENDERER: "renderer-process-event",
    MAIN: "main-process-event"
};

class Window {
    constructor(){
        this._win = null;
        this._config = config.window;
        if(fs.existsSync(myUtils.getConfigPath())){
            this._loadUrl = config.loadUrl;
        }else{
            this._loadUrl = config.initConfigUrl;
        }
    }

    buildWindow(){
        this._win = new BrowserWindow(this._config);
        this._win.loadURL(this._loadUrl);
    }

    showWindow(){
        //this._win.webContents.openDevTools();
        this._win.show();
    }

    setScreenSize(){
        if(!this._config) return false;
        let bounds = electron.screen.getAllDisplays()[0].bounds;
        this._config.height = bounds.height;
        this._config.width = bounds.width;
        return true;
    }
    
    [PRIVATE.INIT_EVENT](){
        if(!this._win) return;
        this._win.on(WINDOW_EVENTS.CLOSED, this[PRIVATE.ON_CLOSED].bind(this));
        ipcMain.on(WINDOW_EVENTS.RENDERER, this[PRIVATE.ON_RP_EVENT].bind(this));
    }
    [PRIVATE.ON_CLOSED](){
        this._win = null;
    }
    [PRIVATE.ON_RP_EVENT](event, data){
        this[PRIVATE.SAVE_CONFIG](data);
    }
    [PRIVATE.SAVE_CONFIG](data){
        // Start web app if config file is exists
        if(fs.existsSync(config.configPath)) {
            // TODO: reload page, and initializing redis web app
            // Start redis-commander web server
            let app = new RedisCommander();
            app.startWebApp();
            this._loadUrl = config.loadUrl;
            return;
        }

        //Write config to cache/.redis-commander
        let fd = fs.openSync(config.configPath, "w+");
        if(!fd) return console.error("Create config file %s failed", config.configPath);
        if(typeof(data) !== "string"){
            try{
                data = JSON.stringify(data);
            }catch(e){
                console.error("Parse post data error:%j", e);
                let data = {continue: true};
                return this._win.webContents.send(WINDOW_EVENTS.MAIN, data);
            }
        }
        fs.writeSync(fd, data, 0, "utf8");
        fd.close();
    }
}

module.exports = Window;