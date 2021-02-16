//=============================================================================
// ItemConsumeSkill.js (ver.1.0.2)
//=============================================================================
// [Update History]
// 2021.Jan.25 Ver1.0.0 First Release by Mysticphoenix
//2021.Feb.13 Ver1.0.1 Add ability to consume weapon and armor by Mysticphoenix
//2021.Feb.16 Ver1.0.2 Fix bug where skill can be used even the MP is 0 by Mysticphoenix
/*:
 * @target MV MZ
 * @plugindesc make the skill that requires item/armor/weapon (as an ammunition)
 * @author Mysticphoenix
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
  * @param Consume Armor Color
 * @desc the text color ID of display consume armor
 * (Ex. 17 is Color Yellow)
 * @type number
 * @default 17
  @param Consume Armor Text
 * @desc the consumed armor name to be display
 * (Ex. Buckler, Robe, Boots, etc.)
 * @type number
 * @default "Armor"
  * @param Consume Weapon Color
 * @desc the text color ID of display consume weapon
 * (Ex. 17 is Color Yellow)
 * @type number
 * @default 17
  @param Consume Weapon Text
 * @desc the consumed weapon name to be display
 * (Ex. Dagger, Axe, Etc.)
 * @type number
 * @default "Weapon"
 * 
 * @help This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MV and MZ.
 *
 * This plugin enables to make item consume skill.
 *
 * [Usage]
 * write following format at skill's note:
 *  <item_consume:[99,1]> # 99 is the ID of item to consume. 1 is amount of item to consume per skill usage
  *  <armor_consume:[99,1]> # 99 is the ID of armor to consume. 1 is amount of armor to consume per skill usage. The equipped armor can be consumed too.
   *  <weapon_consume:[99,1]> # 99 is the ID of weapon to consume. 1 is amount of weapon to consume per skill usage. The equipped weapon can be consumed too.
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
	  var result2 = skill.meta.item_consume_id;
	  var result3 = skill.meta.item_consume;
	  var result4 = skill.meta.armor_consume;
	  var result5 = skill.meta.weapon_consume;
	  
      if (result){
        skill.itemCost = Number(result);
      } else {
        skill.itemCost = 0;
      }
	
	  if (result2){
        skill.itemConsumeID = Number(result2);
      } else {
        skill.itemConsumeID = 0;
      }
	  
	  if (result3){
		 var arrayResult = eval(result3);
		   skill.itemCost = Number(arrayResult[1]);
		   skill.itemConsumeID = Number(arrayResult[0]);
      } else {
		   skill.itemCost = 0;
        skill.itemConsumeID = 0;
      }
	  
	  
	  if (result4){
		   var arrayResult = eval(result4);
		   skill.armorCost = Number(arrayResult[1]);
		   skill.armorConsumeID = Number(arrayResult[0]);
      } else {
		   skill.armorCost = 0;
        skill.armorConsumeID = 0;
      }
	  
	  
	  if (result5){
		   var arrayResult = eval(result5);
		   skill.weaponCost = Number(arrayResult[1]);
		   skill.weaponConsumeID = Number(arrayResult[0]);
      } else {
		   skill.weaponCost = 0;
        skill.weaponConsumeID = 0;
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
  
  Game_BattlerBase.prototype.skillArmorCost = function(skill) {
    return skill.armorCost;
  };

	Game_BattlerBase.prototype.skillArmorConsumeID = function(skill) {
    return skill.armorConsumeID;
  };
  
  Game_BattlerBase.prototype.skillWeaponCost = function(skill) {
    return skill.armorCost;
  };

	Game_BattlerBase.prototype.skillWeaponConsumeID = function(skill) {
    return skill.weaponConsumeID;
  };
  
  var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function(skill) {
    _Game_BattlerBase_paySkillCost.call(this, skill);

	if (this.skillItemConsumeID(skill))
	{
		$gameParty.loseItem($dataItems[this.skillItemConsumeID(skill)], this.skillItemCost(skill));
	}
    
	if (this.skillArmorConsumeID(skill))
	{
		$gameParty.gainItem($dataArmors[this.skillArmorConsumeID(skill)], this.skillArmorCost(skill) * -1, true);
	}
	
	if (this.skillWeaponConsumeID(skill))
	{
		$gameParty.gainItem($dataArmors[this.skillWeaponConsumeID(skill)], this.skillWeaponCost(skill) * -1, true);
	}
	
  };
  
  var _Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
  Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
	  var result = true;
	  var allEquipmentOfBattler = this._equips; //[Weapon,Shield,Head,Body,Foot]
	  
	  if (this.skillItemConsumeID(skill))
		{
			var itemdata = $dataItems[this.skillItemConsumeID(skill)];
			var itemamount = $gameParty.numItems(itemdata);
			
			if (itemamount > 0)
			{
				
			}
			else
			{
	
				 return false;
			}
		}
		
		if (this.skillArmorConsumeID(skill))
		{
			var armordata = $dataArmors[this.skillArmorConsumeID(skill)];
			var armoramount = $gameParty.numItems(armordata);
			
			if (allEquipmentOfBattler[1]._itemId == this.skillArmorConsumeID(skill)
				|| allEquipmentOfBattler[2]._itemId == this.skillArmorConsumeID(skill)
				|| allEquipmentOfBattler[3]._itemId == this.skillArmorConsumeID(skill)
				|| allEquipmentOfBattler[4]._itemId == this.skillArmorConsumeID(skill))
				{
					armoramount += 1;
				}
			
			if (armoramount > 0)
			{
				
			}
			else
			{
				 return false;
			}
		}
		
		if (this.skillWeaponConsumeID(skill))
		{
			var weapondata = $dataWeapons[this.skillWeaponConsumeID(skill)];
			var weaponamount = $gameParty.numItems(weapondata);
			
			if (allEquipmentOfBattler[0]._itemId == this.skillWeaponConsumeID(skill))
				{
					weaponamount += 1;
				}
			
			if (weaponamount > 0)
			{
				
			}
			else
			{

				 return false;
			}
		}

	 
	  
	 return _Game_BattlerBase_canPaySkillCost.call(this,skill);
	  
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
	
	if (this._actor.skillArmorCost(skill) > 0) {
      var c = 'ColorManager' in window ? ColorManager : this;
      this.changeTextColor(c.textColor(armorConsumeColor));
	  
	  var armordata = $dataArmors[this.skillArmorConsumeID(skill)];
	  
      this.drawText(this._actor.skillArmorCost(skill) + " " + armordata.name, x, y, width, 'right');
      return;
    }
	
	if (this._actor.skillWeaponCost(skill) > 0) {
      var c = 'ColorManager' in window ? ColorManager : this;
      this.changeTextColor(c.textColor(weaponConsumeColor));
	  
	  var weapondata = $dataWeapons[this.skillWeaponConsumeID(skill)];
	  
      this.drawText(this._actor.skillWeaponCost(skill) + " " + weapondata.name, x, y, width, 'right');
      return;
    }
	
	
    _Window_SkillList_drawSkillCost.call(this, skill, x, y, width);
  };

})();


