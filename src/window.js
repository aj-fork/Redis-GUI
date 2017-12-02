"use strict";

const {BrowserWindow} = require("electron");
const config = require("../config").window;
const path = require("path");
const url = require("url");

const PRIVATE = {
    INIT_EVENT: Symbol("_initEvent"),
    ON_CLOSED: Symbol("_onClosed"),
    SET_CONFIG: Symbol("_setConfig"),
};

const WINDOW_EVENTS = {
    CLOSED: "closed",
};

class Window {
    constructor(){
        this._win = null;
        this._config = config;
        this[PRIVATE.SET_CONFIG]();
    }

    buildWindow(){
        this._win = new BrowserWindow(this._config);
        // let file = url.format({
        //     pathname: path.normalize(path.join(__dirname, "../test/views/index.html")),
        //     protocol: "file",
        //     slashes: true
        // });
        // this._win.loadURL(file);
        this._win.loadURL("http://127.0.0.1:8081");
    }

    showWindow(){
        //this._win.webContents.openDevTools();
        this._win.show();
    }

    [PRIVATE.INIT_EVENT](){
        if(!this._win) return;
        this._win.on(WINDOW_EVENTS.CLOSED, this[PRIVATE.ON_CLOSED].bind(this));
    }
    [PRIVATE.ON_CLOSED](){
        this._win = null;
    }
    [PRIVATE.SET_CONFIG](){
        
    }
}

module.exports = Window;