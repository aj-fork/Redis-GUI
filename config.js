"use strict";
const path = require("path");
const url = require("url");

exports.window = {
    width: 800, height: 600,
    show: false, title: "Redis-GUI",
    icon: null,
    webPreferences:{
        javascript:true,
        nodeIntegration:true,
        webSecurity: false,            
        experimentalFeatures:true,
        experimentalCanvasFeatures:true,
        preload: null,
    }
};
exports.window.icon = path.normalize(path.join(__dirname, "src/web/static/favicon.png"));
exports.window.webPreferences.preload = path.normalize(path.join(__dirname, "/src/rp/preloader.js"));

exports.redisConfigPath = path.normalize(path.join(__dirname, "/cache/"));
exports.testUrl = url.format({
    pathname: path.normalize(path.join(__dirname, "/test/views/index.html")),
    protocol: "file",
    slashes: true
});
exports.loadUrl = url.format({
    pathname: path.normalize(path.join(__dirname, "/src/web/views/index.html")),
    protocol: "file",
    slashes: true
});