package {
	import com.adobe.serialization.json.JSON;
	import com.xintend.events.UploaderEvent;
	import com.xintend.net.uploader.Uploader;
	import com.xintend.trine.ajbridge.AJBridge;
	import flash.display.Sprite;
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.system.Security;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class Main extends Sprite {
		
		public function Main(): void {
			Security.allowDomain("*");
			
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e: Event = null): void {
			var params:Object = stage.loaderInfo.parameters;
			
			stage.scaleMode = "noScale";
			stage.align = "TL";
			
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			
			// 1.获取外部配置
			defaultServerURL = params["ds"];
			defaultServerParameters = params["dsp"];
			
			
			
			hand = params["hand"] || false;
			btn = params["btn"] ||  false;
			
			if (defaultServerParameters) {
				defaultServerParameters = defaultServerParameters.replace(/\'/g,'"');
				defaultServerParameters = JSON.decode(defaultServerParameters);
			}
			// 2.创建并配置上传实例
			uploader = new Uploader(defaultServerURL, defaultServerParameters);
			// 3.创建监听程序
			uploader.addEventListener(UploaderEvent.LOCKED, eventHandler);
			uploader.addEventListener(UploaderEvent.UNLOCKED, eventHandler);
			uploader.addEventListener(UploaderEvent.LIST_COMPLETE, eventHandler);
			uploader.addEventListener(Event.COMPLETE, eventHandler);
			uploader.addEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
			uploader.addEventListener(IOErrorEvent.IO_ERROR, eventHandler);
			uploader.addEventListener(Event.OPEN, eventHandler);
			uploader.addEventListener(ProgressEvent.PROGRESS, eventHandler);
			uploader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
			uploader.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
			uploader.addEventListener(Event.SELECT, eventHandler);
			uploader.addEventListener(Event.CANCEL, eventHandler);
			
			
			
			// 4.注册 AJBridge
			var callbacks: Object = { 
					browse: browse,
					upload: uploader.upload,
					cancel: uploader.cancel,
					getFile: uploader.getFile,
					removeFile: uploader.removeFile,
					lock: uploader.lock,
					unlock: uploader.unlock
				};
			
			
			AJBridge.init(stage);
			AJBridge.addCallbacks(callbacks);
			AJBridge.ready();
			
			
			
			if (hand || btn) {
				hotspot = new Sprite();
				hotspot.addEventListener(Event.RESIZE, hotspotResize);
				hotspot.useHandCursor = hand;
				hotspot.buttonMode = btn;
				hotspot.doubleClickEnabled = true;
				
				hotspotResize();
				
				hotspot.addEventListener(MouseEvent.CLICK, mouseHandler);
				hotspot.addEventListener(MouseEvent.DOUBLE_CLICK, mouseHandler);
				hotspot.addEventListener(MouseEvent.MOUSE_OVER, mouseHandler);
				hotspot.addEventListener(MouseEvent.MOUSE_DOWN, mouseHandler);
				hotspot.addEventListener(MouseEvent.MOUSE_UP, mouseHandler);
				hotspot.addEventListener(MouseEvent.MOUSE_OUT, mouseHandler);
				
				
				addChild(hotspot);
			}
				
			
			
			
			
			
			
			// 原本存在白名单验证
			AJBridge.sendEvent({type:"contentReady"} );
			
		}
		
		/**
		 * 定义浏览模式
		 * @param	mulit
		 * @param	fileFilters
		 */
		private function browse(mulit: Boolean = true, fileFilters: Array = null):Boolean{
			argumentsMap["browse"] = [mulit, fileFilters];
			return !uploader.isLocked;
 		}
		
		
		
		private function eventHandler(e: Event): void {
			//switch(e.type) {
				//case MouseEvent.CLICK:
					//uploader.browse();
				//break;
			//}
			AJBridge.sendEvent(e);
		}
		
		private function mouseHandler(e: MouseEvent): void {
			switch(e.type) {
				case MouseEvent.CLICK:
				case MouseEvent.DOUBLE_CLICK:
					uploader.browse.apply(uploader,argumentsMap["browse"]);
				break;
			}
			
			// 鼠标事件需要单独转换  
			// 否则会堆栈溢出
			// flash 自身 bug ?
			AJBridge.sendEvent({type:e.type});
		}
		
		
		private function hotspotResize(e: Event = null): void {
			hotspot.graphics.clear();
			hotspot.graphics.beginFill(0);
			hotspot.graphics.drawRect(0, 0, stage.stageWidth,stage.stageHeight);
			hotspot.graphics.endFill();
		}
		
		private var uploader: Uploader;
		private var defaultServerURL: String;
		private var defaultServerParameters: * ;
		private var hotspot: Sprite;
		private var hand: Boolean;
		private var btn: Boolean;
		private var argumentsMap: Object = {
											browse: [true, null] 
											};
	}
	
}