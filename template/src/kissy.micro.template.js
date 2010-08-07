/**
 * @fileoverview Micro Template via John Resig, Translate to kissy version
 * @author yyfrankyy@gmail.com (文河)
 *
 * @license
 * Simple JavaScript Template  
 * John Resig - http://ejohn.org/ - MIT Licensed
 */
KISSY.add('MicroTemplate', function(S, undefined){

    /**
     * Micro Tempalte via John Resig
     * @see http://ejohn.org/blog/javascript-micro-templating/
     * @constructor  
     * @param templ 待渲染的模板
     * @description
     *
     * 模板替换逻辑如下：
     * 1. 把<% %>里的语句直接清除'<%'，'%>'标签进入new Function字符串
     * 2. 把<%= %>里的文本串，拆成一个一个参数push入文本栈
     * 3. 因为1的关系，所以所有脚本直接在function内部执行，if/for/while/do,while/等等
     *    <%%>内部的变量因为被拆分为文本push入栈，所以等于构造一个渲染方法
     *    这个方法执行<%%>里的逻辑，而<%=%>的逻辑则直接转换为文本进行push
     *
     * 如：
     * <%= user.name %> 则转为 p.push(user.name)
     *     如果没有user或者name，会报错，而且错误比较隐蔽，不易调试
     * <% if(true) %> 则转为 if(true) 如果没有大括号或者闭括号，则也会报错，跟原生js一致
     *
     * 即：
     * <% %>里的内容，直接过滤掉'<%','%>': <% blah %> => <% blah %>
     * <%=%>里的内容，换成一个一个的参数push入内部栈
     *     这个push过程受到<%%>的中断，所以必须拆开写，主要难点就在这里
     *     "<%= blah %> <%= blah2 %>" => p.push(blah, blah2)
     *
     * 使用with，使得模板里的参数不需要指定pass的对象名，直接在with作用域使用
     *     注意使用with总是有隐患的
     *
     * 因为引号没有做处理过滤，所以该模板对引号有要求，要么全部使用双引号，要么全部使用单引号
     */
    S.MicroTemplate = function(templ){
        S.log(
            templ

                 //清除换行，和tab，接下去用\t\r进行占位
                 .replace(/[\r\t\n]/g, " ")

                 //把<%全部替换成\t
                 .split('<%').join("\t")

                 //XXX 这一步是干嘛的？
                 .replace(/(^|%>)[^\t]*'/g, "$1\r")

                 //把<%=id%>声明的变量替换为: ',id,'
                 .replace(/\t=(.*?)%>/g, "',$1,'")

                 //非<%=的\t无用，把之前的push补上括号
                 //<%表示为真正的js语句，直接执行;
                 .split("\t").join("');")

                 //上一步替换掉<%，这一步继续替换%>为p.push
                 //条件/循环等语句内部局部作用域push
                 .split("%>").join("p.push('")

                 //把换行换成\'，结束多余的字符
                 .split("\r").join("\\'")
        );

        var render = new Function (
            '_ks_data',
            [
                "var p = [];", 
                "with(_ks_data) {",
                    "p.push('",
                        templ

                             //清除换行，和tab，接下去用\t\r进行占位
                             .replace(/[\r\t\n]/g, " ")

                             //把<%全部替换成\t
                             .split('<%').join("\t")

                             //XXX 这一步是干嘛的？
                             .replace(/(^|%>)[^\t]*'/g, "$1\r")

                             //把<%=id%>声明的变量替换为: ',id,'
                             .replace(/\t=(.*?)%>/g, "',$1,'")

                             //非<%=的\t无用，把之前的push补上括号
                             //<%表示为真正的js语句，直接执行;
                             .split("\t").join("');")

                             //上一步替换掉<%，这一步继续替换%>为p.push
                             //条件/循环等语句内部局部作用域push
                             .split("%>").join("p.push('")

                             //把换行换成\'，结束多余字符
                             .split("\r").join("\\'"),

                   "'); ",
                "}",
                "return p.join('');"
            ].join("")
        );

        return {

            /**
             * 渲染方法
             * @param data 渲染模板的数据
             * @return {string|function} 如果有数据，则返回渲染完毕的数据，否则返回解析方法
             */
            render: function(data){
                return data ? render(data) : render;
            }
        };
    };
});
