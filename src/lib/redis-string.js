/*
 * @Author: Danielssssss 
 * @Date: 2017-12-10 15:20:41 
 * @Last Modified by: Danielssssss
 * @Last Modified time: 2017-12-10 15:42:38
 */

"use strict";

const PRIVATE = {
    METHODS:{
        GET: Symbol("_getString"),
        DEL: Symbol("_delString"),
        SET: Symbol("_setString"),
        
    },
    ATTRS: {
        REDIS: Symbol("_redis"),
    }
};

class RedisString{
    constructor(redis){
        this[PRIVATE.ATTRS.REDIS] = redis || null;
    }

    [PRIVATE.METHODS.GET](){}
    [PRIVATE.METHODS.SET](){}
    [PRIVATE.METHODS.DEL](){}
}
module.exports = RedisString;