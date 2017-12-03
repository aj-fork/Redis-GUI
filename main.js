"use strict";

const {app, globalShortcut, BrowserWindow} = require("electron");
const Window = require("./src/window");
const RedisApp = require("./src/bin/redis-commander");

const APP_EVENTS = {
    READY: "ready",
    ALL_CLOSED: "window-all-closed",
};

const PRIVATE = {
    INIT_EVENT: Symbol("_initEvent"),
    ON_READY: Symbol("_onReady"),
    ALL_CLOSED: Symbol("_allClosed"),
    REGISTER_SHORTCUT: Symbol("_registerShortcut"),
};

const SHORTCUTS = {
    OPEN_DEV_TOOL: process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
    RELOAD_PAGE: process.platform === "darwin" ? "Cmd+R" : "Ctrl+R",
};

class Application {
    constructor(){
        this.window = new Window();
        this.redisApp = new RedisApp();
    }

    start(){
        this.redisApp.setupConfig();
        this.redisApp.startWebApp();
        this[PRIVATE.INIT_EVENT]();
    }

    [PRIVATE.INIT_EVENT](){
        app.on(APP_EVENTS.READY, this[PRIVATE.ON_READY].bind(this));
        app.on(APP_EVENTS.ALL_CLOSED, this[PRIVATE.ALL_CLOSED].bind(this));
    }
    [PRIVATE.ON_READY](){
        this.window.setScreenSize();
        this.window.buildWindow();
        this.window.showWindow();
        this[PRIVATE.REGISTER_SHORTCUT]();
    }
    [PRIVATE.ALL_CLOSED](){
        if(process.platform !== "darwin"){
            app.quit();
        }
    }
    [PRIVATE.REGISTER_SHORTCUT](){
        globalShortcut.register(SHORTCUTS.OPEN_DEV_TOOL, ()=>{
            let win = BrowserWindow.getFocusedWindow();
            if(!win) return;
            if(win.webContents.isDevToolsOpened()) {
                return win.webContents.closeDevTools();
            }
            win.webContents.openDevTools();
        });
        globalShortcut.register(SHORTCUTS.RELOAD_PAGE, ()=>{
            let win = BrowserWindow.getFocusedWindow();
            if(!win) return;
            win.reload();
        });
    }
}

const application = new Application();
application.start();