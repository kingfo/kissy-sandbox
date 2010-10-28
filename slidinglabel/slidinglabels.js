/**
 * KISSY SlidingLabels
 * @author 乔花<qiaohua@taobao.com>
 * @see http://danyi.codetea.co.uk/2010/03/16/sliding-label/
 */

KISSY.add('slidinglabels', function(S) {
    var DOM = S.DOM,
        Event = S.Event,
        POSITION = 'position', RELATIVE = 'relative', ABSOLUTE = 'absolute',
        PX = 'px', X = 'x', Y = 'y',

        /**
         * 默认配置信息
         */
        defaultConfig = {
            axis: 'x',          // 移动方向, 水平方向(x) or 垂直方向(y)
            position: [5, 5],   // px, 水平和垂直方向上, 相对于父元素的位置, x or [x, y], 不设置时, 取 0
            offset: 5,          // label 和 input 之间的距离
            zIndex: 99,         // zIndex
            duration: 0.2       // 动画速度
        };


    /**
     * @class SlidingLabels
     * @constructor
     * @param {Element} container
     * @param {Object} config
     */
    function SlidingLabels(container, config) {
        var self = this;

        if (!(self instanceof SlidingLabels)) {
            return new SlidingLabels(container, config);
        }

        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;

        /**
         * 配置选项
         * @type {Object}
         */
        self.config = config = S.merge(defaultConfig, config);
        config.position = S.makeArray(config.position);
        config.position[0] = config.position[0] || 0;
        config.position[1] = config.position[1] || 0;

        self._init();
    }
    
    S.SlidingLabels = SlidingLabels;

    S.augment(SlidingLabels, S.EventTarget, {
        /**
         * 初始化 label 状态及绑定 focus/blur 事件
         * @private
         */
        _init: function() {
            var self = this, config = self.config;

            self.container.all('label').each(function(elem) {
                var lab = new S.Node(elem),
                    area = S.one('#' + lab.attr('for')), prt, len;

                // 注意: 只取那些有 for 属性的 label
                if (!area) return;

                // label 的父元素设置为 relative
                prt = lab.parent();
                if (prt.css(POSITION) !== RELATIVE) {
                    prt.css({ 'position': RELATIVE });
                }

                lab.css({
                    'position' : ABSOLUTE,
                    // 默认把 label 移入输入框
                    'left' : config.position[0] + PX,
                    'top' : config.position[1] + PX,
                    'z-index' : config.zIndex
                });

                // 输入框有值时, 把 label 移出输入框
                len = S.trim(area.val()).length;
                if ( len > 0) {
                    self._css(lab);// or self._anim(lab); 
                }

                // 绑定事件
                self._bindUI(area, lab);
            });
        },

        /**
         * 绑定 focusin/focusout 事件
         * @param area {Node}
         * @param lab {Node}
         * @private
         */
        _bindUI: function(area, lab) {
            var self = this;

            area.on('focusin', function() {
                var len = S.trim(area.val()).length;

                if (!len) {
                    self._anim(lab);
                }
            }).on('focusout', function() {
                var len = S.trim(area.val()).length;

                if (!len) {
                    self._anim(lab, true);
                }
            });
        },

        /**
         * @private
         */
        _anim: function(lab, isDefault) {
            this._change('animate', lab, isDefault);
        },

        /**
         * @private
         */
        _css: function(lab, isDefault) {
            this._change('css', lab, isDefault);
        },

        /**
         * 输入区域是否有值, 对应改变 label 所在位置
         * @param fn {string} 'css' or 'animate'
         * @param lab {Node}
         * @param isDefault  {Boolean} 为 true 时, 表示没有值, 移入, 为 false, 表示有值, 移开
         * @private
         */
        _change: function(fn, lab, isDefault) {
            var self = this, config = self.config;

            if (config.axis == X) {
                lab[fn]({ 'left': (isDefault ? config.position[0] : -lab.width() - config.offset) + PX }, config.duration);
            } else if (config.axis == Y) {
                lab[fn]({ 'top': (isDefault ? config.position[1] : -lab.height() - config.offset) + PX }, config.duration);
            }
        }
    });

}, { requires: ['core'] });