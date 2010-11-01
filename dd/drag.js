/**
 * dd support for kissy ,drag for dd
 * @author:yiminghe@gmail.com
 */
KISSY.add("dd-drag", function() {
    var S = KISSY,
        KE = S.Editor,
        Event = S.Event,
        UA = S.UA,
        DOM = S.DOM,
        Node = S.Node;

    var DDM = S.DD.DDM;

    function normalElDom(el) {
        return   el[0] || el;
    }

    function equals(e1, e2) {
        //全部为空
        if (!e1 && !e2)return true;
        //一个为空，一个不为空
        if (!e1 || !e2)return false;
        e1 = normalElDom(e1);
        e2 = normalElDom(e2);
        return e1 === e2;
    }

    var unselectable =
        UA.gecko ?
            function(el) {
                el = normalElDom(el);
                el.style.MozUserSelect = 'none';
            }
            : UA.webkit ?
            function(el) {
                el = normalElDom(el);
                el.style.KhtmlUserSelect = 'none';
            }
            :
            function(el) {
                el = normalElDom(el);
                if (UA.ie || UA.opera) {
                    var
                        e,
                        i = 0;

                    el.unselectable = 'on';

                    while (( e = el.all[ i++ ] )) {
                        switch (e.tagName.toLowerCase()) {
                            case 'iframe' :
                            case 'textarea' :
                            case 'input' :
                            case 'select' :
                                /* Ignore the above tags */
                                break;
                            default :
                                e.unselectable = 'on';
                        }
                    }
                }
            };


    /*
     拖放纯功能类
     */
    function Draggable() {
        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
        self._init();
    }

    Draggable.ATTRS = {
        //拖放节点
        node:{},
        //handler 集合，注意暂时必须在 node 里面
        handlers:{value:{}}
    };

    S.extend(Draggable, S.Base, {
        _init:function() {
            var self = this,
                node = self.get("node"),
                handlers = self.get("handlers");
            //DDM.reg(node);
            if (S.isEmptyObject(handlers)) {
                handlers[node[0].id] = node;
            }
            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                var hl = handlers[h],ori = hl.css("cursor");
                if (!equals(hl, node)) {
                    if (!ori || ori === "auto")
                        hl.css("cursor", "move");
                    //ie 不能被选择了
                    unselectable(hl);
                }
            }
            node.on("mousedown", self._handleMouseDown, self);
        },
        _check:function(t) {
            var handlers = this.get("handlers");
            for (var h in handlers) {
                if (!handlers.hasOwnProperty(h)) continue;
                if (handlers[h].contains(t)
                    ||
                    //子区域内点击也可以启动
                    equals(handlers[h], t)) return true;
            }
            return false;
        },

        /**
         * 鼠标按下时，查看触发源是否是属于 handler 集合，
         * 保存当前状态
         * 通知全局管理器开始作用
         * @param ev
         */
        _handleMouseDown:function(ev) {
            var self = this,
                t = new Node(ev.target);
            if (!self._check(t)) return;
            //chrome 阻止了 flash 点击？？
            if (!UA.webkit) {
                //firefox 默认会拖动对象地址
                ev.preventDefault();
            }
            //
            DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self.startMousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
            self.set("diff", self._diff);

        },
        _move:function(ev) {
            var self = this,
                diff = self.get("diff"),
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;

            this.fire("move", {
                left:left,
                top:top
            });
        },
        _end:function() {
            this.fire("end");
        },
        _start:function() {
            this.fire("start");
        }

    });

    /*
     拖放实体，功能反应移动时，同时移动节点
     */


    S.DD.Draggable = Draggable;

});