package com.xintend.net.uploader {
	import flash.net.FileReference;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public interface IUploader {
		/**
		 * 弹出文件选择框,让用户选择文件.
		 * 注意,此方法必需在 flash 点击触发. 
		 * 外部 js 调用仅仅是改变其配制. 当且仅当 flash 被点击时应用其参数配置.
		 * @param	mulit						支持多文件选择标记. 
		 * @param	fileFilters					文件过滤器. 
		 * @return
		 */
		function browse(mulit: Boolean = true, fileFilters: Array = null): Boolean;
		function upload(serverURL:String=null, serverURLParameter:Object = null, uploadDataFieldName:String = "Filedata") : Boolean;
		function cancel(fid: String): Object;
		
		function getFile(fid: String): Object;
		function removeFile(fid: String): Object;
		
		function lock(): void;
		function unlock(): void;
		
		function convertFileReferenceToObject(fileReference:*): Object;
	}
	
}