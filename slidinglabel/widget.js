/**
 * 组件基类
 */

KISSY.add('widget', function(S, undefined) {
    var CLS_WIDGET = 'KS_Widget';

    function Widget(container, config) {
        var self = this;

        self.container = container;

        Widget.superclass.constructor.call(self, config);
    }
    S.extend(Widget, S.Base);
    S.Widget = Widget;
    /**
     * 自动渲染 container 元素内的所有 Widget
     * 默认钩子：<div class="KS_Widget" data-widget-type="SomeType" data-widget-config="{...}">
     * @method autoRender
     * @param hook  钩子名, class
     * @param container 容器, 默认为整个文档
     */
    Widget.autoRender = function(hook, container) {
        hook = '.' + (hook || CLS_WIDGET);

        S.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type in S) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    config = S.JSON.parse(config);
                    new S[type](elem, config);
                }
                catch(ex) {
                    S.log(type + '.autoRender: ' + ex, 'warn');
                }
            }
        });
    };

    S.augment(Widget, {
        
    });

}, { requires: ['core'] } );
