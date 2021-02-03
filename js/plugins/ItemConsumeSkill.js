//=============================================================================
// ItemConsumeSkill.js (ver.1.1.0)
//=============================================================================
// [Update History]
// 2021.Jan.XX Ver1.0.0 First Release by Preuk Suksiri
/*:
 * @target MV MZ
 * @plugindesc make the skill that consumes item, not only MP and/or TP
 * @author Sasuke KANNAZUKI
 *
 * @param Consume Item Color
 * @desc the text color ID of display consume item
 * (Ex. 17 is Color Yellow)
 * @type number
 * @default 17
  @param Consume Item Text
 * @desc the consumed item name to be display
 * (Ex. Arrow, Bullet, .357)
 * @type number
 * @default "Ammo"
 * 
 * @help This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MV and MZ.
 *
 * This plugin enables to make item consume skill.
 *
 * [Usage]
 * write following format at skill's note:
 *  <item_consume_id:99> # ID of item to consume
 *  <item_consume_amount:1>  # amount of item to consume per skill usage
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

(function() {

  //
  // process parameters
  //
  var parameters = PluginManager.parameters('ItemConsumeSkill');
  var itemConsumeColor = Number(parameters['Consume Item Color'] || 17);

  // --------------------
  // Process Data in item.note
  // *for efficiency, note is processed at first.
  // --------------------

  var _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    _Scene_Boot_start.call(this);
    DataManager.processItemCost();
  };

  DataManager.processItemCost = function() {
    for (var i = 1; i < $dataSkills.length; i++) {
      var skill = $dataSkills[i];
      var result = skill.meta.item_consume_amount;
      if (result){
        skill.itemCost = Number(result);
      } else {
        skill.itemCost = 0;
      }
	  var result2 = skill.meta.item_consume_id;
	  if (result2){
        skill.itemConsumeID = Number(result2);
      } else {
        skill.itemConsumeID = 0;
      }
		
    }
  };

  // --------------------
  // exec consume item cost
  // --------------------

  Game_BattlerBase.prototype.skillItemCost = function(skill) {
    return skill.itemCost;
  };

	Game_BattlerBase.prototype.skillItemConsumeID = function(skill) {
    return skill.itemConsumeID;
  };
  
  var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function(skill) {
    _Game_BattlerBase_paySkillCost.call(this, skill);
	
	if (this.skillItemConsumeID(skill))
	{
		$gameParty.loseItem($dataItems[this.skillItemConsumeID(skill)], this.skillItemCost(skill));
	}
    
	
  };
  
  var _Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
  Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
	  if (this.skillItemConsumeID(skill))
		{
			var itemdata = $dataItems[this.skillItemConsumeID(skill)];
			var itemamount = $gameParty.numItems(itemdata);
			
			if (itemamount > 0)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else
		{
			return true;
		}
	  
	  _Game_BattlerBase_canPaySkillCost.call(this,skill);
  }
  
  

  // --------------------
  // draw item cost
  // --------------------

  var _Window_SkillList_drawSkillCost = 
   Window_SkillList.prototype.drawSkillCost;
  Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor.skillItemCost(skill) > 0) {
      var c = 'ColorManager' in window ? ColorManager : this;
      this.changeTextColor(c.textColor(itemConsumeColor));
	  
	  var itemdata = $dataItems[this.skillItemConsumeID(skill)];
	  
      this.drawText(this._actor.skillItemCost(skill) + " " + itemdata.name, x, y, width, 'right');
      return;
    }
    _Window_SkillList_drawSkillCost.call(this, skill, x, y, width);
  };

})();
