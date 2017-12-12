"use strict";

const redis = require("redis");
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

class RedisCommander {
    constructor(){
        this._client = null;
        this._connections = [];

        this._config = null;
        this._args = {
            "redis-port": "",
            "redis-host":"",
            "redis-password": "",
            "redis-db": "",
            "root-pattern": "*"
        };
    }
}

module.exports = RedisCommander;
