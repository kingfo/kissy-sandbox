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
		//public static const CONTENT_READY: String = "contentReady";
		
		public var files: *;
		
		public function UploaderEvent(type:String,files:* =null, bubbles:Boolean=false, cancelable:Boolean=false) { 
			super(type, bubbles, cancelable);
			this.files = files;
		} 
		
		public override function clone():Event { 
			return new UploaderEvent(type,files, bubbles, cancelable);
		} 
		
		public override function toString():String { 
			return formatToString("UploaderEvent", "type", "bubbles", "cancelable", "eventPhase"); 
		}
		
	}
	
}