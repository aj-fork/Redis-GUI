/**
 * @author: Danielssssss 
 * @date: 2017-12-12 20:29:29 
 * @date Last Modified by:   Danielssssss 
 * @date last Modified time: 2017-12-12 20:29:29 
 */

"use strict";

const debug = require("debug")("src:utils");
const path = require("path");
const config = require("../../config");
const fs = require("fs");
const _ = require("lodash");


const mkdirs = function(dir){
    if(!dir) return dir;
    if(!fs.existsSync(path.dirname(dir))) return mkdirs(path.dirname(dir));

    try{
        fs.mkdirSync(dir);
    }catch(e){
        debug("Create directory error:%s", e.stack || e.message || e);
    }
};

const makeDefaultConfig = function(){
    if(fs.existsSync(getConfigPath())) return true;

    mkdirs(config.redisConfigPath);
    //create .redis file
    let stream = fs.createWriteStream(getConfigPath());
    stream.end();
};
const sto = function(config){
    if(_.isObject(config)) return config;
    try {
        config = JSON.parse(config);
    }catch(e){
        console.error("String to Object error %s", e.stack || e.message || e);
        debug("String to Object error %s", e.stack || e.message || e);
    }
    return config;
};
const loadConfig = function(){
    let config = null;
    try{
        config = fs.readFileSync(getConfigPath(), {encoding: "utf8"});
    }catch(e){
        debug("Reading file error %s", e.stack || e.message || e);
    }
    if(_.isEmpty(config)) return null;
    return sto(config);
};
const getConfigPath = function(){
    return path.normalize(path.join(config.redisConfigPath, "/.redis"));
};

module.exports = {
    getConfigPath: getConfigPath,
    loadConfig: loadConfig,
    sto: sto,// String to object
    makeDefaultConfig: makeDefaultConfig,
    mkdirs: mkdirs,
};