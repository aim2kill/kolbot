/**
*  @filename    CreepingFeature.js
*  @author      theBGuy
*  @desc        kill Creeping Feature
*
*/

const CreepingFeature = new Runnable(
  function CreepingFeature () {
    Town.doChores();
    Town.goToTown(2);
    
    Pather.journeyTo(sdk.areas.StonyTombLvl2);
    Pather.moveToPresetMonster(sdk.areas.StonyTombLvl2, sdk.monsters.preset.CreepingFeature);
    Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.CreepingFeature));
    Pickit.pickItems();

    return true;
  },
  sdk.areas.LutGholein
);
