define(function(require, exports, module) {
    var $ = require('jquery');
    var Dialog = require('dialog');

    var template = require('./alert.tpl');

    var Alert = Dialog.extend({

    });

    module.exports = Alert;
});