"use strict";

const {ipcRenderer} = require("electron");
const Protocol = require("../ipc/protocol");
const _ = require("lodash");
//const $ = require("./js/jquery-3.2.1.min");
/* global window */

window.nac = {test: true};

const EVENTS = {
    //main-process
    MP_EVENT: "mp-event",
    //renderer-process
    RP_EVENT: "rp-event",
    
    //preload script is ready state
    RP_READY: "rp-ready-to-work",
    RP_READY_RE: "rp-ready-to-work-re",
    
    //synchronous-rp-message
    SYNCHRONOUS_RP_MSG: "synchronous-rp-message",
};

const PRIVATE = {
    ATTRS : {
        CONFIG: Symbol("_config"),
        CLIENTS: Symbol("_clients"),
        IS_READY: Symbol("_isReady"),
    },
    METHODS: {
        SET_CLIENT: Symbol("_setClient"),
    }
};

class Preloader {
    constructor(){
        this[PRIVATE.ATTRS.CONFIG] = null;
        this[PRIVATE.ATTRS.CLIENTS] = null;
    }

    ready(){
        this[PRIVATE.ATTRS.CONFIG] = ipcRenderer.sendSync(EVENTS.RP_READY, true);
        this[PRIVATE.ATTRS.CLIENTS] = this[PRIVATE.ATTRS.CONFIG];
    }

    connect(index){
        if(!_.isNumber(index)){
            console.info("Index isn't allowed be non-number");
            return false;
        }

        let client = this[PRIVATE.ATTRS.CLIENTS][index];
        if(client.isConnected === true) return false;

        let info = {data: client};
        info.proto = Protocol.CONNECT_REDIS;
        let ret = ipcRenderer.sendSync(EVENTS.SYNCHRONOUS_RP_MSG, info);
        this[PRIVATE.METHODS.SET_CLIENT](ret.data);
        return true;
    }

    disconnect(index){
        if(!_.isNumber(index)){
            console.info("Index isn't allowed be non-number");
            return false;
        }

        let client = this[PRIVATE.ATTRS.CLIENTS][index];
        if(client.isConnected === false) return false;

        let info = {data: {index: client.index}};
        info.proto = Protocol.DISCONNECT_REDIS;
        let ret = ipcRenderer.sendSync(EVENTS.SYNCHRONOUS_RP_MSG, info);
        if(!_.isEmpty(ret.data)){
            if(ret.data.disconnected === true){
                this[PRIVATE.ATTRS.CLIENTS][index].isConnected = false;
                return true;
            }
        }
        return false;
    }

    /**
     * @description Get redis keys
     * @param {Object} opts {limit: 100, label: "", index: 0}
     * @return {Array} [{type: string, key: "user:id"}] 
     */
    getTopKeys(opts){
        opts = opts || {};
        if(_.isEmpty(opts)) return {err: "The options is required"};
        if(!opts.limit) opts.limit = 100;
        let info = {proto: Protocol.GET_TOP_KEYS, data: opts};
        let ret = ipcRenderer.sendSync(EVENTS.SYNCHRONOUS_RP_MSG, info);
        return ret;
    }

    /**
     * @description get value of redis key
     * @param {String} opts.key
     * @param {Number} opts.index
     * @return {Object}
     */
    getValueByKey(opts){
        opts = opts || {};
        if(_.isEmpty(opts)) return {err: "The options is required"};
        opts.method = "GET";
        let info = {proto: Protocol.REDIS_OPERATIONS, data: opts};
        let ret = ipcRenderer.sendSync(EVENTS.SYNCHRONOUS_RP_MSG, info);
        return ret;
    }

    get config(){
        return this[PRIVATE.ATTRS.CONFIG];
    }

    get clients(){
        return this[PRIVATE.ATTRS.CLIENTS];
    }

    [PRIVATE.METHODS.SET_CLIENT](opts){
        for(let i = 0; i < this[PRIVATE.ATTRS.CLIENTS].length; i++){
            let client = this[PRIVATE.ATTRS.CLIENTS][i];
            if(client.label === opts.label){
                for(let key in opts){
                    if(key === opts.label) continue;
                    client[key] = opts[key];
                }
            }
        }
    }
}

const preloader = new Preloader();
window.preloader = preloader;
preloader.ready();