/**
*  @filename    UnitInfo.js
*  @author      kolton, theBGuy
*  @desc        Display unit info
*
*/

include("core/prototypes.js");

(function (root, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		const v = factory();
		if (v !== undefined) module.exports = v;
	} else if (typeof define === "function" && define.amd) {
		define([], factory);
	} else {
		root.UnitInfo = factory();
	}
}(this, function () {
	/**
	 * @constructor
	 */
	function UnitInfo () {
		/**
		 * screen coordinate for info box
		 * @private
		 * @type {number}
		 */
		this.x = 200;

		/**
		 * screen coordinate for info box
		 * @private
		 * @type {number}
		 */
		this.y = 250;

		/**
		 * @private
		 * @type {any[]}
		 */
		this.hooks = [];

		/**
		 * @private
		 * @type {number | null}
		 */
		this.currentGid = null;

		/**
		 * @private
		 * @type {boolean}
		 */
		this.cleared = true;

		/**
		 * @private
		 * @type {{ x: number, y: number }}
		 */
		this.resfix = {
			x: (me.screensize ? 0 : -160),
			y: (me.screensize ? 0 : -120)
		};
	}

	/**
	 * Create info based on unit type
	 * @param {Unit} unit 
	 */
	UnitInfo.prototype.createInfo = function (unit) {
		if (typeof unit === "undefined") {
			this.remove();
		} else {
			// same unit, no changes so skip
			if (this.currentGid === unit.gid) return;
			// some hooks left over, remove them
			this.hooks.length > 0 && this.remove();
			// set new gid
			this.currentGid = unit.gid;

			switch (unit.type) {
				case sdk.unittype.Player:
					this.playerInfo(unit);

					break;
				case sdk.unittype.Monster:
					this.monsterInfo(unit);

					break;
				case sdk.unittype.Object:
				case sdk.unittype.Stairs:
					this.objectInfo(unit);

					break;
				case sdk.unittype.Item:
					this.itemInfo(unit);

					break;
			}
		}

	};

	/**
	 * Check that selected unit is still valid
	 */
	UnitInfo.prototype.check = function () {
		// make sure things got cleaned up properly if we are supposedly cleared
		if (this.hooks.length === 0 && this.cleared) return;
		// don't deal with this when an item is on our cursor
		if (me.itemoncursor) return;
		let unit = Game.getSelectedUnit();
		if (typeof unit === "undefined" || unit.gid !== this.currentGid) {
			this.remove();
		}
	};

	/**
	 * @private
	 * @param {Player} unit 
	 */
	UnitInfo.prototype.playerInfo = function (unit) {
		let string;
		let frameXsize = 0;
		let frameYsize = 20;
		let items = unit.getItemsEx();

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));

		if (items.length) {
			this.hooks.push(new Text("Equipped items:", this.x, this.y + 15, 4, 13, 2));
			frameYsize += 15;

			items.forEach(item => {
				if (item.runeword) {
					string = item.fname.split("\n")[1] + "ÿc0 " + item.fname.split("\n")[0];
				} else {
					string = Item.color(item, false) + (item.quality > sdk.items.quality.Magic && item.identified
						? item.fname.split("\n").reverse()[0].replace("ÿc4", "")
						: item.name);
				}

				this.hooks.push(new Text(string, this.x, this.y + (i + 2) * 15, 0, 13, 2));
				string.length > frameXsize && (frameXsize = string.length);
				frameYsize += 15;
			});
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, Math.round(frameXsize * 7.5) - 4, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, Math.round(frameXsize * 7.5), frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	/**
	 * @private
	 * @param {Monster} unit 
	 */
	UnitInfo.prototype.monsterInfo = function (unit) {
		let frameYsize = 125;

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("HP percent: ÿc0" + Math.round(unit.hp * 100 / 128), this.x, this.y + 15, 4, 13, 2));
		this.hooks.push(new Text("Fire resist: ÿc0" + unit.getStat(sdk.stats.FireResist), this.x, this.y + 30, 4, 13, 2));
		this.hooks.push(new Text("Cold resist: ÿc0" + unit.getStat(sdk.stats.ColdResist), this.x, this.y + 45, 4, 13, 2));
		this.hooks.push(new Text("Lightning resist: ÿc0" + unit.getStat(sdk.stats.LightResist), this.x, this.y + 60, 4, 13, 2));
		this.hooks.push(new Text("Poison resist: ÿc0" + unit.getStat(sdk.stats.PoisonResist), this.x, this.y + 75, 4, 13, 2));
		this.hooks.push(new Text("Physical resist: ÿc0" + unit.getStat(sdk.stats.DamageResist), this.x, this.y + 90, 4, 13, 2));
		this.hooks.push(new Text("Magic resist: ÿc0" + unit.getStat(sdk.stats.MagicResist), this.x, this.y + 105, 4, 13, 2));

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 136, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 140, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	/**
	 * @private
	 * @param {ItemUnit} unit 
	 */
	UnitInfo.prototype.itemInfo = function (unit) {
		let xpos = 60;
		let ypos = (me.getMerc() ? 80 : 20) + (-1 * this.resfix.y);
		let rwx = 130;
		let rwy = (me.getMerc() ? 250 : 190) + (-1 * this.resfix.y);
		let frameYsize = 65;
		let frameXsize = 25;

		this.hooks.push(new Text("Code: ÿc0" + unit.code, xpos, ypos + 0, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, xpos, ypos + 15, 4, 13, 2));
		this.hooks.push(new Text("Item Type: ÿc0" + unit.itemType, xpos, ypos + 30, 4, 13, 2));
		this.hooks.push(new Text("Item level: ÿc0" + unit.ilvl, xpos, ypos + 45, 4, 13, 2));

		this.cleared = false;
		this.socketedItems = unit.getItemsEx();

		if (this.socketedItems.length) {
			this.hooks.push(new Text("Socketed with:", xpos, ypos + 60, 4, 13, 2));
			frameYsize += 15;

			for (let i = 0; i < this.socketedItems.length; i += 1) {
				this.hooks.push(new Text(this.socketedItems[i].fname.split("\n").reverse().join(" "), xpos, ypos + (i + 5) * 15, 0, 13, 2));

				frameYsize += 15;
			}
		}
		// No runeword for Orb w/ 2 sockets (remove lowquality items??)
		if ((unit.sockets >= 2 && unit.itemType !== sdk.items.type.Orb) && (sdk.items.quality.LowQuality || sdk.items.quality.Normal || sdk.items.quality.Superior)) {
			this.hooks.push(new Text("Possible RW:", rwx, rwy, + 8, 13, 2));

			if (unit.sockets == 2) {
				// Steel, Strength & Wind
				if ((unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Mace)) {
					this.hooks.push(new Text("Wind: ÿc0Sur+El", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Strength: ÿc0Amn+Tir", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Steel: ÿc0Tir+El", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 35;
				}
				// Wind
				if ((unit.itemType === sdk.items.type.Knife || unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.AssassinClaw
					|| unit.itemType === sdk.items.type.HandtoHand || unit.itemType === sdk.items.type.Hammer || unit.itemType === sdk.items.type.Scepter
					|| unit.itemType === sdk.items.type.Spear || unit.itemType === sdk.items.type.Staff || unit.itemType === sdk.items.type.Polearm)) {
					this.hooks.push(new Text("Wind: ÿc0Sur+El", rwx, rwy + 20, 4, 13, 2));

					frameXsize += 15;
				}
				// Leaf & Strength
				if (unit.itemType === sdk.items.type.Staff) {
					this.hooks.push(new Text("Strength: ÿc0Amn+Tir", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Leaf: ÿc0Tir+Ral", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 25;
				}
				//Strength
				if ((unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Hammer || unit.itemType === sdk.items.type.Polearm
					|| unit.itemType === sdk.items.type.Scepter || unit.itemType === sdk.items.type.Spear)) {
					this.hooks.push(new Text("Strength: ÿc0Tir+El", rwx, rwy + 32, 4, 13, 2));

					frameXsize += 15;
				}
				// Zephyr
				if ((unit.itemType === sdk.items.type.Bow || unit.itemType === sdk.items.type.AmazonBow || unit.itemType === sdk.items.type.Crossbow)) {
					this.hooks.push(new Text("Zephyr: ÿc0Ort+Eth", rwx, rwy + 20, 4, 13, 2));

					frameXsize += 15;
				}
				// White
				if (unit.itemType === sdk.items.type.Wand) {
					this.hooks.push(new Text("White: ÿc0Dol+Io", rwx, rwy + 20, 4, 13, 2));

					frameXsize += 15;
				}
				// Stealth, Smoke & Prudence
				if (unit.itemType === sdk.items.type.Armor) {
					this.hooks.push(new Text("Stealth: ÿc0Tal+Eth", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Smoke: ÿc0Nef+Lum", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Prudence: ÿc0Mal+Tir", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 40;
				}
				// Lore & Nadir
				if (unit.itemType === sdk.items.type.Helm || unit.itemType === sdk.items.type.PrimalHelm || unit.itemType === sdk.items.type.Pelt
					|| unit.itemType === sdk.items.type.Circlet) {
					this.hooks.push(new Text("Lore: ÿc0Ort+Sol", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Nadir: ÿc0Nef+Tir", rwx, rwy + 32, 4, 13, 2));

					frameXsize += 25;
				}
				// Rhyme & Splendor
				if (unit.itemType === sdk.items.type.Shield || unit.itemType === sdk.items.type.AuricShields || unit.itemType === sdk.items.type.VoodooHeads) {
					this.hooks.push(new Text("Lore: ÿc0Shael+Eth", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Splendor: ÿc0Eth+Lum", rwx, rwy + 32, 4, 13, 2));

					frameXsize += 25;
				}

			}

			if (unit.sockets == 3) {
				// Edge, Melody & Venom
				if (unit.itemType === sdk.items.type.Bow || unit.itemType === sdk.items.type.AmazonBow || unit.itemType === sdk.items.type.Crossbow) {
					this.hooks.push(new Text("Edge: ÿc0Tir+Tal+Amn", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Melody: ÿc0Shael+Ko+Nef", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Venom: ÿc0Tal+Dol+Mal", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 40;
				}
				// Chaos, Malice, Venom & Fury
				if (unit.itemType === sdk.items.type.HandtoHand || unit.itemType === sdk.items.type.AssassinClaw) {
					this.hooks.push(new Text("Chaos: ÿc0Fal+Ohm+Um", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Malice: ÿc0Ith+El+Eth", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Venom: ÿc0Tal+Dol+Mal", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Fury: ÿc0Jah+Gul+Eth", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 50;
				}
				// Black
				if (unit.itemType === sdk.items.type.Club || unit.itemType === sdk.items.type.Mace || unit.itemType === sdk.items.type.Hammer) {
					this.hooks.push(new Text("Black: ÿc0Thul+Io+Nef", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 14;
				}
				// Crescent Moon
				if (unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Polearm) {
					this.hooks.push(new Text("Crescent Moon: ÿc0Shael+Um+Tir", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 14;
				}
				// Crescent Moon
				if (unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Crescent Moon: ÿc0Shael+Um+Tir", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 14;
				}
				// Fury
				if (unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Scepter || unit.itemType === sdk.items.type.Axe
					|| unit.itemType === sdk.items.type.Spear || unit.itemType === sdk.items.type.Staff || unit.itemType === sdk.items.type.Knife
					|| unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Polearm) {
					this.hooks.push(new Text("Fury: ÿc0Jah+Gul+Eth", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 14;
				}
				// King's Grace
				if (unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Scepter) {
					this.hooks.push(new Text("King's Grace: ÿc0Amn+Ral+Thul", rwx, rwy + 68, 4, 13, 2));

					frameXsize += 14;
				}
				// Lawbringer
				if (unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Scepter || unit.itemType === sdk.items.type.Hammer) {
					this.hooks.push(new Text("Lawbringer: ÿc0Amn+Lem+Ko", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 14;
				}
				// Malice
				if (unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Scepter || unit.itemType === sdk.items.type.Hammer
					|| unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Mace || unit.itemType === sdk.items.type.Spear
					|| unit.itemType === sdk.items.type.Staff || unit.itemType === sdk.items.type.Knife || unit.itemType === sdk.items.type.AmazonSpear
					|| unit.itemType === sdk.items.type.Polearm) {
					this.hooks.push(new Text("Malice: ÿc0Ith+El+Eth", rwx, rwy + 32, 4, 13, 2));

					frameXsize += 14;
				}
				// Venom
				if (unit.itemType === sdk.items.type.Sword || unit.itemType === sdk.items.type.Scepter || unit.itemType === sdk.items.type.Hammer
					|| unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Mace || unit.itemType === sdk.items.type.Spear
					|| unit.itemType === sdk.items.type.Staff || unit.itemType === sdk.items.type.Knife || unit.itemType === sdk.items.type.AmazonSpear
					|| unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Orb) {
					this.hooks.push(new Text("Venom: ÿc0Tal+Dol+Mal", rwx, rwy + 20, 4, 13, 2));

					frameXsize += 14;
				}
				// Dream, Delirium & Radiance
				if (unit.itemType === sdk.items.type.Helm || unit.itemType === sdk.items.type.PrimalHelm || unit.itemType === sdk.items.type.Pelt
					|| unit.itemType === sdk.items.type.Circlet) {
					this.hooks.push(new Text("Delirium: ÿc0Lem+Ist+Io", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Dream: ÿc0Io+Jah+Pul", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Radiance: ÿc0Nef+Sol+Ith", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 35;
				}
				// Dream, Ancient's Plegde, Dragon & Sanctuary
				if (unit.itemType === sdk.items.type.AuricShields || unit.itemType === sdk.items.type.Shield) {
					this.hooks.push(new Text("Ancient's Plegde: ÿc0Ral+Ort+Tal", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Dream: ÿc0Io+Jah+Pul", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Sanctuary: ÿc0Ko+Ko+Mal", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Dragon: ÿc0Sur+Lo+Sol", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 50;
				}
				// All 3 sockets Armor
				if (unit.itemType === sdk.items.type.Armor) {
					this.hooks.push(new Text("Bone(Nec): ÿc0Sol+Um+Um", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Duress: ÿc0Shael+Um+Thul", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Enigma: ÿc0Jah+Ith+Ber", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Enlightenment(Sorc): ÿc0Pul+Ral+Sol", rwx, rwy + 56, 4, 13, 2));
					this.hooks.push(new Text("Gloom: ÿc0Fal+Um+Pul", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Myth(Barb): ÿc0Hel+amn+Nef", rwx, rwy + 80, 4, 13, 2));
					this.hooks.push(new Text("Peace(Zon): ÿc0Shael+Thul+Amn", rwx, rwy + 92, 4, 13, 2));
					this.hooks.push(new Text("Principle(Pal): ÿc0Ral+Gul+ELd", rwx, rwy + 104, 4, 13, 2));
					this.hooks.push(new Text("Lionheart: ÿc0Hel+Lum+Fal", rwx, rwy + 116, 4, 13, 2));
					this.hooks.push(new Text("Rain(Dru): ÿc0Ort+Mal+Ith", rwx, rwy + 128, 4, 13, 2));
					this.hooks.push(new Text("Treachery(Sin): ÿc0Shael+Thul+Lem", rwx, rwy + 140, 4, 13, 2));
					this.hooks.push(new Text("Whealth: ÿc0Lem+Ko+Tir", rwx, rwy + 152, 4, 13, 2));
					this.hooks.push(new Text("Dragon: ÿc0Sur+Lo+Sol", rwx, rwy + 164, 4, 13, 2));

					frameXsize += 160;
				}

			}

			if (unit.sockets == 4) {
				// Bramble, CoH, Fortitude & Stone
				if (unit.itemType === sdk.items.type.Armor) {
					this.hooks.push(new Text("Bramble: ÿc0Ral+Ohm+Sur+Eth", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("CoH: ÿc0Dol+Um+Ber+Ist", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Fortitude: ÿc0El+Sol+Dol+Lo", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Stone: ÿc0Shael+Um+Pul+Lum", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 50;
				}
				// Phoenix & Spirit Shields
				if (unit.itemType === sdk.items.type.AuricShields || unit.itemType === sdk.items.type.Shield) {
					this.hooks.push(new Text("Spirit: ÿc0Tal+thul+Ort+Amn", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Phoenix: ÿc0Vex+Vex+Lo+Jah", rwx, rwy + 32, 4, 13, 2));

					frameXsize += 25;
				}
				// Brand, Faith, Harmony, Ice, Warth & Insight
				if (unit.itemType === sdk.items.type.Bow || unit.itemType === sdk.items.type.AmazonBow || unit.itemType === sdk.items.type.Crossbow) {
					this.hooks.push(new Text("Faith: ÿc0Ohm+Jah+Lem+Eld", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Harmony: ÿc0Tir+Ith+Sol+Ko", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Ice: ÿc0Amn+Shael+Jah+Lo", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Warth: ÿc0Pul+Lum+Ber+Mal", rwx, rwy + 56, 4, 13, 2));
					this.hooks.push(new Text("Insight: ÿc0Ral+Tir+Tal+Sol", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Passion: ÿc0Dol+Ort+Eld+Lem", rwx, rwy + 80, 4, 13, 2));
					this.hooks.push(new Text("HoJ: ÿc0Sur+cham+Amn+Lo", rwx, rwy + 92, 4, 13, 2));
					this.hooks.push(new Text("Fortitude: ÿc0El+Sol+Dol+Lo", rwx, rwy + 104, 4, 13, 2));
					this.hooks.push(new Text("Phoenix: ÿc0Vex+Vex+Lo+Jah", rwx, rwy + 116, 4, 13, 2));

					frameXsize += 110;
				}

				if (unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Hammer
					|| unit.itemType === sdk.items.type.Mace || unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Scepter
					|| unit.itemType === sdk.items.type.Spear || unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Fortitude: ÿc0El+Sol+Dol+Lo", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("HoJ: ÿc0Sur+cham+Amn+Lo", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Passion: ÿc0Dol+Ort+Eld+Lem", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Phoenix: ÿc0Vex+Vex+Lo+Jah", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 50;
				}

				if (unit.itemType === sdk.items.type.Staff) {
					this.hooks.push(new Text("HoJ: ÿc0Sur+cham+Amn+Lo", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("HotO: ÿc0Ko+Vex+Pul+Thul", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Insight: ÿc0Ral+Tir+Tal+Sol", rwx, rwy + 44, 4, 13, 2));
					this.hooks.push(new Text("Memory: ÿc0Lum+Io+Sol+Eth", rwx, rwy + 56, 4, 13, 2));
					this.hooks.push(new Text("Passion: ÿc0Dol+Ort+Eld+Lem", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Phoenix: ÿc0Vex+Vex+Lo+Jah", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 75;
				}

				if (unit.itemType === sdk.items.type.Scepter) {
					this.hooks.push(new Text("Rift: ÿc0Hel+Ko+Lem+Gul", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Holy Thunder: ÿc0eth+Ral+Ort+Tal", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 25;
				}

				if (unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Spear) {
					this.hooks.push(new Text("Pride: ÿc0Cham+Sur+Io+Lo", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Infinity: ÿc0Ber+Mal+Ber+Ist", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 25;
				}

				if (unit.itemType === sdk.items.type.Polearm) {
					this.hooks.push(new Text("Insight: ÿc0Ral+Tir+Tal+Sol", rwx, rwy + 92, 4, 13, 2));
					this.hooks.push(new Text("Rift: ÿc0Hel+Ko+Lem+Gul", rwx, rwy + 104, 4, 13, 2));

					frameXsize += 25;
				}

				if (unit.itemType === sdk.items.type.Mace) {
					this.hooks.push(new Text("HotO: ÿc0Ko+Vex+Pul+Thul", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Oath: ÿc0Shael+Pul+Mal+Lum", rwx, rwy + 80, 4, 13, 2));
					this.hooks.push(new Text("Voice of Reason: ÿc0Lem+Ko+El+Eld", rwx, rwy + 92, 4, 13, 2));

					frameXsize += 35;
				}

				if (unit.itemType === sdk.items.type.Axe) {
					this.hooks.push(new Text("Famine: ÿc0Fal+Ohm+Ort+jah", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Kingslayer: ÿc0Mal+Um+Gul+Fal", rwx, rwy + 80, 4, 13, 2));
					this.hooks.push(new Text("Oath: ÿc0Shael+Pul+Mal+Lum", rwx, rwy + 92, 4, 13, 2));

					frameXsize += 35;
				}

				if (unit.itemType === sdk.items.type.Hammer) {
					this.hooks.push(new Text("Famine: ÿc0Fal+Ohm+Ort+jah", rwx, rwy + 54, 4, 13, 2));

					frameXsize += 25;
				}

				if (unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Kingslayer: ÿc0Mal+Um+Gul+Fal", rwx, rwy + 68, 4, 13, 2));
					this.hooks.push(new Text("Oath: ÿc0Shael+Pul+Mal+Lum", rwx, rwy + 80, 4, 13, 2));
					this.hooks.push(new Text("Spirit: ÿc0Tal+Thul+Ort+Amn", rwx, rwy + 92, 4, 13, 2));
					this.hooks.push(new Text("Voice of Reason: ÿc0Lem+Ko+El+Eld", rwx, rwy + 104, 4, 13, 2));

					frameXsize += 50;
				}

			}

			if (unit.sockets == 5) {
				if (unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Death: ÿc0Hel+El+Vex+Ort+Gul", rwx, rwy + 56, 4, 13, 2));
					this.hooks.push(new Text("Grief: ÿc0Eth+Tir+Lo+Mal+Ral", rwx, rwy + 68, 4, 13, 2));

					frameXsize += 25;
				}
				// Destruction
				if (unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Destruction: ÿc0Vex+Lo+Ber+Jah+Ko", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 15;
				}
				// Beast
				if (unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Hammer || unit.itemType === sdk.items.type.Specter) {
					this.hooks.push(new Text("Beast: ÿc0Ber+Tir+Um+Mal+Lum", rwx, rwy + 80, 4, 13, 2));

					frameXsize += 15;
				}
				// Doom
				if (unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Hammer || unit.itemType === sdk.items.type.Polearm) {
					this.hooks.push(new Text("Doom: ÿc0Hel+Ohm+Um+Lo+Cham", rwx, rwy + 92, 4, 13, 2));

					frameXsize += 15;
				}
				// Obedience
				if (unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Spear) {
					this.hooks.push(new Text("Doom: ÿc0Hel+Ko+Thul+Eth+Fal", rwx, rwy + 56, 4, 13, 2));

					frameXsize += 15;
				}
				// CtA
				if (unit.itemType === sdk.items.type.AmazonBow || unit.itemType === sdk.items.type.Bow || unit.itemType === sdk.items.type.Crossbow) {
					this.hooks.push(new Text("CtA: ÿc0Amn+Ral+Mal+Ist+Ohm", rwx, rwy + 20, 4, 13, 2));

					frameXsize += 15;
				}
				// Eternity & Honor
				if (unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Hammer
					|| unit.itemType === sdk.items.type.Mace || unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Scepter
					|| unit.itemType === sdk.items.type.Spear || unit.itemType === sdk.items.type.Staff || unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("Eternity: ÿc0Amn+Ber+Ist+Sol+Sur", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Honor: ÿc0Amn+El+Ith+Tir+Sol", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("CtA: ÿc0Amn+Ral+Mal+Ist+Ohm", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 40;
				}

			}

			if (unit.sockets == 6) {
				if (unit.itemType === sdk.items.type.Axe || unit.itemType === sdk.items.type.Hammer || unit.itemType === sdk.items.type.Sword) {
					this.hooks.push(new Text("BotD: ÿc0Vex+Hel+El+Eld+Zod+Eth", rwx, rwy + 20, 4, 13, 2));
					this.hooks.push(new Text("Silence: ÿc0Dol+Eld+Hel+Ist+Tir+Vex", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Last Wish: ÿc0Jah+Mal+Jah+Sur+Jah+Ber", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 40;
				}

				if (unit.itemType === sdk.items.type.AmazonSpear || unit.itemType === sdk.items.type.Bow || unit.itemType === sdk.items.type.Crossbow
					|| unit.itemType === sdk.items.type.Polearm || unit.itemType === sdk.items.type.Spear || unit.itemType === sdk.items.type.Staff) {
					this.hooks.push(new Text("BotD: ÿc0Vex+Hel+El+Eld+Zod+Eth", rwx, rwy + 32, 4, 13, 2));
					this.hooks.push(new Text("Silence: ÿc0Dol+Eld+Hel+Ist+Tir+Vex", rwx, rwy + 44, 4, 13, 2));

					frameXsize += 25;
				}
			}
			this.hooks.push(new Box(rwx + 2, rwy - 15, 250, frameXsize, 0x0, 1, 2));
			this.hooks.push(new Frame(rwx, rwy - 15, 250, frameXsize, 2));
			this.hooks[this.hooks.length - 2].zorder = 0;
		}

		if (unit.magic && unit.identified) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));
			this.hooks.push(new Text("Suffix: ÿc0" + unit.suffixnum, xpos, ypos + frameYsize + 10, 4, 13, 2));

			frameYsize += 30;
		}

		if (unit.runeword) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));

			frameYsize += 15;
		}

		this.hooks.push(new Box(xpos + 2, ypos - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(xpos, ypos - 15, 120, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	/**
	 * @private
	 * @param {ObjectUnit} unit 
	 */
	UnitInfo.prototype.objectInfo = function (unit) {
		let frameYsize = 35;

		this.hooks.push(new Text("Type: ÿc0" + unit.type, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y + 15, 4, 13, 2));

		if (!!unit.objtype) {
			this.hooks.push(new Text((unit.name.toLowerCase().includes("shrine") ? "Type" : "Destination") + ": ÿc0" + unit.objtype, this.x, this.y + 30, 4, 13, 2));

			frameYsize += 15;
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 120, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};
	

	UnitInfo.prototype.remove = function () {
		while (this.hooks.length > 0) {
			this.hooks.shift().remove();
		}

		this.currentGid = null;
		this.cleared = true;
	};

	return UnitInfo;
}));
