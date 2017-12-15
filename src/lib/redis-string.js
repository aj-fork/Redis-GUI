/*
 * @Author: Danielssssss 
 * @Date: 2017-12-10 15:20:41 
 * @Last Modified by: Danielssssss
 * @Last Modified time: 2017-12-16 00:33:33
 */

"use strict";
const _ = require("lodash");

const PRIVATE = {
    METHODS:{
        GET: Symbol("_getString"),
        DEL: Symbol("_delString"),
        SET: Symbol("_setString"),
        
        //checker
        CHECKER: Symbol("_checker"),
    },
    ATTRS: {
        REDIS: Symbol("_redis"),
    }
};

class RedisString{
    constructor(app){
        this._app = app || null;
        this._client = null;
    }

    /**
     * @description loading redis client into this._client
     * @param {*} client 
     */
    loader(client){
        if(!client) return false;
        this._client = client;
        return true;
    }

    /**
     * @description Get key of type string
     * @param {String} key
     * @param {Function} callback
     */
    getString(key, callback){
        if(!this[PRIVATE.METHODS.CHECKER]()) return callback("The loader(client) needs to be called");
        if(!key) return callback("key required");
        this._app.__client__.GET(key, callback);
    }

    get methods(){
        return {
            get: this.getString.bind(this),
            GET: this.getString.bind(this)
        };
    }

    [PRIVATE.METHODS.SET](){}
    [PRIVATE.METHODS.DEL](){}


    [PRIVATE.METHODS.CHECKER](){
        if(!this._app.__client__) return false;
        return true;
    }
}
module.exports = RedisString;