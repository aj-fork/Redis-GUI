/**
 * @author: Danielssssss 
 * @date: 2017-12-12 00:23:37 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-12 00:23:37 
 */

"use strict";

const electron = require("electron");
const {BrowserWindow} = electron;
const config = require("../config");
const _utils = require("./utils/util");


const PRIVATE = {
    SAVE_CONFIG: Symbol("_saveConfig"),

    // events handlers
    INIT_EVENT: Symbol("_initEvent"),
    ON_CLOSED: Symbol("_onClosed"),
    ON_RP_EVENT: Symbol("_onRendererEvent"),
};

const WINDOW_EVENTS = {
    CLOSED: "closed"
};

class Index {
    constructor(app){
        _utils.makeDefaultConfig();
        this._win = null;
        this._app = app;
    }

    buildWindow(){
        this._win = new BrowserWindow(config.window);
        this._app._ipc.loader(this._win);
        this[PRIVATE.INIT_EVENT]();
        this._win.loadURL(config.testUrl);
        this._win.webContents.openDevTools();
        this._win.show();
        return this._win;
    }

    setScreenSize(){
        let bounds = electron.screen.getAllDisplays()[0].bounds;
        config.window.height = bounds.height;
        config.window.width = bounds.width;
        return true;
    }



    [PRIVATE.INIT_EVENT](){
        if(!this._win) return false;
        this._win.on(WINDOW_EVENTS.CLOSED, this[PRIVATE.ON_CLOSED].bind(this));
    }
    [PRIVATE.ON_CLOSED](){
        this._win = null;
    }
}

module.exports = Index;