/**
 * @author kingfo  oicuicu@gmail.com
 */
/**
 * @author kingfo  oicuicu@gmail.com
 */
AJBridge.add("uploader", function(A){
	
	var S = KISSY,
		F = S.Flash,
		UA = S.UA;

	/**
	 * 本地存储类
	 * @param {String} id									需要注册的SWF应用ID。 
	 * @param {Object} config								配置项
	 * @param {String} config.ds							default server 的缩写。
	 * @param {String} config.dsp							default server parameters 的缩写。
	 * @param {Boolean} config.btn							启用按钮模式，默认 false。
	 * @param {Boolean} config.hand							显示手型，默认 false。
	 */
	function Uploader(id, config){
		var flashvars = { },
			params,
			ds,						//
			dsp,
			btn,
			hand,
			k;
			
		config = config || {};
		params = config.params || {};

		ds = config.ds;					
		dsp = config.dsp;
		btn = config.btn;
		hand = config.hand;
		
		if(ds)flashvars.ds = ds;
		if(dsp)flashvars.dsp = dsp;
		if(btn)flashvars.btn = btn;
		if(hand)flashvars.hand = hand;
		
		
		config.params.flashvars = S.merge(config.params.flashvars, flashvars);

		Uploader.superclass.constructor.call(this, id,config);
	}
	
	S.extend(Uploader, A);

	A.augment(Uploader,
		[
			"browse",
			"upload",
			"cancel",
			"getFile",
			"removeFile",
			"lock",
			"unlock"
		]
	);
	
	Uploader.version = "1.0.0";
	A.Uploader = Uploader;
});

/**
 * NOTES:
 * 2010/08/12	重构了代码，基于AJBridge 1.0.10
 * 2010/08/27	重构了代码，基于AJBridge 1.0.12
 * 
 */
