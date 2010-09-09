package com.xintend.utils {
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class SWFParameters{
		
		public static var parameters:Object
		
		public function SWFParameters() {
			
		}
		
		static public  function getItem(key:String): * {
			var key2: String;
			var k: String;
			var param: Object;
			
			if (!parameters) return null;
			
			param = normalParameters || parameters;
			
			if (key in parameters) return parameters[key];
			if (key in param) return param[key];
			key2 = key.toLowerCase();
			if (key2 in parameters) return parameters[key2];
			if (key2 in param) return param[key2];
			
			// 创建全为小写的参数对象
			normalParameters = { };
			for each(k in param) {
				k = k.toLowerCase();
				normalParameters[k] = param[k];
				if (key2 == k) {
					return param[k];
				}
			}
			return null;
		}
		
		
		// 全为小写的参数对象
		static private var normalParameters: Object;
	}

}