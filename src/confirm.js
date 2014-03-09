define(function(require, exports, module) {
    var $ = require('jquery');
    var Dialog = require('./dialog');

    var template = require('./confirm.tpl');

    var Confirm = Dialog.extend({
        attrs: {
            title: '标题',
            message: '内容'
        },
        events: {
            'click [role=ok]': '_okButton',
            'click [role=cancel]': '_cancelButton'
        },

        setup: function() {
            var self = this;

            Dialog.prototype.setup.apply(self);

            self.set('content', template(model));
        },

        _okButton: function(event) {
            event.preventDefault();

            this.trigger('ok');
        },
        _cancelButton: function(event) {
            event.preventDefault();

            var self = this;

            self.trigger('cancel');
            self.hide();
        },


        _onChangeTitle: function(val) {
            this.$('[role=title]').html(val);
        },

        _onChangeMessage: function(val) {
            this.$('[role=message]').html(val);
        },

        _onChangeOkTpl: function(val) {
            this.$('[role=confirm]').html(val);
        },

        _onChangeCancelTpl: function(val) {
            this.$('[role=cancel]').html(val);
        }
    });

    module.exports = Confirm;
});