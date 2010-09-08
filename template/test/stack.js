/**
 * 表达式
 * @enum  
 */
var expr = {
    'if': 0,
    'else': 1,
    'for': 2,
    'in': 3
};

/**
 * 模板堆栈
 * @class  
 * @param {String} str 模板语法
 */
var stack = function(str){
    this.charactors = str.split('');
};

S.mix(stack.prototype, {

    /**
     * 获取栈内最高位元素
     * @public  
     * @return 返回栈内最高位元素
     */
    peek: function(){
        return this.charactors[this.charactors.length-1];
    },

    /**
     * 弹出最后一个元素
     * @public  
     * @return {Object} 返回弹出的元素
     */
    pop: function(){
        return this.charactors.pop();
    },

    /**
     * 往堆栈里添加元素
     * @public  
     * @param {Object} o 任意元素
     */
    push: function(o){
        this.charactors.push(o);
    },

    /**
     * 检查堆栈是否为空
     * @public  
     * @return {Boolean} 堆栈是否为空
     */
    isEmpty: function(){
        return this.charactors.length > 0;
    }

});

/**
 * 解析器
 * @class  
 */
var parser = function(str){
    self.stack = new stack(str);
};

S.mix(parser.prototype, {
    parse: function(data){
    }
});

/**
 * 各种模板处理的静态方法，作为语法集
 * @static  
 */
S.mix(parser, {

    /**
     * 解析表达式
     * @static
     * @public
     * @param {stack} 传入栈
     */
    expr: function(){
        //
    },

    /**
     * 解析变量
     * @static
     * @public
     * @param {static} 传入栈  
     */
    vari: function(){
        //
    }

});

var s = new stack('<li class="item"><div class="pic"><a title="{TITLE}" href="{EURL}" target="_blank"><img src="{TBGOODSLINK}"></a></div><div class="price"><strong>{GOODSPRICE}</strong></div><div class="title"><a title="{TITLE}" href="{EURL}" target="_blank">{TITLE}</a></div></li>');
//S.log(s.charactors);
