$.fn.extend({
	deserialize: function(object) {
		for (var itemName in object) {
			var ele = $.makeArray(this.get(0).elements[itemName]);
			var v = $.makeArray(object[itemName]);
			$(ele).each(function(index, item) {
				if (!item) return;
				switch (item.type || item.tagName.toLowerCase()) {
					case "radio":
					case "checkbox":
						for (var i = 0, len = v.length; i < len; ++i) {
							item.checked |= (v[i] == item.value);
						}
						break;
					case "option":
						for (var i = 0, len = v.length; i < len; ++i) {
							item.selected = false;
							item.selected |= (item.value == v[i]);
							if (item.selected) break;
						}
						break;
					default:
						item.value = v.join(',');
				}
			});
		}
	},
	serializeObject: function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (this.name.substr(-2) == "[]") {
				this.name = this.name.substr(0, this.name.length - 2);
				o[this.name] = [];
			}
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	}
});
