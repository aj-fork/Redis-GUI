/**
* @author: Danielssssss 
* @date: 2017-12-14 01:07:26 
* @date Last Modified by:   Danielssssss 
* @date last Modified time: 2017-12-14 01:07:26 
*/
"use strict";

const _ = require("lodash");
const _async = require("async");


/**
* @description get redis keys
* @param {Object} opts 
* @param {Function} callback
* @return {Object} parsed keys
*/
const getTopKeys = function (opts, callback){
    _async.waterfall([
        (cb)=>{
            opts.client.KEYS(opts.pattern, cb);
        },
        (keys, cb)=>{
            if(_.isEmpty(keys)) return callback("Not Found Keys", keys);
            if(keys.length > opts.limit) keys = _.slice(keys, 0, opts.limit);
            const handler = (key, next)=>{
                opts.client.TYPE(key, (err, type)=>{
                    if(err) return next(`Type ${key} error: ${err.stack || err.message}`);
                    next(null, {type: type, key: key});
                });
            };
            _async.mapLimit(keys, keys.length, handler, cb);
        }
    ], callback);
};

module.exports = {
    topKeys: getTopKeys,
    TOPKEYS: getTopKeys,
};
