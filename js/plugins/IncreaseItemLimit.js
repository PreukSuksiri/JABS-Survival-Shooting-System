//=============================================================================
// IncreaseItemLimit.js (Ver1.0.1)
//=============================================================================
// 2020.Oct.18 Ver1.0.0  First Release

/*:
 * @target MZ
 * @plugindesc Increase max item limit.
 * @author Preuk Suksiri
 *
 * @help IncreaseItemLimit.js
 *
 * This plugin allow you to increase maximum item limit
 * 
 * @param maxitem
 * @text Item Limit
 * @desc Amount of maximum item you wanted
 * @default 999
 * @type number
 */

(() => {
	
	const pluginName = 'IncreaseItemLimit';
	const param  = PluginManager.parameters(pluginName);
	const getMaxItem = Number(param.maxitem);
	
	Game_Party.prototype.maxItems = function(/*item*/) {
		return getMaxItem;
	};

	Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
		if (this.needsNumber()) {
			this.drawText("", x, y, width - this.textWidth("00"), "right");
			this.drawText($gameParty.numItems(item), x, y, width, "right");
		}
	};


})();