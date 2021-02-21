 /*:
 * @target MZ
 * @plugindesc 
 * The Hud for JABS. 
 * @author JE
 * @url https://dev.azure.com/je-can-code/RPG%20Maker/_git/rmmz
 * @help
 * # Start of Help
 * 
 * # End of Help
 * 
 * @param BreakHead
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param Extensions
 * @default Modify Below
 *
 * @param BreakSettings
 * @text --------------------------
 * @default ----------------------------------
 * 
 * @param Enabled
 * @type boolean
 * @desc Use Hud?
 * @default true
 * 
 * @command Show Hud
 * @text Show Hud
 * @desc Shows the Hud on the map.
 * 
 * @command Hide Hud
 * @text Hide Hud
 * @desc Hides the Hud on the map.
 */

/**
 * The core where all of my extensions live: in the `J` object.
 */
var J = J || {};

/**
 * The plugin umbrella that governs all things related to this plugin.
 */
J.Hud = {};


/**
 * The `metadata` associated with this plugin, such as version.
 */
J.Hud.Metadata = {};
J.Hud.Metadata.Version = 1.00;
J.Hud.Metadata.Name = `J-Hud`;

/**
 * The actual `plugin parameters` extracted from RMMZ.
 */
J.Hud.PluginParameters = PluginManager.parameters(`J-Hud`);
J.Hud.Metadata.Active = Boolean(J.Hud.PluginParameters['Enabled']);
J.Hud.Metadata.Enabled = true;

/**
 * A collection of all aliased methods for this plugin.
 */
J.Hud.Aliased = {};
J.Hud.Aliased.Scene_Map = {};

/**
 * Plugin command for enabling the text log and showing it.
 */
PluginManager.registerCommand(J.Hud.Metadata.Name, "Show Hud", () => {
  J.Hud.Metadata.Active = true;
});

/**
 * Plugin command for disabling the text log and hiding it.
 */
PluginManager.registerCommand(J.Hud.Metadata.Name, "Hide Hud", () => {
  J.Hud.Metadata.Active = false;
});

//#region Scene objects
//#region Scene_Map
/**
 * Hooks into the `Scene_Map.initialize` function and adds the JABS objects for tracking.
 */
J.Hud.Aliased.Scene_Map.initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function() {
  J.Hud.Aliased.Scene_Map.initialize.call(this);
  this._j = this._j || {};
  this._j._hud = null;
};

/**
 * Create the Hud with all the rest of the windows.
 */
J.Hud.Aliased.Scene_Map.createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
  this.createJabsHud();
  J.Hud.Aliased.Scene_Map.createAllWindows.call(this);
};

/**
 * Creates the default HUD for JABS.
 */
Scene_Map.prototype.createJabsHud = function() {
  const ww = 400;
  const wh = 200;
  const wx = -((Graphics.width - Graphics.boxWidth) / 2);
  const wy = -((Graphics.height - Graphics.boxHeight) / 2);
  const rect = new Rectangle(wx, wy, ww, wh);
  this._j._hud = new Window_Hud(rect);
  this.addWindow(this._j._hud);
};

/**
 * If the HUD is in use, move the map name over a bit.
 */
J.Hud.Aliased.mapNameWindowRect = Scene_Map.prototype.mapNameWindowRect;
Scene_Map.prototype.mapNameWindowRect = function() {
  if (J.Hud.Metadata.Enabled) {
    const wx = this._j._hud.width;
    const wy = 0;
    const ww = 360;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
  } else {
    return J.Hud.Aliased.mapNameWindowRect.call(this);
  }
};
//#endregion Scene_Map
//#endregion Scene objects

//#region Window objects
//#region Window_Hud
/**
 * The built-in Hud window that contains all of the leader's info in realtime.
 */
function Window_Hud() { this.initialize(...arguments); }
Window_Hud.prototype = Object.create(Window_Base.prototype);
Window_Hud.prototype.constructor = Window_Hud;

/**
 * Initializes the entire Hud.
 * @param {Rectangle} rect The rectangle object that defines the shape of this HUD.
 */
Window_Hud.prototype.initialize = function(rect) {
  Window_Base.prototype.initialize.call(this, rect);
  this.opacity = 0;
  this.initMembers();
};

/**
 * Initializes the various variables required for the HUD.
 */
Window_Hud.prototype.initMembers = function() {
  /**
   * The actor being managed within this Hud.
   */
  this._actor = null;

  /**
   * The dictionary of sprites for this window, used for gauges and numbers.
   */
  this._hudSprites = {};

  /**
   * Whether or not the hud should be visible.
   */
  this._enabled = true;
};


/**
 * Refreshes the hud and forces a recreation of all sprites.
 */
Window_Hud.prototype.refresh = function() {
  this.contents.clear();
  const keys = Object.keys(this._hudSprites);
  keys.forEach(key => {
    this._hudSprites[key].destroy();
    delete this._hudSprites[key];
  })

  this._hudSprites = {};
};

/**
 * The update cycle. Refreshes values as-needed and handles all the drawing.
 */
Window_Hud.prototype.update = function() {
  Window_Base.prototype.update.call(this);
  if (this.canUpdate()) {
    this.drawHud();
  } else {
    this.refresh();
  }
};

/**
 * Toggles whether or not this hud is enabled.
 * @param {boolean} toggle Toggles the hud to be visible and operational.
 */
Window_Hud.prototype.toggle = function(toggle = !this._enabled) {
  this._enabled = toggle;
};

/**
 * Whether or not the hud actually has an actor to display data for.
 * @returns {boolean} True if there is an actor to update, false otherwise.
 */
Window_Hud.prototype.canUpdate = function() {
  if (!$gameParty || !$gameParty.leader() || !this.contents || 
    !this._enabled || !J.Hud.Metadata.Active) {
      return false;
  }

  return true;
};

/**
 * Refreshes the window and forces a recreation of all sprites.
 */
Window_Hud.prototype.refresh = function() {
  this.contents.clear();
  const keys = Object.keys(this._hudSprites);
  keys.forEach(key => {
    this._hudSprites[key].destroy();
    delete this._hudSprites[key];
  })

  this._hudSprites = {};
};

/**
 * Draws the contents of the Hud.
 */
Window_Hud.prototype.drawHud = function() {
var isactive = eval(J.Hud.PluginParameters['Enabled']);
	if (!$gameBattleMap.absEnabled || !isactive)
	{
		return;
	}
  const actor = $gameParty.leader();
  this._actor = actor;
  this.drawFace(this._actor.faceName(), this._actor.faceIndex(), 0, 0, 128, 72);
  this.drawHudGaugeSprites();
  this.drawHudNumberSprites();
  if (J.ABS.Metadata.ShowWeaponsAndBulletsInHUD)
  {
	  this.drawWeapons();
  }
  
  this.drawStates();
  //this.drawSideviewBattler(); // need to figure out how sideview battlers work.
  if (this.playerInterference()) {
    this.interferenceOpacity();
  } else {
    this.refreshOpacity();
  }
};

/**
 * Determines whether or not the player is in the way (or near it) of this window.
 * @returns {boolean} True if the player is in the way, false otherwise.
 */
Window_Hud.prototype.playerInterference = function() {
  const player = $gamePlayer;
  const playerX = player.screenX();
  const playerY = player.screenY();
  if (playerX < this.width && playerY < this.height) {
    return true;
  }

  return false;
};

/**
 * Reduces opacity of all sprites when the player is in the way.
 */
Window_Hud.prototype.interferenceOpacity = function() {
  const sprites = this._hudSprites;
  const keys = Object.keys(sprites);
  keys.forEach(key => {
    const sprite = sprites[key];
    if (sprite.opacity > 64) sprite.opacity -= 15;
    if (sprite.opacity < 64) sprite.opacity += 1;
  });
};

/**
 * Reverts the opacity to normal when the player is no longer in the way.
 */
Window_Hud.prototype.refreshOpacity = function() {
  const sprites = this._hudSprites;
  const keys = Object.keys(sprites);
  keys.forEach(key => {
    const sprite = sprites[key];
    if (sprite.opacity < 255) sprite.opacity += 15;
    if (sprite.opacity > 255) sprite.opacity = 255;
  });
};

/**
 * Draws the sideview battler that represents the current battler.
 */
Window_Hud.prototype.drawSideviewBattler = function() {
  this.placeBattlerSprite(60, 70)
};

/**
 * Places the sideview battler sprite at the designated location.
 * @param {number} x The `x` coordinate to draw this sideview battler sprite at.
 * @param {number} y The `y` coordinate to draw this sideview battler sprite at.
 */
Window_Hud.prototype.placeBattlerSprite = function(x, y) {
  const key = "actor%1-sideviewbattler".format(this._actor.actorId());
  const sprite = this.createBattlerSprite(key);
  sprite.setBattler(this._actor);
  sprite.move(x, y);
  sprite.show();
};

/**
 * Generates the sideview battler sprite to represent the current battler.
 * @param {string} key The key of this sprite.
 */
Window_Hud.prototype.createBattlerSprite = function(key) {
  const sprites = this._hudSprites;
  if (sprites[key]) {
    return sprites[key];
  } else {
    const sprite = new Sprite_Actor();
    sprites[key] = sprite;
    this.addInnerChild(sprite);
    return sprite;
  }
};

/**
 * A component of the Hud-drawing: draws the status gauges.
 */
Window_Hud.prototype.drawHudGaugeSprites = function() {
  if (J.ABS.Metadata.ShowEXPGaugeInHUD)
  {
	  this.placeGaugeSprite("hp", 100, 0, 200, 24, 14);
  }
  else
  {
	  this.placeGaugeSprite("hp", -18, 72, 148, 22, 20);
  }
  
  if (J.ABS.Metadata.ShowMPGaugeInHUD)
  {
	  this.placeGaugeSprite("mp", 100, 25, 200, 24, 14);
  }
  if (J.ABS.Metadata.ShowTPGaugeInHUD)
  {
	  this.placeGaugeSprite("tp", 100, 44, 200, 20, 8);
  }
  if (J.ABS.Metadata.ShowEXPGaugeInHUD)
  {
	  this.placeGaugeSprite("time", 0, 72, 128, 22, 20);
  }
  
  
  
};

/**
 * A component of the Hud-drawing: draws the numbers to match the gauges.
 */
Window_Hud.prototype.drawHudNumberSprites = function() {
	
  if (J.ABS.Metadata.ShowEXPGaugeInHUD)
  {
	  this.placeNumberSprite("hp", 90, -2, 5);
  }
  else
  {
	  this.placeNumberSprite("hp", -130, 76);
  }
  
  
  if (J.ABS.Metadata.ShowMPGaugeInHUD)
  {
	  this.placeNumberSprite("mp", 90, 26);
  }
  if (J.ABS.Metadata.ShowTPGaugeInHUD)
  {
	  this.placeNumberSprite("tp", 0, 44);
  }
  if (J.ABS.Metadata.ShowEXPGaugeInHUD)
  {
	  this.placeNumberSprite("xp", -110, 76);
  }
  
  
  
};
/**
 * Draws weapons icon
 */
Window_Hud.prototype.drawWeapons = function() {
  
  const iconWidth = ImageManager.iconWidth;

  const player = $gameBattleMap.getPlayerMapBattler();
  
  var allEquipmentOfBattler = player._battler._equips;
var getWeaponID = allEquipmentOfBattler[0]._itemId
var getArmorID = allEquipmentOfBattler[1]._itemId
var getBulletID = 9;
var getBulletRemaining = 300;
const weaponkey = "actor%1-mainweapon-icon".format(this._actor.actorId(), getWeaponID);
const armorkey = "actor%1-subweapon-icon".format(this._actor.actorId(), getArmorID);
const bulletkey = "actor%1-mainweapon-bullet-number-icon".format(this._actor.actorId(), getBulletID);


if (getWeaponID != null && getWeaponID != 0)
{
	var getWeaponIconID = $dataWeapons[getWeaponID].iconIndex;
	
		if (this._hudSprites[weaponkey] != null)	
		{
			this._hudSprites[weaponkey].destroy();
			delete this._hudSprites[weaponkey];
		}
		  const wsprite = this.createStateIconSprite(weaponkey, getWeaponIconID);
		  wsprite.move(130, -2);
		  wsprite.show();


		if (this._hudSprites[bulletkey] != null)	
		{
			this._hudSprites[bulletkey].destroy();
			delete this._hudSprites[bulletkey];
		}
		
		  const bsprite = this.createNumberSprite(bulletkey, "bullet", 5);
		  bsprite.move(90, 2);
		  bsprite.show();
  
		  
		  
}
else
{
	Object.keys(this._hudSprites).forEach(spriteKey => {
      if (spriteKey.contains('mainweapon')) {
        this._hudSprites[weaponkey].hide()
      }
    })
}

if (getArmorID != null && getArmorID != 0)
{
	var getArmorIconID = $dataArmors[getArmorID].iconIndex;

	if (this._hudSprites[armorkey] != null)	
		{
			this._hudSprites[armorkey].destroy();
			delete this._hudSprites[armorkey];
		}
		  const asprite = this.createStateIconSprite(armorkey, getArmorIconID);
		  asprite.move(130, -2+iconWidth + 4);
		  asprite.show();
}
else
{
	
	Object.keys(this._hudSprites).forEach(spriteKey => {
      if (spriteKey.contains('subweapon')) {
        this._hudSprites[armorkey].hide()
      }
    })
	
	
}

	

};

/**
 * Draws all state-related data for the hud.
 */
Window_Hud.prototype.drawStates = function() {
  this.hideExpiredStates();
  const iconWidth = ImageManager.iconWidth;
  if (!this._actor.states().length) return;

  const player = $gameBattleMap.getPlayerMapBattler();
  this._actor.states().forEach((state, i) => {
    const stateData = player.getStateData(state.id);
    if (stateData && stateData.active) {
      this.drawState(state, 124 + i*iconWidth, 70);
    }
  })
};

/**
 * Hides the sprites associated with a given state id.
 */
Window_Hud.prototype.hideExpiredStates = function() {
  const allStateData = $gameBattleMap.getPlayerMapBattler().getAllStateData();
  Object.keys(allStateData).forEach(stateKey => {
    Object.keys(this._hudSprites).forEach(spriteKey => {
      const match = `state-${stateKey}`;
      if (spriteKey.contains(match) && !allStateData[stateKey].active) {
        this._hudSprites[spriteKey].hide()
      }
    })
  })
};

/**
 * Draws a single state icon and it's duration timer.
 * @param {object} state The state afflicted on the character to draw.
 * @param {number} x The `x` coordinate to draw this state at.
 * @param {number} y The `y` coordinate to draw this state at.
 */
Window_Hud.prototype.drawState = function(state, x, y) {
  const stateData = $gameBattleMap.getPlayerMapBattler().getStateData(state.id);
  this.placeStateIconSprite(state.id, state.iconIndex, x, y);
  this.placeStateTimerSprite(state.id, stateData, x, y);
};

/**
 * Places the state icon at the designated location.
 * @param {number} id The id of the state.
 * @param {number} iconIndex The index of the icon associated with this state.
 * @param {number} x The `x` coordinate to draw this state at.
 * @param {number} y The `y` coordinate to draw this state at.
 */
Window_Hud.prototype.placeStateIconSprite = function(id, iconIndex, x, y) {
  const key = "actor%1-state-%2-icon".format(this._actor.actorId(), id);
  const sprite = this.createStateIconSprite(key, iconIndex);
  sprite.move(x, y);
  sprite.show();
};

/**
 * Places the timer sprite at a designated location.
 * @param {number} id The id of the state.
 * @param {object} stateData The data of the state.
 * @param {number} x The `x` coordinate to draw this state at.
 * @param {number} y The `y` coordinate to draw this state at.
 */
Window_Hud.prototype.placeStateTimerSprite = function(id, stateData, x, y) {
  const key = "actor%1-state-%2-timer".format(this._actor.actorId(), id);
  const sprite = this.createStateTimerSprite(key, stateData);
  sprite.move(x, y);
  sprite.show();
};

/**
 * Generates the state icon sprite representing an afflicted state.
 * @param {string} key The key of this sprite.
 * @param {number} iconIndex The icon index of this sprite.
 */
Window_Hud.prototype.createStateIconSprite = function(key, iconIndex) {
  const sprites = this._hudSprites;
  if (sprites[key]) {
    return sprites[key];
  } else {
    const sprite = new Sprite_Icon(iconIndex);
    sprites[key] = sprite;
    this.addInnerChild(sprite);
    return sprite;
  }
};

/**
 * Generates the state icon sprite representing an afflicted state.
 * @param {string} key The key of this sprite.
 * @param {number} stateData The state data associated with this state.
 */
Window_Hud.prototype.createStateTimerSprite = function(key, stateData) {
  const sprites = this._hudSprites;
  if (sprites[key]) {
    return sprites[key];
  } else {
    const sprite = new Sprite_StateTimer(stateData);
    sprites[key] = sprite;
    this.addInnerChild(sprite);
    return sprite;
  }
};

/**
 * Places an actor value at a designated location with the given parameters.
 * @param {string} type One of: "hp"/"mp"/"tp".
 * @param {number} x The origin `x` coordinate.
 * @param {number} y The origin `y` coordinate.
 * @param {number} fontSizeMod The variance of font size for this value.
 */
Window_Hud.prototype.placeNumberSprite = function(type, x, y, fontSizeMod) {
  const key = "actor%1-number-%2".format(this._actor.actorId(), type);
  const sprite = this.createNumberSprite(key, type, fontSizeMod);
  sprite.move(x, y);
  sprite.show();
};

/**
 * Generates the number sprite that keeps in sync with an actor's value.
 * @param {string} key The name of this number sprite.
 * @param {string} type One of: "hp"/"mp"/"tp".
 * @param {number} fontSizeMod The variance of font size for this value.
 */
Window_Hud.prototype.createNumberSprite = function(key, type, fontSizeMod) {
  const sprites = this._hudSprites;
  if (sprites[key]) {
    return sprites[key];
  } else {
    const sprite = new Sprite_ActorValue(this._actor, type, fontSizeMod);
    sprites[key] = sprite;
    this.addInnerChild(sprite);
    return sprite;
  }
};

/**
 * Places a gauge at a designated location with the given parameters.
 * @param {string} type One of: "hp"/"mp"/"tp". Determines color and value.
 * @param {number} x The origin `x` coordinate.
 * @param {number} y The origin `y` coordinate.
 * @param {number} bw The width of the bitmap for the gauge- also the width of the gauge.
 * @param {number} bh The height of the bitmap for the gauge.
 * @param {number} gh The height of the gauge itself.
 */
Window_Hud.prototype.placeGaugeSprite = function(type, x, y, bw, bh, gh) {
  const key = "actor%1-gauge-%2".format(this._actor.actorId(), type);
  const sprite = this.createGaugeSprite(key, bw, bh, gh);
  sprite.setup(this._actor, type);
  sprite.move(x, y);
  sprite.show();
};

/**
 * Creates and handles the sprite for this gauge.
 * @param {string} key The name of this gauge graphic.
 * @param {number} bw The width of the bitmap for this graphic.
 * @param {number} bh The height of the bitmap for this graphic.
 * @param {number} gh The height of the gauge of this graphic.
 */
Window_Hud.prototype.createGaugeSprite = function(key, bw, bh, gh) {
  const sprites = this._hudSprites;
  if (sprites[key]) {
      return sprites[key];
  } else {
      const sprite = new Sprite_MapGauge(bw, bh, gh);
      sprite.scale.x = 1.0; // change to match the window size?
      sprite.scale.y = 1.0;
      sprites[key] = sprite;
      this.addInnerChild(sprite);
      return sprite;
  }
};

//#endregion
//#endregion Window objects

//#region Sprite objects
//#region Sprite_StateTimer
/**
 * A sprite that displays some static text.
 */
function Sprite_StateTimer() { this.initialize(...arguments); }
Sprite_StateTimer.prototype = Object.create(Sprite.prototype);
Sprite_StateTimer.prototype.constructor = Sprite_StateTimer;
Sprite_StateTimer.prototype.initialize = function(stateData) {
  Sprite.prototype.initialize.call(this);
  this.initMembers(stateData);
  this.loadBitmap();
}

/**
 * Initializes the properties associated with this sprite.
 * @param {object} stateData The state data associated with this sprite.
 */
Sprite_StateTimer.prototype.initMembers = function(stateData) {
  this._j = {};
  this._j._stateData = stateData;
};

/**
 * Loads the bitmap into the sprite.
 */
Sprite_StateTimer.prototype.loadBitmap = function() {
  this.bitmap = new Bitmap(this.bitmapWidth(), this.bitmapHeight());
  this.bitmap.fontFace = this.fontFace();
  this.bitmap.fontSize = this.fontSize();
  this.bitmap.drawText(
    this._j._text, 
    0, 0, 
    this.bitmapWidth(), this.bitmapHeight(), 
    "center");
  }

  Sprite_StateTimer.prototype.update = function() {
  Sprite.prototype.update.call(this);
  this.updateCooldownText();
};

Sprite_StateTimer.prototype.updateCooldownText = function() {
	if (this._j._stateData != null)
	{
		 this.bitmap.clear();
	  const durationRemaining = (this._j._stateData.duration / 60).toFixed(1);

	  this.bitmap.drawText(
		durationRemaining.toString(), 
		0, 0, 
		this.bitmapWidth(), this.bitmapHeight(), 
		"center");
	}
 
};

/**
 * Determines the width of the bitmap accordingly to the length of the string.
 */
Sprite_StateTimer.prototype.bitmapWidth = function() {
  return 40;
};

/**
 * Determines the width of the bitmap accordingly to the length of the string.
 */
Sprite_StateTimer.prototype.bitmapHeight = function() {
  return this.fontSize() * 3;
};

/**
 * Determines the font size for text in this sprite.
 */
Sprite_StateTimer.prototype.fontSize = function() {
  return $gameSystem.mainFontSize() - 10;
};

/**
 * determines the font face for text in this sprite.
 */
Sprite_StateTimer.prototype.fontFace = function() {
  return $gameSystem.numberFontFace();
};
//#endregion

//#region Sprite_ActorValue
/**
 * A sprite that monitors one of the primary fluctuating values (hp/mp/tp).
 */
function Sprite_ActorValue() { this.initialize(...arguments); }
Sprite_ActorValue.prototype = Object.create(Sprite.prototype);
Sprite_ActorValue.prototype.constructor = Sprite_ActorValue;
Sprite_ActorValue.prototype.initialize = function(actor, parameter, fontSizeMod = 0) {
  this._j = {};
  Sprite.prototype.initialize.call(this);
  this.initMembers(actor, parameter, fontSizeMod);
  this.bitmap = this.createBitmap();
};

/**
 * Initializes the properties associated with this sprite.
 * @param {object} actor The actor to track the value of.
 * @param {string} parameter The parameter to track of "hp"/"mp"/"tp"/"xp".
 * @param {number} fontSizeMod The modification of the font size for this value.
 */
Sprite_ActorValue.prototype.initMembers = function(actor, parameter, fontSizeMod) {
  this._j._parameter = parameter;
  this._j._actor = actor;
  this._j._fontSizeMod = fontSizeMod;
  this._j._last = {};
  this._j._last._hp = actor.hp;
  this._j._last._mp = actor.mp;
  this._j._last._tp = actor.tp;
  this._j._last._xp = actor.currentExp();
   this._j._last._equip0 = this._j._actor._equips[0]._itemId;
  this._j._last._equip1 = this._j._actor._equips[1]._itemId;
  this._j._last._equip2 = this._j._actor._equips[2]._itemId;
  this._j._last._equip3 = this._j._actor._equips[3]._itemId;
  this._j._last._equip4 = this._j._actor._equips[4]._itemId;
  
  if (this._j._actor._equips[0]._itemId != null && this._j._actor._equips[0]._itemId > 0)
		{
				var skillidtag = $dataWeapons[this._j._actor._equips[0]._itemId].meta.skillId;
				var skillid = skillidtag;
				var itemconsumetag = $dataSkills[skillid].meta.item_consume;

				if (itemconsumetag){
					var arrayResult = eval(itemconsumetag);
					var itemconsumeid = arrayResult[0];

					var itemdata = $dataItems[itemconsumeid];
								var itemamount = $gameParty.numItems(itemdata);
						  this._j._last._bullet = itemamount;
				} 
		}
		
		
	
  this._j._autoCounter = 60;
};

/**
 * Updates the bitmap if it needs updating.
 */
Sprite_ActorValue.prototype.update = function() {
  Sprite.prototype.update.call(this);
  if (this.hasParameterChanged()) {
    this.refresh();
  }

  this.autoRefresh();
};

/**
 * Automatically refreshes the value being represented by this sprite
 * after a fixed amount of time.
 */
Sprite_ActorValue.prototype.autoRefresh = function() {
  if (this._j._autoCounter <= 0) {
    this.refresh();
    this._j._autoCounter = 60;
  }

  this._j._autoCounter--;
};

/**
 * Refreshes the value being represented by this sprite.
 */
Sprite_ActorValue.prototype.refresh = function() {
  this.bitmap = this.createBitmap();
};

/**
 * Checks whether or not a given parameter has changed.
 */
Sprite_ActorValue.prototype.hasParameterChanged = function() {
  let changed = false;
  switch (this._j._parameter) {
    case "hp": 
      changed = this._j._actor.hp != this._j._last._hp;
      if (changed) this._j._last._hp = this._j._actor.hp;
      
    case "mp": 
      changed = this._j._actor.mp != this._j._last._mp;
      if (changed) this._j._last._mp = this._j._actor.mp;
      
    case "tp": 
      changed = this._j._actor.tp != this._j._last._tp;
      if (changed) this._j._last.tp = this._j._actor.tp;
     
    case "xp": 
      changed = this._j._actor.currentExp() != this._j._last._xp;
      if (changed) this._j._last._xp = this._j._actor.currentExp();
      
	case "bullet": 
		if (this._j._actor._equips[0]._itemId != null && this._j._actor._equips[0]._itemId > 0)
		{
				var skillidtag = $dataWeapons[this._j._actor._equips[0]._itemId].meta.skillId;
				var skillid = skillidtag;
				var itemconsumetag = $dataSkills[skillid].meta.item_consume;

				if (itemconsumetag){
					var arrayResult = eval(itemconsumetag);
					var itemconsumeid = arrayResult[0];

					var itemdata = $dataItems[itemconsumeid];
								var itemamount = $gameParty.numItems(itemdata);
								
						  changed = itemamount != this._j._last._bullet;
						  if (changed) this._j._last._bullet = itemamount;

				} 
		}
      
  }
  
  
  if (!changed && this._j._actor._equips[0]._itemId != this._j._last._equip0)
  {
	  this._j._last._equip0 = this._j._actor._equips[0]._itemId;
	 changed = true;
  }
  
  if (!changed && this._j._actor._equips[1]._itemId != this._j._last._equip1)
  {
	  this._j._last._equip11 = this._j._actor._equips[1]._itemId;
	  changed = true;
  }
  
  if (!changed && this._j._actor._equips[2]._itemId != this._j._last._equip2)
  {
	  this._j._last._equip2 = this._j._actor._equips[2]._itemId;
	  changed = true;
  }
  
  if (!changed && this._j._actor._equips[3]._itemId != this._j._last._equip3)
  {
	  this._j._last._equip3 = this._j._actor._equips[3]._itemId;
	  changed = true;
  }
  
  if (!changed && this._j._actor._equips[4]._itemId != this._j._last._equip4)
  {
	  this._j._last._equip4 = this._j._actor._equips[4]._itemId;
	  changed = true;
  }
  
  return changed;
};

/**
 * Creates a bitmap to attach to this sprite that shows the value.
 */
Sprite_ActorValue.prototype.createBitmap = function() {
  let value = 0;
  const width = (this._j._parameter == "bullet" ? this.bitmapWidth() /2 : this.bitmapWidth());
  const height = (this._j._parameter == "bullet" ? this.fontSize() /2 : this.fontSize() + 4);
  const bitmap = new Bitmap(width, height);
  bitmap.fontFace = this.fontFace();
  bitmap.fontSize = (this._j._parameter == "bullet" ? this.fontSize() /2 : this.fontSize());
  switch (this._j._parameter) {
    case "hp": 
      bitmap.outlineWidth = 4;
      bitmap.outlineColor = "rgba(128, 24, 24, 1.0)";
      value = Math.floor(this._j._actor.hp);
      break;
    case "mp": 
      bitmap.outlineWidth = 4;
      bitmap.outlineColor = "rgba(24, 24, 192, 1.0)";
      value = Math.floor(this._j._actor.mp);
      break;
    case "tp": 
      bitmap.outlineWidth = 2;
      bitmap.outlineColor = "rgba(64, 128, 64, 1.0)";
      value = Math.floor(this._j._actor.tp);
      break;
    case "xp":
      bitmap.outlineWidth = 4;
      bitmap.outlineColor = "rgba(72, 72, 72, 1.0)";
      const curExp = (this._j._actor.nextLevelExp() - this._j._actor.currentLevelExp());
      const nextLv = (this._j._actor.currentExp() - this._j._actor.currentLevelExp());
      value = curExp - nextLv;
      break;
	case "bullet":
	 bitmap.outlineWidth = 4;
      bitmap.outlineColor = "rgba(64, 128, 64, 1.0)";
	  if (this._j._actor._equips[0]._itemId != null && this._j._actor._equips[0]._itemId > 0)
		{
				var skillidtag = $dataWeapons[this._j._actor._equips[0]._itemId].meta.skillId;
				var skillid = skillidtag;
				var itemconsumetag = $dataSkills[skillid].meta.item_consume;

				if (itemconsumetag){
					var arrayResult = eval(itemconsumetag);
					var itemconsumeid = arrayResult[0];

					var itemdata = $dataItems[itemconsumeid];
								var itemamount = $gameParty.numItems(itemdata);
								
						   value = itemamount;

				}
				else
				{
					value = 0;
				}
		}	
		else
		{
			value = 0;
		}
		
	  break;
  }
  if (this._j._parameter == "mp" && !J.ABS.Metadata.ShowMPGaugeInHUD)
  {
	  
  }
  else if (this._j._parameter == "tp" && !J.ABS.Metadata.ShowTPGaugeInHUD)
  {
	  
  }
  else if (this._j._parameter == "xp" && !J.ABS.Metadata.ShowEXPGaugeInHUD)
  {
	  
  }
  else
  {
	  bitmap.drawText(value, 0, 0, bitmap.width, bitmap.height, "right");
  }
  
  return bitmap;
};

/**
 * Defaults the bitmap width to be a fixed 200 pixels.
 */
Sprite_ActorValue.prototype.bitmapWidth = function() {
  return 200;
};

/**
 * Defaults the font size to be an adjusted amount from the base font size.
 */
Sprite_ActorValue.prototype.fontSize = function() {
  return $gameSystem.mainFontSize() + this._j._fontSizeMod;
};

/**
 * Defaults the font face to be the number font.
 */
Sprite_ActorValue.prototype.fontFace = function() {
  return $gameSystem.numberFontFace();
};
//#endregion
//#endregion Sprite objects