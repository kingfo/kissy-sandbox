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
	import flash.utils.Dictionary;
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class Uploader extends EventDispatcher implements IUploader {
		
		public function get isLocked():Boolean { return _isLocked; }
		
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
			if (_isLocked) {
				dispatchEvent(new UploaderEvent(UploaderEvent.LOCKED));
				return false;
			}
			
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
			
			_isLocked = true;
			
			return true;
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
			}
			request = new URLRequest(this.serverURL);
			request.method = URLRequestMethod.POST;
			request.data = params;
			for each(fileReference in pendingFiles) {
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
			var fileReference: FileReference = pendingFiles[fid];
			if (fileReference) fileReference.cancel();
			return convertFileReferenceToObject(pendingFiles[fid]);
		}
		/**
		 * 通过 文件序列号获取文件
		 * @param	fid
		 * @return
		 */
		public function getFile(fid: String): Object {
			return convertFileReferenceToObject(pendingFiles[fid]);
		}
		/**
		 * 通过 文件序列号删除文件
		 * @param	fid
		 * @return
		 */
		public function removeFile(fid: String): Object {
			var fileReference: FileReference = pendingFiles[fid];
			var o: Object = convertFileReferenceToObject(fileReference);
			removePendingFile(fileReference);
			return o;
		}
		/**
		 * 锁定上传功能
		 */
		public function lock(): void {
			_isLocked = true;
			dispatchEvent(new UploaderEvent(UploaderEvent.LOCKED));
		}
		/**
		 * 解锁上传功能
		 */
		public function unlock(): void {
			_isLocked = false;
			dispatchEvent(new UploaderEvent(UploaderEvent.UNLOCKED));
		}
		
		
		public function convertFileReferenceToObject(fileReference: * ): Object {
			var o: Object;
			if (!fileReference || !(fileReference is FileReference)) return null;
			o = { };
			o.creationDate = fileReference.creationDate;
			o.creator = fileReference.creator;
			o.modificationDate = fileReference.modificationDate;
			o.name = fileReference.name;
			o.size = fileReference.size;
			o.type = fileReference.type;
			o.fid = pendingIds[fileReference] || null;
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
					_isLocked = false;
					event = new UploaderEvent(e.type, fileList);
				break;
				case Event.CANCEL:
					_isLocked = false;
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
			var fileList: Array = [];
			var i: int;
			var n: int;
			var fileReference: FileReference;
			var fileReferenceList: FileReferenceList;
			if (file is FileReferenceList) {
				fileReferenceList = file as FileReferenceList;
				n = fileReferenceList.fileList.length;
				for (i = 0; i < n; i++ ) {
					// 添加网络/io监听
					fileReference = fileReferenceList.fileList[i];
					
					saveFile(fileReference);
					addNetListeners(fileReference);
					pendingLength++;
					fileList.push(convertFileReferenceToObject(fileReference));
				}
				
			}else if (file is FileReference) {
				fileReference = file as FileReference;
				saveFile(fileReference);
				addNetListeners(fileReference);
				fileList = [convertFileReferenceToObject(fileReference)];
			}
			return fileList;
		}
		
		
		protected function addNetListeners(dispatcher: IEventDispatcher): void {
			dispatcher.addEventListener(Event.COMPLETE, eventHandler);
			dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
			dispatcher.addEventListener(IOErrorEvent.IO_ERROR, eventHandler);
			dispatcher.addEventListener(Event.OPEN, eventHandler);
			dispatcher.addEventListener(ProgressEvent.PROGRESS, eventHandler);
			dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
			dispatcher.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
        }
		
		
		protected function saveFile(fileReference: FileReference): void {
			var fid: String;
			fid = String(FILE_ID++);
			pendingFiles[fid] = fileReference;
			pendingIds[fileReference] = fid;
		}
		
		protected function removePendingFile(file: FileReference): void {
			if (!file) return;
			var key: String = pendingIds[file];
			if (!key) return;
			var fileReference: FileReference = pendingFiles[key];
			if (!fileReference) return;
			fileReference.removeEventListener(Event.COMPLETE, eventHandler);
			fileReference.removeEventListener(HTTPStatusEvent.HTTP_STATUS, eventHandler);
			fileReference.removeEventListener(IOErrorEvent.IO_ERROR, eventHandler);
			fileReference.removeEventListener(Event.OPEN, eventHandler);
			fileReference.removeEventListener(ProgressEvent.PROGRESS, eventHandler);
			fileReference.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, eventHandler);
			fileReference.removeEventListener(DataEvent.UPLOAD_COMPLETE_DATA, eventHandler);
			pendingFiles[key] = null;
			pendingIds[fileReference] = null;
			delete pendingFiles[key];
			delete pendingIds[fileReference];
			pendingLength--;
			if (pendingLength == 0) {
				dispatchEvent(new UploaderEvent(UploaderEvent.LIST_COMPLETE));
			}
		}

		
		private var pendingFiles: Dictionary = new Dictionary(true);
		private var pendingIds: Object = new Dictionary(true);
		private var pendingLength: int;
		
		private var serverURL: String;
		private var serverParameters: Object;
		private var isMulit: Boolean;
		private var _isLocked: Boolean = false;
		private var fileReferenceList: FileReferenceList;
		private var fileReference: FileReference;
		
		private var FILE_ID: int;
		
		
		
		
	}

}