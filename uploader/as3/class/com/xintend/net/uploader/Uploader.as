package com.xintend.net.uploader {
	import com.xintend.events.UploaderEvent;
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.HTTPStatusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.net.FileReferenceList;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class Uploader extends EventDispatcher implements IUploader {
		
		
		public function get pendingFiles():Object { return _pendingFiles; }
		
		public function Uploader(serverURL:String,serverParameters:Object) {
			this.serverURL = serverURL;
			this.serverParameters = serverParameters;
			
			FILE_ID = new Date().getTime();
			
			//dispatchEvent(new UploaderEvent(UploaderEvent.CONTENT_READY));
		}
		/**
		 * 显示一个文件浏览对话框，让用户选择要上载的文件。 该对话框对于用户的操作系统来说是本机的。
		 * @param	mulit				启用多文件选择
		 * @param	fileFilters			实例数组，用于过滤在对话框中显示的文件。如果省略此参数，则显示所有文件。
		 * @return	如果参数有效并且打开了文件浏览对话框，则返回 true。 在以下情况下，browse 方法返回 false：未打开对话框；正在进行另一个浏览器会话；使用 typelist 参数，但未能在数组的任一元素中提供描述或扩展名字符串。 
		 */
		public function browse(mulit: Boolean = true, fileFilters: Array = null): Boolean {
			var filters: Array;
			var i: int;
			var n: int = (fileFilters||[]).length;
			var fileter: Object;
			if (isLocked) return false;
			
			isMulit = mulit;
			
			if (fileFilters) {
				// 提取文件过滤配置
				filters = [];
				for (i = 0; i < n;  i++) {
					fileter = fileFilters[i];
					if ("ext" in fileter) {
						filters[i] = new FileFilter( "desc" in fileter ? fileter.desc : "Files",
													  fileter.ext,
													  "mac" in fileter ? fileter.mac : null
														);
						
					}
				}
			}
			
			// 多文件上传验证
			if (isMulit) {
				if (!fileReferenceList) {
					fileReferenceList = new FileReferenceList();
					configureListeners(fileReferenceList);
				}
				return fileReferenceList.browse(filters);
			}else {
				fileReference = new FileReference();
				configureListeners(fileReference);
				return fileReference.browse(filters);
			}
			
			isLocked = true;
			
		}
		/**
		 * 开始将用户选择的文件上载到远程服务器。
		 * 播放器正式支持的上载或下载文件大小最大为 100 MB
		 * @param	serverURL
		 * @param	serverURLParameter
		 * @param	uploadDataFieldName
		 * @return
		 */
		public function upload(serverURL: String = null, serverURLParameter: Object = null, uploadDataFieldName: String = "Filedata") : Boolean {
			var request: URLRequest;
			var fileReference: FileReference;
			var params: URLVariables;
			var key: String;
			this.serverURL = serverURL || this.serverURL;
			this.serverParameters = serverParameters || this.serverParameters;
			if (!this.serverURL) return false;
			if (this.serverParameters) {
				params = new URLVariables();
				for (key in this.serverParameters) {
					params[key] = this.serverParameters[key];
				}
				request = new URLRequest(this.serverURL);
				request.method = URLRequestMethod.POST;
			}
			for each(fileReference in _pendingFiles) {
				fileReference.upload(request, uploadDataFieldName);
			}
			return true;
		}
		/**
		 * 终止指定上传过程中的文件
		 * @param	fid			
		 * @return
		 */
		public function cancel(fid: String): Object {
			var fileReference: FileReference = _pendingFiles[fid];
			if (fileReference) fileReference.cancel();
			return convertFileReferenceToObject(_pendingFiles[fid]);
		}
		/**
		 * 通过 文件序列号获取文件
		 * @param	fid
		 * @return
		 */
		public function getFile(fid: String): Object {
			return convertFileReferenceToObject(_pendingFiles[fid]);
		}
		/**
		 * 通过 文件序列号删除文件
		 * @param	fid
		 * @return
		 */
		public function removeFile(fid: String): Object {
			var fileReference: FileReference = _pendingFiles[fid];
			var o: Object = convertFileReferenceToObject(fileReference);
			removePendingFile(fileReference);
			return o;
		}
		/**
		 * 锁定上传功能
		 */
		public function lock(): void {
			isLocked = true;
		}
		/**
		 * 解锁上传功能
		 */
		public function unlock(): void {
			isLocked = false;
		}
		
		
		public function convertFileReferenceToObject(fileReference: *): Object {
			if (!fileReference || !(fileReference is FileReference)) return null;
			var o: Object = { };
			o.creationDate = fileReference.creationDate;
			o.creator = fileReference.creator;
			o.modificationDate = fileReference.modificationDate;
			o.name = fileReference.name;
			o.size = fileReference.size;
			o.type = fileReference.type;
			o.fid = pendingIds[fileReference];
			return o;
		}
		
		
		protected function configureListeners(dispatcher: IEventDispatcher): void {
			dispatcher.addEventListener(Event.CANCEL, eventHandler);
			dispatcher.addEventListener(Event.SELECT, eventHandler);
        }
		
		protected function eventHandler(e: Event): void {
			var fileList: Array;
			var event: UploaderEvent;
			switch(e.type) {
				case Event.SELECT:
					fileList = addPendingFile(e.target);
					isLocked = false;
					event = new UploaderEvent(e.type, fileList);
				break;
				case Event.CANCEL:
					isLocked = false;
					event = new UploaderEvent(e.type, [convertFileReferenceToObject(e.target)]);
				break;
				case DataEvent.UPLOAD_COMPLETE_DATA:
				case Event.COMPLETE:
					removePendingFile(e.target as FileReference);
					event = new UploaderEvent(e.type, [convertFileReferenceToObject(e.target)]);
				break;
				case ProgressEvent.PROGRESS:
				case HTTPStatusEvent.HTTP_STATUS:
				case IOErrorEvent.IO_ERROR:
				case SecurityErrorEvent.SECURITY_ERROR:
					dispatchEvent(e);
					return;
				break;
				default:
					event = new UploaderEvent(e.type,[convertFileReferenceToObject(e.target)]);
				
			}
			dispatchEvent(event);
		}
		
		/**
		 * 添加待处理文件至未决列表中。
		 * @param	file
		 * @return					是转化为纯粹 Object 的数组
		 */
		protected function addPendingFile(file: Object): Array {
			var a: Array = [];
			var fileList: Array = [];
			var i: int;
			var n: int;
			var key: String;
			var fileReference: FileReference;
			if (file is FileReferenceList) {
				a.concat(file.fileList);
			}else if(file is FileReference) {
				a.push(file);
			}
			n = a.length;
			for (i = 0; i < n; i++ ) {
				key = "fid" + (++FILE_ID);
				fileReference = a[i];
				_pendingFiles[key] = fileReference;
				pendingIds[fileReference] = key;
				// 添加网络/io监听
				fileReference.addEventListener(Event.COMPLETE, eventHandler);
				fileReference.addEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
				fileReference.addEventListener(IOErrorEvent.IO_ERROR, eventHandler);
				fileReference.addEventListener(Event.OPEN, eventHandler);
				fileReference.addEventListener(ProgressEvent.PROGRESS, eventHandler);
				fileReference.addEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
				fileReference.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
				
				fileList[i] = convertFileReferenceToObject(fileReference);
			}
			pendingLength++;
			return fileList;
		}
		
		protected function removePendingFile(file: FileReference): void {
			if (!file) return;
			var key: String = pendingIds[file];
			if (!key) return;
			var fileReference: FileReference = _pendingFiles[key];
			if (!fileReference) return;
			fileReference.removeEventListener(Event.COMPLETE, eventHandler);
			fileReference.removeEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
			fileReference.removeEventListener(IOErrorEvent.IO_ERROR, eventHandler);
			fileReference.removeEventListener(Event.OPEN, eventHandler);
			fileReference.removeEventListener(ProgressEvent.PROGRESS, eventHandler);
			fileReference.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
			fileReference.removeEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
			_pendingFiles[key] = null;
			pendingIds[fileReference] = null;
			delete _pendingFiles[key];
			delete pendingIds[fileReference];
			pendingLength--;
			if (pendingLength == 0) {
				dispatchEvent(new UploaderEvent(UploaderEvent.LIST_COMPLETE));
			}
		}

		
		private var _pendingFiles: Object = { };
		private var pendingIds: Object = { };
		private var pendingLength: int;
		
		private var serverURL: String;
		private var serverParameters: Object;
		private var isMulit: Boolean;
		private var isLocked: Boolean = false;
		private var fileReferenceList: FileReferenceList;
		private var fileReference: FileReference;
		
		private var FILE_ID: int;
		
		
	}

}