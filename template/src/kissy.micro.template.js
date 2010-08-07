/**
 * @fileoverview Simple JavaScript Template  
 * John Resig - http://ejohn.org/ - MIT Licensed
 */
KISSY.add('MicroTemplate', function(S, undefined){
    /**
     * 默认执行渲染操作的勾子
     * @const  
     */
    var DEFAULT_CLASS = '.KISSY_Micro_Template';
    S.MicroTemplate = function(data){
        var templ = S.get(DEFAULT_CLASS).innerHTML;

        var fn = new Function (
            '_ks_data',
            [
                "var p = [];", 
                "with(_ks_data) {",
                    "p.push('",
                        templ

                             //清除换行，空白字符变成一个空格
                             .replace(/[\r\t\n]/g, " ")

                             //把<%全部替换成\t
                             .split('<%').join("\t")

                             //把%>字符后面的非\t清除掉
                             .replace(/(^|%>)[^\t]*'/g, "$1\r")

                             //把<%=id%>声明的变量替换为',id,'
                             .replace(/\t=(.*?)%>/g, "',$1,'")

                             //清除多余的\t，换成');
                             .split("\t").join("');")

                             //结束上一个push，把下一个%>替换为push
                             .split("%>").join("p.push('")

                             //把换行换成'
                             .split("\r").join("\\'"),

                   "'); ",
                "}",
                "return p.join('');"
            ].join("")
        );
        return data ? fn(data) : fn;
    };
});
