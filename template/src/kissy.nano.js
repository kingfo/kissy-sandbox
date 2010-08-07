/**
 * @fileoverview Nano模板引擎，kissy版
 * @author yyfrankyy@gmail.com (文河)
 *
 * @license
 * Copyright (c) 2010 lifesinger, yyfrankyy
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
KISSY.add('Nano', function(S, undefined){
    /**
     * 模板引擎
     * 修改自 Nano Templates (Tomasz Mazur, Jacek Becela)
     * @see http://github.com/trix/nano/blob/master/jquery.nano.js
     * @constructor
     * @param templ 模板内容
     * @description
     * <dl>
     *     <dt>{obj.a.b.c}</dt>
     *     <dd>遍历<code>data.obj.a.b.c</code>的值进行替换</dd>
     *     <dt>!{obj.c.a}</dt>
     *     <dd>增加感叹号，如果data.obj.c.a不存在，将<code>!{obj.c.a}</code>替换为空</dd>
     * </dl>
     */
    S.Nano = function(templ){
        return {
            /**
             * 渲染方法
             * @param data 渲染模板的数据
             * @return {string} 渲染后文本串
             */
            render: function(data){
                return templ.replace(/(!?)(\{([\w\.]*)\})/g, function(str, clean, match, key){
                    var keys = key.split('.'), value = data[keys.shift()];
                    S.each(keys, function(key){
                        value = value[key];
                    });
                    return (value === null || value === undefined) ? (!!clean ? "" : match) : value;
                });
            }
        };
    };
});
