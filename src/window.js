"use strict";

const electron = require("electron");
const {ipcMain, BrowserWindow} = electron;
const config = require("../config");
const fs = require("fs");
const myUtils = require("./lib/util");
const Redis = require("ioredis");

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
    constructor(app){
        this._app = app || {};
        this._win = null;
        this._config = config.window;
        this._configPath = myUtils.getConfigPath();
        if(!this._configPath){
            return console.error(new Error("Nowhere to write .redis-commander config"));
        }
        if(fs.existsSync(this._configPath)){
            this._app.isConfigFileExist = true;
            this._isConfigFileExist = true;
            this._loadUrl = config.loadUrl;
        }else{
            this._app.isConfigFileExist = false;
            this._isConfigFileExist = false;
            this._loadUrl = config.initConfigUrl;
        }
    }

    buildWindow(){
        this._win = new BrowserWindow(this._config);
        this._win.loadURL(this._loadUrl);
        this[PRIVATE.INIT_EVENT]();
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
        //Auth data first & test for redis is available to connect
        if(data.length === 0) {
            return event.sender.send(WINDOW_EVENTS.MAIN, {err: true, message: "Invalid Params"});
        }
        let info = {};
        for(let i = 0; i < data.length; i++){
            info[data[i].name] = data[i].value;
        }
        
        let err = undefined;
        if(!info["redis-port"]) err = "Redis Port Required";
        if(!info["redis-host"]) err = "Redis Host Required";
        if(err !== undefined) {
            return event.sender.send(WINDOW_EVENTS.MAIN, {err: true, message: err});
        }
        let client = new Redis({
            port: info["redis-port"],
            host: info["redis-host"],
            family: 4,
            password: info["redis-password"] || "",
        });
        
        client.once("ready", ()=>{
            //console.info("Connect to server success, then go to next");
            client = null;
            this[PRIVATE.SAVE_CONFIG](info);
        });

        const onError = function(err){
            event.sender.send(WINDOW_EVENTS.MAIN, 
                {
                    err: true, 
                    message: `Connect to ${info["redis-host"]}:${info["redis-port"]} failed`,
                    errorStack: err.message
                }
            );
            client.disconnect();
            console.error(err);
        };
        client.on("error", onError);
    }
    [PRIVATE.SAVE_CONFIG](data){
        //Write config to cache/.redis-commander
        if(fs.existsSync(this._configPath)){
            fs.writeFileSync(this._configPath);
        }
        let fd = fs.openSync(this._configPath, "w+");
        if(!fd) return console.error("Create config file %s failed", this._configPath);
        let info = {
            "sidebarWidth":250,
            "locked":false,
            "CLIHeight":50,
            "CLIOpen":false,
            "default_connections":[
                {
                    "label": data["label"] || "Redis_1",
                    "host": data["redis-host"],
                    "port": data["redis-port"],
                    "password": data["redis-password"] || "",
                    "dbIndex": 0
                }
            ]
        };
        
        try{
            info = JSON.stringify(info);
        }catch(e){
            console.error("Parse post data error:%j", e);
        }

        fs.writeSync(fd, info, 0, "utf8");
        fs.close(fd, ()=>{});

        this._app.redisApp.setupConfig();
        this._app.redisApp.startWebApp(data);
        this._loadUrl = config.loadUrl;
        this._win.loadURL(this._loadUrl);
        //this._win.webContents.send(WINDOW_EVENTS.MAIN, {err: false, message:"Connect to server success, then go to next."});
    }
}

module.exports = Window;