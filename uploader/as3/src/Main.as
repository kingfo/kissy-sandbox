package {
	import com.adobe.serialization.json.JSON;
	import com.xintend.events.UploaderEvent;
	import com.xintend.net.uploader.Uploader;
	import com.xintend.trine.ajbridge.AJBridge;
	import com.xintend.utils.SWFParameters;
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
			doubleClickEnabled = true;
			
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e: Event = null): void {
			SWFParameters.parameters = stage.loaderInfo.parameters;
			
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			
			// 1.获取外部配置
			defaultServerURL = SWFParameters.getItem("ds") || SWFParameters.getItem("defaultServerURL");
			defaultServerParameters = SWFParameters.getItem("dsp") || SWFParameters.getItem("defaultServerParameters");;
			useHandCursor = SWFParameters.getItem("hand") || SWFParameters.getItem("useHandCursor");
			buttonMode = SWFParameters.getItem("btn") || SWFParameters.getItem("buttonMode");
			
			if (defaultServerParameters) defaultServerParameters = JSON.decode(defaultServerParameters);
			// 2.创建并配置上传实例
			uploader = new Uploader(defaultServerURL, defaultServerParameters);
			// 3.创建监听程序
			uploader.addEventListener(UploaderEvent.CONTENT_READY, eventHandler);
			uploader.addEventListener(UploaderEvent.LIST_COMPLETE, eventHandler);
			uploader.addEventListener(Event.COMPLETE, eventHandler);
			uploader.addEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
			uploader.addEventListener(IOErrorEvent.IO_ERROR, eventHandler);
			uploader.addEventListener(Event.OPEN, eventHandler);
			uploader.addEventListener(ProgressEvent.PROGRESS, eventHandler);
			uploader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
			uploader.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
			
			stage.addEventListener(MouseEvent.CLICK, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_DOWN, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_OUT, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_OVER, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_UP, eventHandler);
			stage.addEventListener(MouseEvent.MOUSE_WHEEL, eventHandler);
			stage.addEventListener(MouseEvent.DOUBLE_CLICK, eventHandler);
			stage.addEventListener(Event.ACTIVATE, eventHandler);
			stage.addEventListener(Event.DEACTIVATE, eventHandler);
			stage.addEventListener(Event.MOUSE_LEAVE, eventHandler);
			
			// 4.注册 AJBridge
			var callbacks: Object = { 
					browse: uploader.browse,
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
			
			
		}
		
		private function eventHandler(e:Event):void {
			AJBridge.sendEvent(e);
		}
		
		
		private var uploader: Uploader;
		private var defaultServerURL: String;
		private var defaultServerParameters: * ;
		
	}
	
}