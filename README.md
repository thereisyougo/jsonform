jsonform
========

jQuery plugin

初始化
var jf = $.jsonform({
	attribute: value
});


配置属性：
name: String [optional]
标识此对象的唯一的名子

url：String [required]
数据提交默认地址

method: String [optional]
数据提交采用的方式’get’或’post’，默认为’post’

baseParams: Object [optional]
所有与服务器请求中带入的参数

items: Array<Item> [required]
定义托管的组件，例如
items:[{
	id: ‘element id’, [required]
	mapping: ‘json key returned by server-side’, [required]
	datafield: ‘json key transfer to server-side’, [optional]如果定义了该属性，则在提交form时会使用此处定义的值做为回传键值
	field:’字段中文名’, [optional]
	minLength: number, [optional]允许的最小字符数
	minLengthText: ‘text’, [optional]最小长度验证错误时，自定义文本
	maxLength: number, [optional]限制的最大字符数
	maxLengthText: ‘text’, [optional]最大长度验证错误时，自定义文本
	regex: Regular Expression, [optional]正则表达式
	regexText: ‘text’, [optional]表达式验证错误时，自定义文本
	allowBlank: true [optional]是否可为空
	blankText: ‘text’ [optional]非空验证错误时，自定义文本
}]

operation:Object [required]
定义与服务器的默认数据交互地址，例如
operation: {
	load: ‘a.action’, [required]// jform首次加载数据所要请求的地址
	refresh: ‘b.action’, [required/optional]// jform刷新数据请求的地址
	submit: ‘c.action’ [required/optional]// jform提交数据请求的地址
}

公共方法
validate(Object obj):jsonform
现只支持验证INPUT中TYPE=TEXT中的值的有效性
它提供两个回调函数success, fail
用法：
validate({
	success: function() {
	// 验证成功调用此函数
	},
	fail: function(Object result) {
		// 验证失败时,result是以元素ID为键，验证错误信息文本为值的键值对集合
		result: {
			// text可以在配置jsonform时自定义输出，如果未定义则使用默认输出
			elementID_1: text,
			elementID_2: text,
		…
		}
	}
});

setFormItemValues(Object jsonObject): Void
使用jsonObject对jform中托管的元素进行赋值操作

getFormItemValues():Object
返回jform中托管元素的id与value集合对象

getFormItem(String id): DOM Object
返回id对应的DOM元素，如果是checkbox或radio将返回数组

refreshForm([String url], [Object params], [Function callback]): Void
url用于请求服务，再通过服务返回的JSONObject更新jform托管元素的值。如果没有这个参数，则会使用operation中指定的url进行请求
params中的值将被附加至url之后

load():Void
用refreshForm功能一置

submit([String url], [Object params], [Function callback], [String datatype]): Void
url用于请求服务，将jform中的数据提交。如果没有这相参数，则会使用operation中指定的url进行请求
params中为额外请求参数

reset():Void
重置jsonform中配置的元素

init():Void
再次初始化form中的映射的对象(在form初始化时，可能由于某些需要的元素并没有在页面中生成，所以这里提供手动初始化form，映射当前页面中的元素)


