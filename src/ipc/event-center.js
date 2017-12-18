/**
 * @author: Danielssssss 
 * @date: 2017-12-13 00:33:03 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-13 00:33:03 
 */

"use strict";

const EventEmitter = require("events").EventEmitter;
const {ipcMain} = require("electron");
const Protocol = require("./protocol");
const Dispatcher = require("./dispatcher");

const RedisConnector = require("../lib/redis-connector");
const RedisConfig = require("../lib/redis-config");
const RedisCmd = require("../lib/redis-cmd");
const RedisString = require("../lib/redis-string");
const RedisHash = require("../lib/redis-hash");

const _ = require("lodash");
const _async = require("async");

const PRIVATE = {
    METHODS: {
        ON_RP_EVENT: Symbol("_onRpEvent"),
        ON_RP_READY: Symbol("_onRpReady"),

        ON_REDIS_CONNECTED: Symbol("_onRedisConnected"),

        DISPATCHER: Symbol("_dispatcher"),
    },
    ATTRS: {
        REDIS_CFG: Symbol("_redisConfig"),
        REDIS_CONN: Symbol("_redisConnector"),
    }
};

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

const METHODS = [
    "get", "GET", 
    "put", "PUT",
    "delete", "DELETE",
    "post", "POST"
];


/**
 * @description Events center
 * @class EventCenter
 * @extends EventEmitter
 */
class EventCenter extends EventEmitter {
    constructor(app){
        super();

        this[PRIVATE.ATTRS.REDIS_CFG] = new RedisConfig();
        this[PRIVATE.ATTRS.REDIS_CONN]= new RedisConnector();
        
        this._dispatcher = new Dispatcher(this);

        this.RedisStr = new RedisString(this);
        this.RedisHash = new RedisHash(this);

        this._ran = false;
        this._app = app || {};
        this._win = null;
        this._connectors = [];

        //current client
        this.__client__ = null;
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
        ipcMain.on(EVENTS.SYNCHRONOUS_RP_MSG, this[PRIVATE.METHODS.SYNCHRONOUS_RP_MSG].bind(this));
    }

    [PRIVATE.METHODS.SYNCHRONOUS_RP_MSG](event, info){
        let proto = info.proto;
        let data = info.data || {};
        let client = null;
        
        /* eslint-disable */
        switch(proto){
            case Protocol.CONNECT_REDIS:
                this[PRIVATE.ATTRS.REDIS_CONN].createRedisClient(data, onResponse.bind({event: event}));
                break;
            
            case Protocol.DISCONNECT_REDIS:
                event.returnValue = {err: null, data: this[PRIVATE.ATTRS.REDIS_CONN].disconnectRedis(data.index)};
                break;

            case Protocol.GET_TOP_KEYS:
                if(!_.isNumber(data.index)) return event.returnValue = {err: "Index can't be empty", data: null};
                this.__client__ = this[PRIVATE.ATTRS.REDIS_CONN].clients[data.index];
                if(!this.__client__) event.returnValue = {err: "Not Found Client", data: null};
                RedisCmd.TOPKEYS({client: this.__client__, pattern: data.pattern || "*", limit: data.limit || 100}, onResponse.bind({event: event}));
                break;
            
            case Protocol.REDIS_OPERATIONS:
                if(!_.isNumber(data.index)) return event.returnValue = {err: "Index can't be empty", data: null};
                if(!data.key) return event.returnValue = {err: "The key is required", data: null};
                if(METHODS.indexOf(data.method) < 0) return event.returnValue = {err: `Invalid method:${data.method}`, data: null};
                this.__client__ = this[PRIVATE.ATTRS.REDIS_CONN].clients[data.index];
                this._dispatcher.do(data, onResponse.bind({event: event}));
                break;

            case Protocol.REDIS_COMMAND:
                if(!_.isNumber(data.index)) return event.returnValue = {err: "Index can't be empty", data: null};
                this.__client__ = this[PRIVATE.ATTRS.REDIS_CONN].clients[data.index];
                if(_.isEmpty(data.cmd)) return event.returnValue = {err: "The command is required", data: null};
                let arr = _.compact(data.cmd.indexOf(" ") ? data.cmd.split(" "): [data.cmd]);
                RedisCmd.SENDCOMMAND({
                    client: this.__client__, 
                    cmd: arr[0], 
                    args: arr.length > 1 ? _.slice(arr, 1, arr.length) : [],
                }, onResponse.bind({event: event}));
                break;
        }
        /* eslint-enable */
    }

    [PRIVATE.METHODS.ON_RP_READY](event, isReady){
        if(!isReady) return false;
        console.info("Loading config ...");
        let config = this[PRIVATE.ATTRS.REDIS_CFG].config;
        for(let i = 0; i < config.length; i++){
            config[i].isConnected = false;
        }
        return event.returnValue = config;
    }
}

const onResponse = function(err, result){
    this.event.returnValue = {
        err: _.isObject(err) ? err.message || err.stack : err,
        data: result || null
    };
};
module.exports = EventCenter;