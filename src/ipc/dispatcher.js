/**
 * @author: Danielssssss 
 * @date: 2017-12-15 23:16:12 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-15 23:16:12 
 */

"use strict";
const _async = require("async");
const _ = require("lodash");

class Dispatcher {
    constructor(app){
        this._app = app || null;
    }

    /**
     * @description The redis operation's dispatcher
     * @param {String} opts.key
     * @param {String} opts.method
     * @param {Function} callback(err, value)
     */
    do(opts, callback){
        _async.waterfall([
            (cb)=>{
                this._app.__client__.EXISTS(opts.key, cb);
            },
            (exists, cb)=>{
                if(!exists) return cb(`The key:${opts.key} doesn't exists`);
                this._app.__client__.TYPE(opts.key, cb);
            },
            (type, cb)=>{
                /* eslint-disable */
                switch(type){
                    case "string":
                        this._app.RedisStr.methods[opts.method](opts.key, cb);
                        break;

                    case "hash":
                        this._app.RedisHash.methods[opts.method](opts.key, cb);
                        break;
                }
                /* eslint-enable*/
            }
        ], callback);
    }
}

module.exports = Dispatcher;