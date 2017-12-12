/**
 * @author: Danielssssss 
 * @date: 2017-12-13 00:33:03 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-13 00:33:03 
 */

"use strict";

const debug = require("debug")("ipc:event-center");
const EventEmitter = require("events").EventEmitter;
const {ipcMain} = require("electron");
const Protocol = require("./protocol");
const RedisConfig = require("../lib/redis-config");

const PRIVATE = {
    METHODS: {
        ON_RP_EVENT: Symbol("_onRpEvent"),
        ON_RP_READY: Symbol("_onRpReady"),
    },
    ATTRS: {
        REDIS_CFG: Symbol("_redisConfig"),
        REDIS_HASH: Symbol("_redisHash"),
        REDIS_SET: Symbol("_redisSet"),
        REDIS_STR: Symbol("_redisStr"),
        REDIS_LIST: Symbol("_redisList"),
    }
};

const EVENTS = {
    //main-process
    MP_EVENT: "mp-event",
    //renderer-process
    RP_EVENT: "rp-event",
    //preload script is ready state
    RP_READY: "rp-ready-to-work",
};


/**
 * @description Events center
 * @class EventCenter
 * @extends EventEmitter
 */
class EventCenter extends EventEmitter {
    constructor(app){
        super();
        this[PRIVATE.ATTRS.REDIS_CFG] = new RedisConfig();
        this._ran = false;
        this._app = app || {};
        this._win = null;
    }

    /**
     * @description loading window in
     * @argument {BrowserWindow} win
     */
    loader(win){
        this._win = win; 
    }

    /**
     * @description Start to listen events for rp-process
     */
    start(){
        if(this._ran) return false;
        this._ran = true;
        ipcMain.on(EVENTS.RP_READY, this[PRIVATE.METHODS.ON_RP_READY].bind(this));
        ipcMain.on(EVENTS.RP_EVENT, this[PRIVATE.METHODS.ON_RP_EVENT].bind(this));
    }

    /**
     * @description Sending config to renderer-process
     */
    updateConfig(){
        if(!this._win) return false;
        let info = {proto: Protocol.UPDATE_CONFIG, data: this[PRIVATE.ATTRS.REDIS_CFG].config};
        console.info("send config to rp");
        this._win.webContents.send(EVENTS.MP_EVENT, info);
    }

    [PRIVATE.METHODS.ON_RP_EVENT](event, data){
        data = data || {};
        let proto = data.proto;
        switch(proto){
        case Protocol.GET_HASH:
            //TODO: get hash value
            break;
        case Protocol.DEL_HASH:
            //TODO: delete hash value
            break;
        case Protocol.GET_CONNECTORS:
            break;
        case Protocol.GET_CONFIG:
            break;
        case Protocol.UPDATE_CONFIG_RE:
            console.info("updated = %s",data.updated);
            debug("Renderer-process config updated = %s and protocol = %d", data.updated, data.proto);
            break;
        }
    }

    [PRIVATE.METHODS.ON_RP_READY](event, isReady){
        if(!isReady) return false;
        console.info("Ready to update config");
        this.updateConfig();
    }
}
module.exports = EventCenter;