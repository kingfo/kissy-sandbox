

/**
 * author - lijing00333@163.com 拔赤
 */


KISSY.add('calendar',function(S){

	S.namespace('S.Calendar');

	S.Calendar = function(){
		this._init.apply(this,arguments);
	};
	S.mix(S.Calendar.prototype,{
		_init:function(id,config){
			var self = this;
			self.id = self.C_Id = id;
			self._buildParam(config);
			//形成container
			/*
				self.con，日历的容器
				self.id   传进来的id
				self.C_Id 永远代表日历容器的ID
			*/
			if(!self.popup){
				self.con = S.one('#'+id);
			} else {
				var trigger = S.one('#'+id);
				self.trigger = trigger;
				self.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
				self.con = S.Node('<div id="'+self.C_Id+'"></div>');
				S.one('body').append(self.con);
				self.con.css({
					'top':'0px',
					'position':'absolute',
					'background':'white',
					'visibility':'hidden'
				});
			}
			
			//创建事件中心
			var EventFactory = new Function;
			S.augment(EventFactory, S.EventTarget);
			var eventCenter = new EventFactory();
			S.mix(self,eventCenter);

			//self._buildEventCenter();
			self.render();
			self._buildEvent();
			return this;
		},

		render:function(o){
			var self = this;
			var o = o || {};
			self._parseParam(o);
			self.ca = [];

			self.con.addClass('c-call clearfix multi-'+self.pages);
			self.con.html('');

			for(var i = 0,_oym = [self.year,self.month]; i<self.pages;i++){
				if(i == 0){
					var _prev = true;
				}else{
					var _prev = false;
					_oym = self._computeNextMonth(_oym);
				}
				if(i == (self.pages - 1)){
					var _next = true;
				}else {
					var _next = false;	
				}
				self.ca.push(new self.Page({
					year:_oym[0],
					month:_oym[1],
					prev_arrow:_prev,
					next_arrow:_next,
					showTime:self.showTime
				},self));

					
				self.ca[i].render();
			}
			return this;

		},
		/**
		 * 计算d天的前几天或者后几天，返回date
		 */
		showdate:function(n,d){
			var uom = new Date(d-0+n*86400000);
			uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
			return new Date(uom);
		},
		/**
		 * 创建日历外框的事件
		 */
		_buildEvent:function(){
			var self = this;
			if(!self.popup)return this;
			//点击空白
			//flush event
			for(var i = 0;i<self.EV.length;i++){
				if(typeof self.EV[i] != 'undefined'){
					self.EV[i].detach();
				}
			}
			//TODO 我更期望通过S.one('document')来得到对整个文档的监听
			self.EV[0] = S.one('body').on('click',function(e){
				//TODO e.target是裸的节点，这句不得不加，虽然在逻辑上并无特殊语义
				e.target = S.Node(e.target);
				//点击到日历上
				if(e.target.attr('id') == self.C_Id)return;
				if((e.target.hasClass('next')||e.target.hasClass('prev'))
					&& e.target[0].tagName == 'A')	return;
				//点击在trigger上
				if(e.target.attr('id') == self.id)return;
				if(!S.DOM.contains(S.one('#'+self.C_Id),e.target)){
					self.hide();
				}
			});
			//点击触点
			/*
				Y.one('#'+self.id) = self.trigger
			*/
			for(var i = 0;i<self.triggerType.length;i++){
				
				self.EV[1] = S.one('#'+self.id).on(self.triggerType[i],function(e){
					e.target = S.Node(e.target);
					e.preventDefault();
					//如果focus和click同时存在的hack
					S.log(e.type);
					var a = self.triggerType;
					if(S.inArray('click',a) && S.inArray('focus',a)){//同时含有
						if(e.type == 'focus'){
							self.toggle();
						}
					}else if(S.inArray('click',a) && !S.inArray('focus',a)){//只有click
						if(e.type == 'click'){
							self.toggle();
						}
					}else if(!S.inArray('click',a) && S.inArray('focus',a)){//只有focus
						setTimeout(function(){//为了跳过document.onclick事件
							self.toggle();
						},170);
					}else {
						self.toggle();
					}
						
				});

			}
			return this;
		},
		toggle:function(){
			var self = this;
			if(self.con.css('visibility') == 'hidden'){
				self.show();
			}else{
				self.hide();
			}
		},


		/**
		 * 显示 
		 */
		show:function(){
			var self = this;
			self.con.css('visibility','');
			var _x = self.trigger.offset().left;
			//KISSY得到DOM的width是innerWidth，这里期望得到outterWidth
			var height = self.trigger[0].offsetHeight || self.trigger.height();
			var _y = self.trigger.offset().top+height;
			self.con.css('left',_x.toString()+'px');
			self.con.css('top',_y.toString()+'px');
			return this;
		},
		/**
		 * 隐藏 
		 */
		hide:function(){
			var self = this;
			self.con.css('visibility','hidden');
			return this;
		},
		/**
		 * 创建参数列表
		 */
		_buildParam:function(o){
			var self = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			self.date = (typeof o.date == 'undefined' || o.date == null)?new Date():o.date;
			self.selected = (typeof o.selected == 'undefined' || o.selected == null)?self.date:o.selected;
			self.startDay = (typeof o.startDay == 'undefined' || o.startDay == null)?(7-7):(7-o.startDay)%7;//1,2,3,4,5,6,7
			self.pages = (typeof o.pages == 'undefined' || o.pages == null)?1:o.pages;
			self.closable = (typeof o.closable == 'undefined' || o.closable == null)?false:o.closable;
			self.rangeSelect = (typeof o.rangeSelect == 'undefined' || o.rangeSelect == null)?false:o.rangeSelect;
			self.minDate = (typeof o.minDate == 'undefined' || o.minDate == null)?false:o.minDate;
			self.maxDate = (typeof o.maxDate == 'undefined' || o.maxDate == null)?false:o.maxDate;
			self.multiSelect = (typeof o.multiSelect== 'undefined' || o.multiSelect == null)?false:o.multiSelect;
			self.navigator = (typeof o.navigator == 'undefined' || o.navigator == null)?true:o.navigator;
			self.arrow_left = (typeof o.arrow_left == 'undefined' || o.arrow_left == null)?false:o.arrow_left;
			self.arrow_right = (typeof o.arrow_right == 'undefined' || o.arrow_right == null)?false:o.arrow_right;
			self.popup = (typeof o.popup == 'undefined' || o.popup== null)?false:o.popup;
			self.showTime = (typeof o.showTime == 'undefined' || o.showTime == null)?false:o.showTime;
			self.triggerType = (typeof o.triggerType == 'undefined' || o.triggerType == null)?['click']:o.triggerType;
			if(typeof o.range != 'undefined' && o.range != null){
				var s = self.showdate(1,new Date(o.range.start.getFullYear()+'/'+(o.range.start.getMonth()+1)+'/'+(o.range.start.getDate())));
				var e = self.showdate(1,new Date(o.range.end.getFullYear()+'/'+(o.range.end.getMonth()+1)+'/'+(o.range.end.getDate())));
				self.range = {
					start:s,
					end:e
				};
				//alert(Y.dump(self.range));
			}else {
				self.range = {
					start:null,
					end:null
				};
			}
			self.EV = [];
			return this;
		},

		/**
		 * 过滤参数列表
		 */
		_parseParam:function(o){
			var self = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				self[i] = o[i];
			}
			self._handleDate();
			return this;
		},

		/**
		 * 模板函数，应当在base中 
		 */
		_templetShow : function(templet, data){
			var self = this;
			if(data instanceof Array){
				var str_in = '';
				for(var i = 0;i<data.length;i++){
					str_in += arguments.callee(templet,data[i]);
				}
				templet = str_in;
			}else{
				var value_s = templet.match(/{\$(.*?)}/g);
				if(data !== undefined && value_s != null){
					for(var i=0, m=value_s.length; i<m; i++){
						var par = value_s[i].replace(/({\$)|}/g, '');
						value = (data[par] !== undefined) ? data[par] : '';
						templet = templet.replace(value_s[i], value);
					}
				}
			}
			return templet;
		},
		/**
		 * 处理日期
		 */
		_handleDate:function(){
			var self = this;
			var date = self.date;
			self.weekday= date.getDay() + 1;//星期几 //指定日期是星期几
			self.day = date.getDate();//几号
			self.month = date.getMonth();//月份
			self.year = date.getFullYear();//年份
			return this;
		},
		//get标题
		_getHeadStr:function(year,month){
			return year.toString() + '年' + (Number(month)+1).toString() + '月';
		},
		//月加
		monthAdd:function(){
			var self = this;
			if(self.month == 11){
				self.year++;
				self.month = 0;
			}else{
				self.month++;
			}
			self.date = new Date(self.year.toString()+'/'+(self.month+1).toString()+'/'+self.day.toString());
			return this;
		},
		//月减
		monthMinus:function(){
			var self = this;
			if(self.month == 0){
				self.year-- ;
				self.month = 11;
			}else{
				self.month--;
			}
			self.date = new Date(self.year.toString()+'/'+(self.month+1).toString()+'/'+self.day.toString());
			return this;
		},
		//裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
		_computeNextMonth:function(a){
			var self = this;
			var _year = a[0];
			var _month = a[1];
			if(_month == 11){
				_year++;
				_month = 0;
			}else{
				_month++;
			}
			return [_year,_month];
		},

		//处理日期的偏移量
		_handleOffset:function(){
			var self = this,
				data= ['日','一','二','三','四','五','六'],
				temp = '<span>{$day}</span>',
				offset = self.startDay,
				day_html = '',
				a = [];
			for(var i = 0;i<7;i++){
				a[i] = {
					day:data[(i-offset+7)%7]
				};
			}
			day_html = self._templetShow(temp,a);

			return {
				day_html:day_html
			};
		},
		//处理起始日期,d:Date类型
		_handleRange : function(d){
			var self = this;
			if((self.range.start == null && self.range.end == null )||(self.range.start != null && self.range.end != null)){
				self.range.start = d;
				self.range.end = null;
				self.render();
			}else if(self.range.start != null && self.range.end == null){
				self.range.end = d;
				if(self.range.start.getTime() > self.range.end.getTime()){
					var __t = self.range.start;
					self.range.start = self.range.end;
					self.range.end = __t;
				}
				self.fire('rangeSelect',self.range);
				self.render();
			}
			return this;
		},
		//constructor 
		/**
		 * TimeSelector只支持选择，不支持初始化
		 */
		TimeSelector:function(ft,fathor){
			//属性------------------
			this.fathor = fathor;
			//this.fcon = ft.ancestor('.c-box');//cc容器
			this.fcon = ft.parent('.c-box');
			this.popupannel = this.fcon.one('.selectime');//点选时间的弹出层
			//this.popupannel = S.query('.selectime',this.fcon);
			if(typeof fathor._time == 'undefined'){//确保初始值和当前时间一致
				fathor._time = new Date();
			}
			this.time = fathor._time;
			this.status = 's';//当前选择的状态，'h','m','s'依次判断更新哪个值
			this.ctime = S.Node('<div class="c-time">时间：<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
			this.button = S.Node('<button class="ct-ok">确定</button>');
			//小时
			this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
			//分钟
			this.m_a = ['00','10','20','30','40','50'];
			//秒
			this.s_a = ['00','10','20','30','40','50'];
					

			//接口----------------
			/**
			 * 创建相应的容器html，值均包含在a中
			 * 参数：要拼装的数组
			 * 返回：拼好的innerHTML,结尾还要带一个关闭的a
			 * 
			 */
			this.parseSubHtml = function(a){
				var in_str = '';
				for(var i = 0;i<a.length;i++){
					in_str += '<a href="javascript:void(0);" class="item">'+a[i]+'</a>';
				}
				in_str += '<a href="javascript:void(0);" class="x">x</a>';
				return in_str;
			};
			/**
			 * 显示selectime容器
			 * 参数，构造好的innerHTML
			 */
			this.showPopup= function(instr){
				var self = this;
				this.popupannel.html(instr);
				this.popupannel.removeClass('hidden');
				var status = self.status;
				var _con = self.ctime;
				self.ctime.all('span').removeClass('on');
				switch(status){
					case 'h':
						self.ctime.all('.h').addClass('on');
						break;
					case 'm':
						self.ctime.all('.m').addClass('on');
						break;
					case 's':
						self.ctime.all('.s').addClass('on');
						break;
				}
			};
			/**
			 * 隐藏selectime容器
			 */
			this.hidePopup= function(){
				this.popupannel.addClass('hidden');
			};
			/**
			 * 不对其做更多的上下文假设，仅仅根据time显示出来
			 */
			this.render = function(){
				var self = this;
				var h = self.get('h');
				var m = self.get('m');
				var s = self.get('s');
				self.fathor._time = self.time;
				self.ctime.all('.h').html(h);
				self.ctime.all('.m').html(m);
				self.ctime.all('.s').html(s);
				return self;
			};
			//这里的set和get都只是对time的操作，并不对上下文做过多假设
			/**
			 * set(status,v)
			 * h:2,'2'
			 */
			this.set = function(status,v){
				var self = this;
				var v = Number(v);
				switch(status){
					case 'h':
						self.time.setHours(v);
						break;
					case 'm':
						self.time.setMinutes(v);
						break;
					case 's':
						self.time.setSeconds(v);
						break;
				}
				self.render();
			};
			/**
			 * get(status)
			 */
			this.get = function(status){
				var self = this;
				var time = self.time;
				switch(status){
					case 'h':
						return time.getHours();
						break;
					case 'm':
						return time.getMinutes();
						break;
					case 's':
						return time.getSeconds();
						break;
				}
			};

			/**
			 * add()
			 * 状态值代表的变量增1
			 */
			this.add = function(){
				var self = this;
				var status = self.status;
				var v = self.get(status);
				v++;
				self.set(status,v);
			};
			/**
			 * minus()
			 * 状态值代表的变量增1
			 */
			this.minus= function(){
				var self = this;
				var status = self.status;
				var v = self.get(status);
				v--;
				self.set(status,v);
			};
			

			
			//构造---------
			this._init = function(){
				var self = this;
				ft.html('').append(self.ctime);
				ft.append(self.button);
				self.render();
				self.popupannel.on('click',function(e){
					var el = S.Node(e.target);
					if(el.hasClass('x')){//关闭
						self.hidePopup();
						return;
					}else if(el.hasClass('item')){//点选一个值
						var v = Number(el.html());
						self.set(self.status,v);
						self.hidePopup();
						return;
					}
				});
				//确定的动作
				self.button.on('click',function(e){
					//初始化读取父框的date
					var d = typeof self.fathor.dt_date == 'undefined'?self.fathor.date:self.fathor.dt_date;
					d.setHours(self.get('h'));
					d.setMinutes(self.get('m'));
					d.setSeconds(self.get('s'));
					self.fathor.fire('timeSelect',{
						date:d	
					});
					if(self.fathor.popup && self.fathor.closable){
						self.fathor.hide();
					}
				});
				//ctime上的键盘事件，上下键，左右键的监听
				//TODO 考虑是否去掉
				self.ctime.on('keyup',function(e){
					if(e.keyCode == 38 || e.keyCode == 37){//up or left
						//e.stopPropagation();
						e.preventDefault();
						self.add();
					}
					if(e.keyCode == 40 || e.keyCode == 39){//down or right
						//e.stopPropagation();
						e.preventDefault();
						self.minus();
					}
				});
				//上的箭头动作
				self.ctime.one('.u').on('click',function(e){
					self.hidePopup();
					self.add();
				});
				//下的箭头动作
				self.ctime.one('.d').on('click',function(e){
					self.hidePopup();
					self.minus();
				});
				//弹出选择小时
				self.ctime.one('.h').on('click',function(e){
					var in_str = self.parseSubHtml(self.h_a);
					self.status = 'h';
					self.showPopup(in_str);
				});
				//弹出选择分钟
				self.ctime.one('.m').on('click',function(e){
					var in_str = self.parseSubHtml(self.m_a);
					self.status = 'm';
					self.showPopup(in_str);
				});
				//弹出选择秒
				self.ctime.one('.s').on('click',function(e){
					var in_str = self.parseSubHtml(self.s_a);
					self.status = 's';
					self.showPopup(in_str);
				});
				


			};
			this._init();


		},
		Page:S._cPage
		
	});//prototype over

	
});

/**
 * 2010-09-09 by lijing00333@163.com - 拔赤
 *	 - 将基于YUI2/3的Calendar改为基于KISSY
 *	 - 增加起始日期（星期x）的自定义
 * 	 - 常见浮层的bugfix
 *
 * TODO:
 *   - 日历日期的输出格式的定制
 *   - 多选日期的场景的交互设计
 */

