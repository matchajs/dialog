define(function(require, exports, module) {
    var $ = require('jquery');
    var Overlay = require('overlay');
    var Mask = require('mask');

    var mask = new Mask;

    var dialogTemplate = require('./dialog.tpl');

    var Dialog = Overlay.extend({
        attrs: {
            trigger: null, // 对话框触发元素

            content: null, // 对话框内容

            hasMask: true, // 是否有背景遮罩层，默认为 true

            width: 500, // 对话框宽度
            height: null, // 对话框高度
            zIndex: 9900, // 对话框zIndex

            template: dialogTemplate, // 模板

            // 定位配置
            align: {
                // element 的定位点，默认为中间
                elementPos: '50% 50%',

                // 基准定位元素的定位点，默认为中间
                targetPos: '50% 50%'
            },

            // 基本的动画效果，可取值 'fade'(渐隐显示)
            effect: '',

            // 动画的持续时间
            duration: 400
        },

        events: {
            'click [role=close]': '_close'
        },

        /**
         * 隐藏 mask
         * @private
         */
        _hideMask: function() {
            var self = this;

            if (!self.get('hasMask')) {
                return;
            }

            var dialogs = Dialog.allDialogs;

            dialogs.pop();

            var surplus = dialogs.length;
            if (surplus > 0) {
                var last = dialogs[surplus - 1];
                mask.set('zIndex', last.get('zIndex'));
                mask.el.insertBefore(last.el);
            } else {
                mask.hide();
            }
        },

        /**
         * 设置mask位置及zIndex
         * @private
         */
        _setMask: function() {
            var self = this;

            if (!self.get('hasMask')) {
                return;
            }

            mask.set('zIndex', self.get('zIndex')).show();
            mask.el.insertBefore(self.el);
        },

        _createIframe: function() {
            var self = this;

            self.$iframe = $('<iframe>', {
                src: 'javascript:"";',
                frameborder: 0,
                scrolling: 'no',
                allowTransparency: 'true',
                css: {
                    border: 'none',
                    width: '100%',
                    display: 'block',
                    height: '100%',
                    overflow: 'hidden'
                }
            }).appendTo(self.$contentEl);
        },

        _showIframe: function() {
            var self = thisl

            if (!self.iframe) {
                self._createIframe();
            }

            this.iframe.attr({
                src: this._fixUrl(),
                name: 'dialog-iframe' + new Date().getTime()
            }).one('load', function() {
                    // 如果 dialog 已经隐藏了，就不需要触发 onload
                    if (!self.get('visible')) {
                        return;
                    }
                });
        },

        /**
         * 触发器
         * @private
         */
        _setupTrigger: function() {
            var self = this;

            var $trigger = self.get('trigger');
            if (!$trigger) {
                return;
            }

            if (!($trigger instanceof $)) {
                $trigger = $($trigger);
            }

            $trigger.on('click', function(event) {
                event.preventDefault();

                // 标识当前点击的元素
                self.$currentTrigger = $(event.currentTarget);
                self.show();
            });

            setTabIndex($trigger);

            self.set('trigger', $trigger, {
                silent: true
            });
        },

        _setupEvents: function() {
            var self = this;

            $(document).on('keyup', function(event) {
                if (event.keyCode === 27) {
                    self.get('visible') && self.hide();
                }
            });
        },

        _onChangeVisible: function(val) {
            var self = this;

            if (val) {
                if (self.get('effect')) {
                    self.$el.fadeIn(self.get('duration'));
                } else {
                    self.$el.show();
                }
            } else {
                self.$el.hide();
            }
        },

        _onChangeContent: function(val) {
            var self = this;

            // 判断是否是 url 地址
            if (/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(val)) {
                self._isIframeContent = true;
            } else {
                var value;
                // 有些情况会报错
                try {
                    value = $(val);
                } catch (e) {
                    value = [];
                }

                var $contentEl = self.$contentEl;
                $contentEl.empty();
                if (value[0]) {
                    $contentEl.append(value);
                } else {
                    $contentEl.html(val);
                }
                // #38 #44
                self._setPosition();
            }
        },

        setup: function() {
            var self = this;

            Overlay.prototype.setup.apply(self);

            Dialog.allDialogs.push(self);

            self._setupTrigger();
            self._setupEvents();

            setTabIndex($el);

            return self;
        },

        /**
         * 显示对话框
         * @returns {Dialog}
         */
        show: function() {
            var self = this;

            if (self._isIframeContent) {
                self._showIframe();
            }

            Overlay.prototype.show.apply(self);

            // 设置mask
            self._setMask();

            // 焦点落到对话框上
            self.$el.focus();

            return self;
        },

        /**
         * 隐藏对话框
         * @returns {Dialog}
         */
        hide: function() {
            var self = this;

            Overlay.prototype.hide.apply(self);

            self._hideMask();

            self.$currentTrigger && self.$currentTrigger.focus();

            return self;
        },

        /**
         * 移除对话框
         * @returns {Dialog}
         */
        remove: function() {
            var self = this;

            self._hideMask();

            Dialog.prototype.remove.apply(self);

            return self;
        }
    });

    // 存放所有对话框实例
    Dialog.allDialogs = [];

    module.exports = Dialog;

    // Help
    function setTabIndex($el) {
        $el.attr('tabindex') == null && $el.attr('tabindex', -1);
    }
});