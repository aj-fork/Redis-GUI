"use strict";
const path = require("path");
const url = require("url");

exports.window = {
    width: 800, height: 600,
    show: false, title: "Redis-GUI",
    icon: path.join(__dirname, "src/web/static/favicon.png"),
    webPreferences:{
        javascript:true,
        nodeIntegration:true,
        webSecurity: false,            
        experimentalFeatures:true,
        experimentalCanvasFeatures:true,
        preload:path.normalize(path.join(__dirname, "/src/renderer-process/config.js")),
    }
};

exports.configPath = path.normalize(path.join(__dirname, "/cache/"));
exports.redisCommander = {
    port: 8081, host: "127.0.0.1"
};
exports.loadUrl = `http://127.0.0.1:${exports.redisCommander.port}`;
// Initializing config, run at first time
exports.initConfigUrl = url.format({
    pathname: path.normalize(path.join(__dirname, "/test/views/index.html")),
    protocol: "file",
    slashes: true
});