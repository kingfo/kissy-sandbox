package com.xintend.events {
	import flash.events.Event;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class UploaderEvent extends Event {
		
		public static const LIST_COMPLETE: String = "listComplete";
		public static const LOCKED: String = "locked";
		public static const UNLOCKED: String = "unlocked";
		public static const CLEAR: String = "clear";
		//public static const CONTENT_READY: String = "contentReady";
		
		public var files: *;
		public var data: *;
		
		public function UploaderEvent(type:String,files:* =null,data:*=null, bubbles:Boolean=false, cancelable:Boolean=true) { 
			super(type, bubbles, cancelable);
			this.files = files;
			this.data = data;
		} 
		
		public override function clone():Event { 
			return new UploaderEvent(type,files,data,bubbles, cancelable);
		} 
		
		public override function toString():String { 
			return formatToString("UploaderEvent", "type", "bubbles", "cancelable", "eventPhase"); 
		}
		
	}
	
}