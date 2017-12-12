/**
 * @author: Danielssssss 
 * @date: 2017-12-12 00:25:53 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-12 00:25:53 
 */

"use strict";

const debug = require("debug")("redis-connector");
const redis = require("redis");

const PRIVATE = {
    ATTRS: {
        OPTS: Symbol("_opts"),
        CONN: Symbol("_connector"),
    },
    METHODS: {
        INIT_EVENT: Symbol("_initEvent"),
        CREATE_CONNECTOR: Symbol("_createConnector"), 
    }
};

const REDIS_EVENTS = {
    READY: "ready",
    CONNECT: "connect",
    ERROR: "error",

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
        this._client = null;
        this[PRIVATE.METHODS.CREATE_CONNECTOR]();
        this[PRIVATE.METHODS.INIT_EVENT]();
    }

    get interfaces(){
        return this._client;
    }

    [PRIVATE.METHODS.CREATE_CONNECTOR](){
        this._client = redis.createClient(this._opts.port, this._opts.host);
    }
 
    [PRIVATE.METHODS.INIT_EVENT](){
        if(!this._client) return false;
        this._client.once(REDIS_EVENTS.READY, this[REDIS_EVENTS.ON_READY].bind(this));
        this._client.on(REDIS_EVENTS.CONNECT, this[REDIS_EVENTS.ON_CONNECT].bind(this));
        this._client.on(REDIS_EVENTS.ERROR, this[REDIS_EVENTS.ON_ERROR].bind(this));
    }

    //listener
    [REDIS_EVENTS.ON_READY](){
        debug("Connection is ready");
    }
    [REDIS_EVENTS.ON_CONNECT](){
        debug("Stream is connected to server %s:%s", this._opts.host, this._opts.port);
    }
    [REDIS_EVENTS.ON_ERROR](err){
        debug("Has error\n%O", err);
    }
}

module.exports = Redis;