/**
 * @author: Danielssssss 
 * @date: 2017-12-12 00:25:53 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-12 00:25:53 
 */

"use strict";

const debug = require("debug")("redis-connector");
const redis = require("redis");
const _ = require("lodash");

const PRIVATE = {
    ATTRS: {
        OPTS: Symbol("_opts"),
        CONN: Symbol("_connector"),
    },
    METHODS: {
        INIT_EVENT: Symbol("_initEvent"),
        CREATE_CONNECTOR: Symbol("_createConnector"),
        IS_CREATED: Symbol("_isCreated"),
    }
};

const REDIS_EVENTS = {
    READY: "ready",
    CONNECT: "connect",
    ERROR: "error",
    END: "end",

    //listener
    ON_READY: Symbol("_onReady"),
    ON_CONNECT: Symbol("_onConnect"),
    ON_ERROR: Symbol("_onError"),
};


class Redis {
    /**
     * @description Generating a redis connector
     * @param {Object} opts {host: "", port: "", password: "", ...}
     * @constructor
     */
    constructor(opts){
        this._opts = opts || {};
        this._clients = [];
        if(!_.isEmpty(opts)){
            this[PRIVATE.METHODS.CREATE_CONNECTOR]();
        }
    }

    /**
     * @description Redis clients 
     * @return {Array} Array(redis client)
     */
    get clients(){
        return this._clients;
    }

    /**
     * @description Create redis client
     * @param {*} opts 
     */
    createRedisClient(opts, next){
        opts = opts || {};
        if(_.isEmpty(opts)) return null;
        this._opts = opts;
        this[PRIVATE.METHODS.CREATE_CONNECTOR](next);
    }

    /**
     * @description disconnect redis
     * @param {Number} index
     * @return Object 
     */
    disconnectRedis(index){
        if(!_.isNumber(index)) return {index: index, disconnected: false};
        this._opts.port = this._clients[index].port;
        this._opts.host = this._clients[index].host;
        this._clients[index].quit();
        return {index: index, disconnected: true};
    }

    [PRIVATE.METHODS.CREATE_CONNECTOR](next){
        if(this[PRIVATE.METHODS.IS_CREATED]()) return next("The client is created which doesn't to create again");
        let client = redis.createClient(this._opts.port, this._opts.host);
        let label = `${this._opts.host}:${this._opts.port}`;
        if(this._opts.label) label = this._opts.label;
        client.label = label;
        client.index = this._clients.length;
        client.port = this._opts.port;
        client.host = this._opts.host;
        client.once(REDIS_EVENTS.READY, ()=>{
            console.info("Redis client is ready");
            this._clients[client.index] = client;
            next(null, {label: client.label, index: client.index, isConnected: true});
        });
        client.on(REDIS_EVENTS.CONNECT, ()=>{
            console.info("Redis %s:%s is connected", this._opts.host, this._opts.port);
        });
        client.on(REDIS_EVENTS.ERROR, (err)=>{
            console.info("Connect to redis %s:%s error:%s", this._opts.host, this._opts.port, err.stack || err.message);
            next(null, {label: client.label, index: client.index, isConnected: false});
            client.end(true);
            client = null;
        });
        client.on(REDIS_EVENTS.END, ()=>{
            console.info("Connection %s:%s is disconnected by client", this._opts.host, this._opts.port);
        });
    }

    [PRIVATE.METHODS.IS_CREATED](){
        if(this._clients.length === 0) return false;
        let label = this._opts.label ? this._opts.label : `${this._opts.host}:${this._opts.port}`;
        for(let i = 0; i < this._clients.length; i++){
            if(this._clients[i].label === label) return true;
        }
        return false;
    }
}

module.exports = Redis;