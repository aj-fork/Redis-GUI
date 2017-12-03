"use strict";

const Redis = require("ioredis");
const app = require("../lib/app");
const myUtils = require("../lib/util");
const _ = require("lodash");
const config = require("../../config");

/* global console */

const PRIVATE = {
    CONNECT_TO_REDIS: Symbol("_connectToRedis"),
    SETUP_CONNECTION: Symbol("_setupConnection"),
    SETUP_CONFIG: Symbol("_setupConfig"),
    SETUP_DEFAULT_CONFIG: Symbol("_setupDefaultConfig"),

    //Redis events
    ON_REDIS_ERR: Symbol("_onRedisError"),
    ON_REDIS_END: Symbol("_onRedisEnd"),
    ON_REDIS_CONN: Symbol("_onRedisConnect"),
};

const REDIS_EVENTS = {
    ERROR: "error",
    END: "end",
    CONNECT: "connect"
};

class RedisCommander {
    constructor(){
        this._client = null;
        this._connections = [];
        this._connections.getLast = myUtils.getLast;

        this._config = null;
        this._args = {
            "redis-port": "",
            "sentinel-port": "",
            "redis-host":"",
            "sentinel-host":"",
            "redis-socket": "",
            "redis-password": "",
            "redis-db": "",
            "http-auth-username": "",
            "http-auth-password": "",
            "address": config.redisCommander.host,
            "port": config.redisCommander.port,
            "nosave": "",
            "save": "",
            "noload": "",
            "clear-config": false,
            "root-pattern": "*"
        };
    }

    startWebApp(){
        let args = this._args;
        let httpServerOptions = {
            webPort: args.port, 
            webAddress: args.address, 
            username: args["http-auth-username"], 
            password: args["http-auth-password"]
        };
        app(httpServerOptions, this._connections, args["nosave"], args["root-pattern"]);
    }
    
    setupConfig(){
        this._config = myUtils.getConfigSync(myUtils.getConfigPath());
        if(_.isEmpty(this._config)){
            this._config = {
                "sidebarWidth": 250,
                "locked": false,
                "CLIHeight": 50,
                "CLIOpen": false,
                "default_connections": []
            };
        }

        this[PRIVATE.SETUP_DEFAULT_CONFIG]();
    }

    [PRIVATE.SETUP_DEFAULT_CONFIG](){
        const handler = (connection)=>{
            let client = new Redis(connection.port, connection.host);
            client.label = connection.label;
            if(connection.dbIndex){
                client.options.db = connection.dbIndex;
            }
            this._connections.push(client);
            if (connection.password) {
                this._connections.getLast().auth(connection.password);
            }
            this[PRIVATE.SETUP_CONNECTION](this._connections.getLast(), connection.dbIndex);
        };
        _.forEach(this._config.default_connections, handler);
    }

    [PRIVATE.SETUP_CONNECTION](connection, db){
        if(this._client === null) return;
        this._client.on(REDIS_EVENTS.ERROR, this[PRIVATE.ON_REDIS_ERR].bind(this));
        this._client.on(REDIS_EVENTS.END, this[PRIVATE.ON_REDIS_END].bind(this));
        this._client.once(REDIS_EVENTS.CONNECT, this[PRIVATE.CONNECT_TO_REDIS].bind(this, connection, db));
    }
    [PRIVATE.ON_REDIS_ERR](err){
        if(err) console.error("Redis error: %j", err);
    }
    [PRIVATE.ON_REDIS_END](){
        console.info("Connection closed. Attempting to Reconnect...");
    }
    [PRIVATE.CONNECT_TO_REDIS](connection, db){
        connection.select(db, (err)=>{
            if(err) console.error(err);
            console.info(`Redis Connection ${connection.options.host}:${connection.options.port} Using Redis DB # ${connection.options.db}`);
        });
    }
}

module.exports = RedisCommander;
