
if (!String.prototype.contains)
	$.extend(String.prototype, {
		contains : function (str) {
			return this.indexOf(str) !== -1;
		}
	});

if (!String.prototype.trim)
	$.extend(String.prototype, {
		trim : function () {
			return this.replace(/^\s|\s$/g, '');
		}
	});

if (!Array.prototype.indexOf)
	$.extend(Array.prototype, {
		indexOf : function (item) {
			for (var i = 0, len = this.length; i < len; ++i) {
				if (this[i] === item) {
					return i;
				}
			}
			return -1;
		}
	});

/**
 * 该组件初始化需要置于$(function() {})或DOMContentLoaded事件及其类似事件下
 * 因为组件初始化阶段需要读取DOM元素
 * @version 1.0.1060
 * @requires jQuery v1.4.3 or later
 */
(function ($, window) {
	/**
	 * 返回数据类型定义，参看http://api.jquery.com/jQuery.ajax#dataType
	 */
	var _datatypes = ['json', 'text', 'xml', 'script', 'jsonp', 'html'];
	/*
	 * 扩展jQuery一个函数value
	 * @Return 多个元素将返回一个数组
	 */
	$.fn.extend({
		value : function () {
			var array = [];
			if (this.length === 1) {
				array.push(this.val());
				return array;
			} else if (this.length > 1) {
				this.each(function (index, item) {
					array.push($(item).val());
				});
				return array;
			} else
				return '';
		}
	});
	
	var _func = {},
	_updator = {};
	
	// --------------------- all function definition -----------------------
	
	/*
	 * 重置表单
	 */
	function reset() {
		var items = this.options.items;
		for (var key in items) {
			clearItemValue.call(this, key);
		}
		return this;
	}
	
	/*
	 * 使用json为表单赋值
	 */
	function setFormItemValues(jsonObject) {
		try {
			if ($.type(jsonObject) === 'string')
				jsonObject = $.parseJSON(jsonObject);
		} catch (e) {
			return;
		}
		var items = this.options.items,
			item;
		for (var key in items) {
			item = items[key];
			try {
				if (item.mapping.indexOf('.') != -1) {
					var propset = item.mapping.split('.'),
						val = jsonObject;
					for (var i = 0, len = propset.length; i < len; ++i) {
						val = val[propset[i]];
					}
				} else {
					val = jsonObject[item.mapping];
				}
				setItemValue.call(this, item.id, val);
			} catch (e) {
				continue;
			}
		}
		return this;
	}
	
	/*
	 * 从表单中获取以json为格式的值
	 * @Return Object
	 */
	function getFormItemValues() {
		var jsonObject = {},
			items = this.options.items,
			item;
		for (var key in items) {
			item = items[key];
			// 对定义了的回传字段进行封闭
			if (item.datafield)
				jsonObject[item.datafield] = getItemValue.call(this, item.id);
			else
				jsonObject[item.mapping] = getItemValue.call(this, item.id);
		}
		return jsonObject;
	}
	
	/*
	 * 提供表单数据验证
	 * replace(/[^\x00-\xff]/g, 'aa')
	 */
	function validate(obj) {
		this.valid = true;
		var result = {},
			items = this.options.items,
			minLengthText = '\u4f4e\u4e8e\u6700\u5c0f\u957f\u5ea6',
			maxLengthText = '\u8d85\u8fc7\u6700\u5927\u957f\u5ea6',
			regexText = '\u4e0d\u7b26\u5408\u9a8c\u8bc1\u683c\u5f0f',
			blankText = '\u8bf7\u8f93\u5165',
			item,
			val,
			field;
		for (var key in items) {
			item = items[key],
			val = '',
			field = item.field;
			// 只需对INPUT[TYPE=TEXT]进行验证
			if (['select', 'text'].indexOf(item.type) === -1) {
				continue;
			}
			val = getItemValue.call(this, item.id);
			if ($.type(item.allowBlank) === 'boolean' && !item.allowBlank && val.trim().length === 0) {
				if ($.type(item.blankText) === 'string') {
					result[item.id] = item.blankText;
				} else {
					result[item.id] = blankText + item.field;
				}
			} else if ($.type(item.minLength) === 'number' && val.length < item.minLength) {
				if ($.type(item.minLengthText) === 'string') {
					result[item.id] = item.minLengthText;
				} else {
					result[item.id] = item.field + minLengthText + item.minLength;
				}
			} else if ($.type(item.maxLength) === 'number' && val.length > item.maxLength) {
				if ($.type(item.maxLengthText) === 'string') {
					result[item.id] = item.maxLengthText;
				} else {
					result[item.id] = item.field + maxLengthText + item.maxLength;
				}
			} else if ($.type(item.regex) === 'regexp' && !item.regex.test(val)) {
				if ($.type(item.regexText) === 'string') {
					result[item.id] = item.regexText;
				} else {
					result[item.id] = item.field + regexText;
				}
			}
		}
		// 如果result中有错误信息，将jsonform的有效性标示为false
		for (var info in result) {
			this.valid = false;
			break;
		}
		
		if ($.type(obj) === 'object') {
			if (this.valid === false && $.type(obj['fail']) === 'function') {
				obj['fail'].call(this, result);
			} else if (this.valid === true && $.type(obj['success']) === 'function') {
				obj['success'].call(this);
			}
		}
		return this;
	}
	
	/**
	 * 触发特定事件
	 */
	function fire(eventName) {
		var act = this.options.actions;
		if (eventName === undefined || act[eventName] === undefined) {
			return this;
		}
		var len = arguments.length,
			args = [len - 1, eventName],
			returnValue = undefined;
		if (this.method.toLowerCase() === 'post') {
			args.push('doPost');
		} else {
			args.push('doGet');
		}
		for (var i = 1; i < len; ++i) {
			args.push(arguments[i]);
		}
		returnValue = interactive.apply(this, args);
		return !returnValue ? this : returnValue;
	}
	
	/*
	 * 提交表单数据
	 */
	function submit(url, params, callback) {
		var argsLen = arguments.length,
		returnValue = undefined,
		args = [argsLen, 'submit'];
		for (var i = 0; i < argsLen; ++i) {
			args.push(arguments[i]);
		}
		if (this.method.toLowerCase() === 'post') {
			args.splice(2, 0, 'doPost');
		} else {
			args.splice(2, 0, 'doGet');
		}
		returnValue = interactive.apply(this, args);
		return !returnValue ? this : returnValue;
		
	}
	
	/*
	 * 从远程载入数据
	 */
	function load() {
		var args = [];
		for (var i = 0, len = arguments.length; i < len; ++i)
			args.push(arguments[i]);
		return refreshForm.apply(this, args);
	}
	
	/*
	 * 异步从远程载入json赋值表单
	 */
	function refreshForm() {
		var args = [];
		for (var i = 0, len = arguments.length; i < len; ++i) {
			args.push(arguments[i]);
		}
		if (this.method.toLowerCase() === 'post') {
			args.unshift('doPost');
		} else {
			args.unshift('doGet');
		}
		args.unshift('refresh');
		args.unshift(arguments.length);
		return interactive.apply(this, args);
	}
	
	/*
	 * 数据提交前，整理提交数据及判断提交参数
	 */
	function interactive(argsLen, approach, method) {
		var args = [],
		self = this,
		// 初始化组件配置信息
		_localObject = self.options.actions[approach],
		_localURL = '',
		_localParams = self.getFormItemValues(),
		_localFunc = self.setFormItemValues,
		_localType = 'text';
		for (var i = 0; i < argsLen; ++i) {
			args[args.length] = arguments[i + 3];
		}
		
		if (!self.options.actions.hasOwnProperty(approach)) {
			return;
		} else {
			if ($.type(_localObject.callback) === 'function') {
				_localFunc = _localObject.callback;
			}
		}
		
		if ('refresh' === approach) {
			_localParams = {};
		}
		
		_localURL = _localObject.url;
		_localParams = $.extend({}, _localParams, _localObject.params);
		
		if (argsLen === 1) {
			if ($.type(args[0]) === 'string') {
				_localURL = args[0];
			} else if ($.type(args[0]) === 'object') {
				_localParams = $.extend(_localParams, args[0]);
			} else if ($.type(args[0]) === 'function') {
				_localFunc = args[0];
			}
		} else if (argsLen === 2) {
			if ($.type(args[0]) === 'string') {
				_localURL = args[0];
			} else if ($.type(args[0]) === 'object') {
				_localParams = $.extend(_localParams, args[0]);
			} else if ($.type(args[0]) === 'function') {
				_localFunc = args[0];
			}
			if ($.type(args[1]) === 'object') {
				_localParams = $.extend(_localParams, args[1]);
			} else if ($.type(args[1]) === 'function') {
				_localFunc = args[1];
			} else if ($.type(args[1]) === 'string' && _datatypes.indexOf(args[1]) > -1) {
				_localType = args[1];
			}
		} else if (argsLen === 3) {
			if ($.type(args[0]) === 'string') {
				_localURL = args[0];
			} else if ($.type(args[0]) === 'object') {
				_localParams = $.extend(_localParams, args[0]);
			}
			
			if ($.type(args[1]) === 'object') {
				_localParams = $.extend(_localParams, args[1]);
			} else if ($.type(args[1]) === 'function') {
				_localFunc = args[1];
			}
			
			if ($.type(args[2]) === 'function') {
				_localFunc = args[2];
			} else if ($.type(args[2]) === 'string' && _datatypes.indexOf(args[2]) > -1) {
				_localType = args[2];
			}
		} else if (argsLen === 4) {
			if ($.type(args[0]) === 'string' && $.type(args[1]) === 'object' && $.type(args[2]) === 'function' && $.type(args[3]) === 'string' && _datatypes.indexOf(args[3]) > -1) {
				_localURL = args[0];
				_localParams = $.extend(_localParams, args[1]);
				_localFunc = args[2];
				_localType = args[3];
			}
		}
		_localParams = $.extend(_localParams, {
			_random: Math.random(new Date().getTime())
		});
		var updator = $.jsonform.updator;
		return updator[method].call(updator, _localURL, toQueryString(_localParams), _localFunc, _localType, self);
	}
	
	/*
	 * 日志输出函数
	 * 内部使用
	 */
	function log(content) {
		if (typeof console != 'undefined')
			console.log(content);
		else
			alert(content);
	}
	/*
	 * 组织jsonform中元素的id: value，形成一具Object
	 */
	function serialize() {
		var items = this.options.items,
			result = {};
		for (var key in items)
			result[key] = $('#' + key).val();
		return result;
	}
	
	/*
	 * 根据初始化ID获取表单中单个元素的值
	 * 内部使用
	 */
	function getItemValue(id) {
		var item = this.options.items[id];
		if (item.type === 'checkbox') {
			return $('input[name=' + item.id + ']:checked').value();
		} else if (item.type === 'radio') {
			return $('input[name=' + item.id + ']:checked').val();
		} else if (item.type === 'select' && $(item.dom).filter('[multiple]').length > 0) {
			return $('select[multiple][id="' + item.id + '"] option:selected').value();
		} else if (isNotEmptyString(item.type)) {
			return $(item.dom).val();
		}
	}
	
	/*
	 * 返回id对应的DOM元素
	 */
	function getFormItem(id) {
		var item = this.options.items[id];
		return item.dom;
	}
	
	/*
	 * 根据初始化ID重置清空表单中单个元素的值
	 * 内部使用
	 */
	function clearItemValue(id) {
		var item = this.options.items[id],
			dom = item.dom;
		//log(item);
		if (item.type === 'radio' || item.type === 'checkbox') {
			for (var i = 0, len = dom.length; i < len; ++i) {
				dom[i].checked = false;
			}
		} else {
			$(dom).val('');
		}
	}
	
	/*
	 * 根据初始化ID对表单中单个元素赋值
	 * 内部使用
	 */
	function setItemValue(id, val) {
		var item = this.options.items[id];
		if (item.type === 'radio') {
			$('input[name=' + item.id + '][value="' + val + '"]').prop('checked', true);
		} else if (item.type === 'checkbox') {
			$('input[name=' + item.id + ']').each(function (index, ipt) {
				if (val.length > 1) {
					for (var i = 0, len = val.length; i < len; ++i) {
						$(ipt).filter('[value="' + val[i] + '"]').prop('checked', true);
					}
				} else if (val.length === 1) {
					$(ipt).filter('[value="' + val + '"]').prop('checked', true);
				}
			});
		} else if (isNotEmptyString(item.type)) {
			$(item.dom).val(val);
		}
	}
	
	function isNotEmptyString(obj) {
		return typeof obj === 'string' && /^\w/.test(obj);
	}
	
	/*
	 * 将参数对象与URI合并后返回
	 */
	function toWholeWord(url, params) {
		var result = url;
		reuslt += url.contains('?') ? '&' : '?';
		result += toQueryString(params);
		return result;
	}
	
	/*
	 * 将实参转换为BOOLEAN值
	 */
	function toBoolean(obj) {
		if ($.type(obj) === 'boolean') {
			return obj;
		} else if (!isNaN(obj)) {
			return !!parseInt(obj);
		} else if ($.type(obj) === 'undefined' || $.type(obj) === 'null') {
			return false;
		} else {
			return !!obj;
		}
	}
	
	/*
	 * 将对象转换为键值对
	 */
	function toQueryObjects(obj) {
		var objects = [];
		if ($.type(obj) === 'object') {
			for (var key in obj) {
				if ($.type(obj[key]) === 'array') {
					for (var i = 0, len = obj[key].length; i < len; ++i) {
						objects.push({
							name : key,
							value : obj[key][i]
						});
					}
				} else if ($.type(obj[key] === 'string')) {
					objects.push({
						name : key,
						value : obj[key]
					});
				}
			}
		}
		return objects;
	}
	
	/*
	 * 将对象拼为参数字串
	 */
	function toQueryString(obj) {
		var objects = toQueryObjects(obj),
		object,
		params = [];
		if ($.type(objects) !== 'array' || objects.length === 0)
			return;
		for (var i = 0, len = objects.length; i < len; ++i) {
			object = objects[i];
			params.push(encodeURIComponent(object.name) + '=' + encodeURIComponent(object.value));
		}
		return params.join('&');
	}
	
	function doPost(url, params, callback, datatype, context) {
		return $.post(url, params, function (data, textStatus, jqXHR) {
			callback.call(context, data, textStatus, jqXHR);
		}, datatype);
	}
	
	function doGet(url, params, callback, datatype, context) {
		return $.get(url, params, function (data, textStatus, jqXHR) {
			if ($.type(callback) === 'function') {
				callback.call(context, data, textStatus, jqXHR);
			}
		}, datatype);
	}
	/*
	 * 为select加载选项
	 * {
	 * 	url:加载数据地址,返回数据必需是一个数组
	 * 	id: select元素的ID
	 * 	key: option的value值
	 * 	value: option的text值
	 * }
	 */
	function loadOption(obj) {
		$.getJSON(obj.url, function (data, textStatus, jqXHR) {
			parseOption(obj, data);
		});
		return $('#' + obj.id);
	}
	
	/**
	 * 解析选项
	 * @param obj 额外属性
	 * @param data 后端返回数据
	 */
	function parseOption(obj, data) {
		var html = "<option value=''>--\u8bf7\u9009\u62e9--</option>",
		extra = obj['extra'];
		if ($.type(extra) === 'undefined')
			extra = {};
		for (var i = 0, len = data.length; i < len; ++i) {
			var item = data[i],
			extrattr = '';
			for (var attr in extra) {
				extrattr += (attr + "='" + item[extra[attr]] + "' ");
			}
			html += "<option value='" + item[obj.key] + "' " + extrattr + " >" + item[obj.value] + "</option>";
		}
		$('#' + obj.id).html(html);
	}
	
	function toArray(jobj) {
		if (!jobj.hasOwnProperty('length'))
			return [ jobj ];
		return Array.prototype.slice.call(jobj);
	}
	/**
	 * copy from http://www.jquery4u.com
	 * <title>jQuery String Template Format Function</title>
	 */
	function _formatVarString() {
        var args = Array.prototype.slice.call(arguments);
        if(args.length > 0 && args[0].toString() != '[object Object]') {
	        var pattern = new RegExp('{([1-' + args.length + '])}', 'g');
	        return String(args[0]).replace(pattern, function(match, index) { return args[index]; });
        }
        return "";
	}
	
	// --------------------- component function definition-----------------------
	
	$.extend(_updator, {
		doPost : doPost,
		doGet : doGet
	});
	
	$.extend(_func, {
		reset : reset,
		toQueryObjects : toQueryObjects,
		toQueryString : toQueryString,
		setFormItemValues : setFormItemValues,
		getFormItemValues : getFormItemValues,
		getFormItem : getFormItem,
		validate : validate,
		submit : submit,
		refreshForm : refreshForm,
		load : load,
		fire : fire,
		loadOption : loadOption
	});
	
	// --------------------- jfrom definition ----------------
	
	$.extend({
		jsonform : function (props) {
			/*
			 * 重建jform的相关属性
			 */
			$.extend(this, {
				// 表单有效性
				valid : true,
				name : props['name'],
				method : props['method'] === undefined ? 'post' : props['method'],
				url : props['url'],
				baseParams : props['baseParams']
			});
			this.options = $.extend({}, {
					items : {},
					actions : {}
				});
			var self = $.extend({}, this, _func),
				_def = {
					type : '#',
					vtype : '#'
				},
				// 记录jsonform中的自定义操作
				_customfunc = {};
			// 初始化组件
			function _initComponent(props) {
				try {
					var self = this,
						dom = {},
						type = undefined,
						tag = '';
					if ($.type(props.items) === 'array') {
						for (var i = 0, len = props.items.length; i < len; ++i) {
							var item = props.items[i],
								target = $('#' + item.id);
							dom = {};
							type = undefined;
							// 记录元素的类型
							if (target.length === 1) {
								dom = target.get(0);
								tag = dom.nodeName.toLowerCase();
								if (tag === 'input') {
									type = dom.type;
								}
								else {
									type = tag;
								}
							} else { // 如果通过ID没有找到元素，则为集合形式如（checkbox, radio, select[multiple])
								target = $('input[name=' + item.id + ']');
								if (target.length !== 0) {
									dom = toArray(target);
									tag = dom[0].nodeName.toLowerCase();
									if (tag === 'input') {
										type = dom[0].type;
									}
								}
							}
							var cmp = $.extend({}, _def, {
									type : type,
									dom : dom,
									// 验证选项
									minLength : item['minLength'],
									minLengthText : item['minLengthText'],
									maxLength : item['maxLength'],
									maxLengthText : item['maxLengthText'],
									regex : item['regex'],
									regexText : item['regexText'],
									allowBlank : $.type(item['allowBlank']) === 'undefined' ? true : item.allowBlank,
									blankText : item['blankText'],
									field : item['field']
								}, item);
							self.options.items[item.id] = cmp;
						}
					}
					
				} catch (e) {
					throw e;
				}
				
			}
			_initComponent.call(this, props);
			// 初始化操作
			function _initAction(props) {
				if (!props.hasOwnProperty('baseParams') || $.type(props.baseParams) !== 'object') {
					props.baseParams = {};
				}
				
				if ($.type(props.operation) === 'object') {
					for (var oper in props.operation) {
						var action = props.operation[oper];
						if ($.type(action) === 'string') {
							self.options.actions[oper] = {
								url : action,
								params : $.extend({}, props.baseParams),
								callback : function () {}
							};
						} else if ($.type(action) === 'object') {
							self.options.actions[oper] = {};
							// 是否有URL属性
							self.options.actions[oper].url = action['url'] === undefined ? props.url : action['url'];
							// 是否有params属性
							if (action.hasOwnProperty('params') && $.type(action.params) === 'object') {
								self.options.actions[oper].params = $.extend({}, props.baseParams, action.params);
							} else {
								self.options.actions[oper].params = $.extend({}, props.baseParams);
							}
							// 是否有callback属性
							if (action.hasOwnProperty('callback') && $.type(action.callback) === 'function') {
								self.options.actions[oper].callback = action.callback;
							}
						}
					}
					// 如果配置文件中没有配置load的回调函数
					if (self.options.actions['load'] && !self.options.actions['load'].callback) {
						self.options.actions['load'].callback = function (data) {
							try {
								if ($.type(data) === 'string') {
									data = window.eval('(' + data + ')');
								}
							} catch (e) {
								throw new Error('data is not an object');
								return;
							}
							self.setFormItemValues(data);
						};
					}
					// 如果配置中没有配置refresh
					if (!props.operation.hasOwnProperty('refresh') && self.options.actions['load']) {
						
						self.options.actions['refresh'] = {
							url : self.options.actions['load'].url,
							params : $.extend({}, props.baseParams, self.options.actions['load'].params),
							callback : self.options.actions['load'].callback
						};
					}
				}
				
				// 如果operation中没有submit地址，则用初始化上的默认提交地址
				if (props.operation === undefined || !props.operation.hasOwnProperty('submit')) {
					self.options.actions['submit'] = {
						url : props.url,
						params : $.extend({}, props.baseParams),
						callback : function () {}
					};
				}
			}
			
			_initAction.call(this, props);
			
			/**
			 * 添加自定义函数
			 */
			for (var key in self.options.actions) {
				if (['load', 'refresh', 'submit'].indexOf(key) > -1) {
					continue;
				}
				_customfunc[key] = (function (eventName, context) {
					return function () {
						var args = [eventName],
						len = arguments.length;
						for (var i = 0; i < len; ++i) {
							args.push(arguments[i]);
						}
						return context.fire.apply(context, args);
					};
				})(key, self);
			}
			
			$.extend(self, _customfunc);
			$.extend(self, {
				init : (function (props, context) {
					return function () {
						//console.log(this);
						_initComponent.call(context, props);
						return context;
					};
				})(props, self),
				destroy: (function(context) {
					var items = context.options.items;
					for (var item in items) {
						delete item.dom;
					}
				})(self)
			});
			
			return self;
		}
	});
	
	$.extend($.jsonform, {
		updator : _updator,
		formatVarString : _formatVarString
	});
	
})(jQuery, window);
