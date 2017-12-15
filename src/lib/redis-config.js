/**
 * @author: Danielssssss 
 * @date: 2017-12-12 21:15:22 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-12 21:15:22 
 */

"use strict";
const _utils = require("../utils/util");
const _ = require("lodash");

const PRIVATE = {
    ATTRS: {
        CONFIG: Symbol("_config"),
    }
};

class RedisConfig {
    constructor(){
        this[PRIVATE.ATTRS.CONFIG] = _utils.loadConfig() || [];
    }

    /**
     * @description The redis config details
     */
    get config(){
        return this[PRIVATE.ATTRS.CONFIG];
    }

    /**
     * @description Reload config & assign it to attributes
     */
    update(){
        this[PRIVATE.ATTRS.CONFIG] = _utils.loadConfig();
    }

    /**
     * @description get config by (index) or (host&port) from local cache
     * @param {Object} opts
     * @return {Object} config object
     */
    getConfig(opts){
        opts = opts || {};
        if(_.isEmpty(opts)) return null;
        return _.find(this[PRIVATE.ATTRS.CONFIG], {port: opts.port, host: opts.host});
    }
}
module.exports = RedisConfig;