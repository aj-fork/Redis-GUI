/**
 * @author: Danielssssss 
 * @date: 2017-12-11 18:31:22 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-11 18:31:22 
 */

"use strict";

class RedisHash {
    constructor(app){
        this._app = app || null;
    }

    getHash(key, callback){
        if(!key) return callback("The key is required");
        this._app.__client__.HGETALL(key, callback);
    }

    get methods(){
        return {
            get: this.getHash.bind(this),
            GET: this.getHash.bind(this),
        };
    }
}
module.exports = RedisHash;