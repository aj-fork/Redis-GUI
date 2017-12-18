/*
 * @Author: Danielssssss 
 * @Date: 2017-12-11 17:34:43 
 * @Last Modified by: Danielssssss
 * @Last Modified time: 2017-12-19 01:09:30
 */

"use strict";

module.exports = {
    //hash
    GET_HASH                : 10000,
    GET_HASH_RE             : 10001,
    
    DEL_HASH                : 10002,
    DEL_HASH_RE             : 10003,
    
    //redis-connectors
    GET_CONNECTORS          : 20001,
    GET_CONNECTOR           : 20002,

    CONNECT_REDIS           : 20003,
    DISCONNECT_REDIS        : 20004,

    //config
    GET_CONFIG              : 30001,
    GET_CONFIG_RE           : 30002,
    UPDATE_CONFIG           : 30003,
    UPDATE_CONFIG_RE        : 30004,
    
    //
    //GET_KEYS                : 40001,
    GET_TOP_KEYS            : 40001,
    REDIS_OPERATIONS        : 40002,
    REDIS_COMMAND           : 40003,

};