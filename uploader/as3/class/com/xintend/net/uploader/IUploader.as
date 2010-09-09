package com.xintend.net.uploader {
	import flash.net.FileReference;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public interface IUploader {
		function browse(mulit: Boolean = true, fileFilters: Array = null): Boolean;
		function upload(serverURL:String=null, serverURLParameter:Object = null, uploadDataFieldName:String = "Filedata") : Boolean;
		function cancel(fileName: String): Object;
		
		function getFile(fid: String): Object;
		function removeFile(fid: String): Object;
		
		function lock(): void;
		function unlock(): void;
		
		function convertFileReferenceToObject(fileReference:*): Object;
	}
	
}