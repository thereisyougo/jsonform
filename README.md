jsonform
========

jQuery plugin

��ʼ��
var jf = $.jsonform({
	attribute: value
});


�������ԣ�
name: String [optional]
��ʶ�˶����Ψһ������

url��String [required]
�����ύĬ�ϵ�ַ

method: String [optional]
�����ύ���õķ�ʽ��get����post����Ĭ��Ϊ��post��

baseParams: Object [optional]
����������������д���Ĳ���

items: Array<Item> [required]
�����йܵ����������
items:[{
	id: ��element id��, [required]
	mapping: ��json key returned by server-side��, [required]
	datafield: ��json key transfer to server-side��, [optional]��������˸����ԣ������ύformʱ��ʹ�ô˴������ֵ��Ϊ�ش���ֵ
	field:���ֶ���������, [optional]
	minLength: number, [optional]�������С�ַ���
	minLengthText: ��text��, [optional]��С������֤����ʱ���Զ����ı�
	maxLength: number, [optional]���Ƶ�����ַ���
	maxLengthText: ��text��, [optional]��󳤶���֤����ʱ���Զ����ı�
	regex: Regular Expression, [optional]������ʽ
	regexText: ��text��, [optional]���ʽ��֤����ʱ���Զ����ı�
	allowBlank: true [optional]�Ƿ��Ϊ��
	blankText: ��text�� [optional]�ǿ���֤����ʱ���Զ����ı�
}]

operation:Object [required]
�������������Ĭ�����ݽ�����ַ������
operation: {
	load: ��a.action��, [required]// jform�״μ���������Ҫ����ĵ�ַ
	refresh: ��b.action��, [required/optional]// jformˢ����������ĵ�ַ
	submit: ��c.action�� [required/optional]// jform�ύ��������ĵ�ַ
}

��������
validate(Object obj):jsonform
��ֻ֧����֤INPUT��TYPE=TEXT�е�ֵ����Ч��
���ṩ�����ص�����success, fail
�÷���
validate({
	success: function() {
	// ��֤�ɹ����ô˺���
	},
	fail: function(Object result) {
		// ��֤ʧ��ʱ,result����Ԫ��IDΪ������֤������Ϣ�ı�Ϊֵ�ļ�ֵ�Լ���
		result: {
			// text����������jsonformʱ�Զ�����������δ������ʹ��Ĭ�����
			elementID_1: text,
			elementID_2: text,
		��
		}
	}
});

setFormItemValues(Object jsonObject): Void
ʹ��jsonObject��jform���йܵ�Ԫ�ؽ��и�ֵ����

getFormItemValues():Object
����jform���й�Ԫ�ص�id��value���϶���

getFormItem(String id): DOM Object
����id��Ӧ��DOMԪ�أ������checkbox��radio����������

refreshForm([String url], [Object params], [Function callback]): Void
url�������������ͨ�����񷵻ص�JSONObject����jform�й�Ԫ�ص�ֵ�����û��������������ʹ��operation��ָ����url��������
params�е�ֵ����������url֮��

load():Void
��refreshForm����һ��

submit([String url], [Object params], [Function callback], [String datatype]): Void
url����������񣬽�jform�е������ύ�����û��������������ʹ��operation��ָ����url��������
params��Ϊ�����������

reset():Void
����jsonform�����õ�Ԫ��

init():Void
�ٴγ�ʼ��form�е�ӳ��Ķ���(��form��ʼ��ʱ����������ĳЩ��Ҫ��Ԫ�ز�û����ҳ�������ɣ����������ṩ�ֶ���ʼ��form��ӳ�䵱ǰҳ���е�Ԫ��)


