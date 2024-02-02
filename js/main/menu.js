const menuSystem = {};
menuSystem.levels = 15;
menuSystem.level = -1;
menuSystem.lastSave = -1;
menuSystem.levelJustBeaten = -1;
menuSystem.allowSwitchItems = false;
menuSystem.gameVersion = "balls";

menuSystem.init = function() {
  menuSystem.mainMenu = document.createElement("div");
  var mainMenu = menuSystem.mainMenu;
  document.body.appendChild(mainMenu);
  mainMenu.style = "position: fixed; top: 0; width:100%; height: 100%; text-align: center; background-color: rgba(0,0,0,0.2)";
  mainMenu.innerHTML = `
    <br>
    <br>
    <br>
    <br>
    <h1 style="margin-left: 0%">WORMHOLES</h1>
    <h3>`+menuSystem.gameVersion+`</h3>
    <button style='left: 33.3%; width: 33.3%; top: 25%' onclick="menuSystem.levelSelectScreen()"><h1>PLAY</h1></button>
    <button style='left: 33.3%; width: 33.3%; top: 35%' onclick="var popup = window.open('about:blank',false,'width=1'); popup.document.write('<h1>WORMHOLES</h1>A game by ExplodIng_Andrey<br><br><b>Special thanks to:</b><br>Metalarse1234 - suggestions<br>Larry - testing<br>Cakrows - suggestions<br>The J - testing<br>TonyTheBoi - testing<br>Pixi - testing<br>dsinkerii - suggestions<br>Lightbulb - testing<br><br><i>If you believe something is wrong here, (e.g. something is missing), let me know!</i>'); if(popup.closed) alert('Thanks to everyone who tested!')"><h1>CREDITS</h1></button>
    <button style='left: 33.3%; width: 33.3%; top: 45%' onclick="var a = confirm('Are you sure? This will erase your level saves!'); if(a) localStorage['wormholes.levels'] = 1;"><h1>RESET</h1></button>
  `;
  //mainMenu.style.marginLeft = (innerWidth/2-mainMenu.getBoundingClientRect().width)+"px";
  //other uis
  menuSystem.levelCompletedScreen();
  menuSystem.pauseScreen();
  menuSystem.itemInstructions = document.createElement("div");
  menuSystem.itemInstructions.style = "position:fixed;top:0;right:0";
  document.body.appendChild(menuSystem.itemInstructions);
  //if save doesn't exist, create it
  localStorage["wormholes.levels"] = localStorage["wormholes.levels"] || "1";
  //events
  document.body.addEventListener("keypress", function(event){
    if(!isNaN(Number(event.key)) && menuSystem.allowSwitchItems && menuSystem.allowSwitchItems[Number(event.key)-1]) {
      itemSystem.switchTo(menuSystem.allowSwitchItems[Number(event.key)-1]);
    }
  });
}

menuSystem.levelSelectScreen = function() {
  menuSystem.levelSelect = menuSystem.mainMenu.cloneNode();
  document.body.appendChild(menuSystem.levelSelect);
  menuSystem.mainMenu.style.display = "none";
  menuSystem.levelSelect.innerHTML = `
    <br>
    <br>
    <br>
    <br>
    <h1 style="margin-left: 0%">WORMHOLES - LEVEL SELECT</h1>
    <div id="levels"></div>
  `
}

menuSystem.play = function(level,fullName) {
  levelBuilder.clearScene();
  itemSystem.currentItem = false;
  itemSystem.lastItem = false;
  itemSystem.viewModel.children[0] && itemSystem.viewModel.children[0].removeFromParent();
  player.character.body.type = 1;
  player.character.body.velocity.set(0,0,0);
  levelBuilder[(!fullName ? "level" : "")+level]();
  menuSystem.levelSelect.style.display = "none";
  mainGame.controls.PointerLock.lock();
  menuSystem.level = level;
}

menuSystem.update = function() {
  menuSystem.pause.style.display = "none";
  if(menuSystem.mainMenu.style.display != "none" || menuSystem.levelSelect.style.display != "none" || menuSystem.levelCompleted.style.display != "none") {
    mainGame.controls.PointerLock.unlock();
  } else {
    menuSystem.pause.style.display = !mainGame.controls.PointerLock.isLocked ? "block" : "none";
  }
  document.getElementById("level").innerHTML = menuSystem.levelJustBeaten;
  document.getElementById("next_level").disabled = menuSystem.levelJustBeaten == menuSystem.levels;
  document.getElementById("victory").style.display = menuSystem.levelJustBeaten == menuSystem.levels ? "block" : "none";
  if(menuSystem.lastSave != localStorage["wormholes.levels"] && document.getElementById("levels")) {
    menuSystem.lastSave = localStorage["wormholes.levels"];
    document.getElementById("levels").innerHTML = "";
    for(var level = 1; level < menuSystem.levels+1; level ++) {
      document.getElementById("levels").innerHTML += "<button style='left: "+(33.3+5*((level-1)%7)+1)+"%; width: 3vw; top: "+(20+10*Math.floor((level-1)/7))+"%;filter:"+(level == localStorage["wormholes.levels"] ? "contrast(1.3);animation-name:current;animation-duration:2s;animation-iteration-count: infinite;" : "contrast(1)")+";' onclick='menuSystem.play("+level+")' "+(level > localStorage["wormholes.levels"] ? "disabled" : "")+"><h1>"+(level <= localStorage["wormholes.levels"] ? level : "&#128274;")+"</h1></button>";
    }
  }
  menuSystem.itemInstructions.innerHTML = "";
  if(menuSystem.allowSwitchItems) {
    menuSystem.allowSwitchItems.forEach(function(item,index){
      menuSystem.itemInstructions.innerHTML += "<h1 style='color:"+(item == itemSystem.currentItem ? "#e0e0e0" : "black")+"'>"+(index+1)+": "+item+"</h1>";
    });
  }
}

menuSystem.levelCompletedScreen = function() {
  menuSystem.levelCompleted = menuSystem.mainMenu.cloneNode();
  document.body.appendChild(menuSystem.levelCompleted);
  menuSystem.levelCompleted.style.display = "none";
  menuSystem.levelCompleted.innerHTML = `
    <br>
    <br>
    <br>
    <br>
    <h1 style="margin-left: 0%">WORMHOLES - LEVEL COMPLETED</h1>
    <br>
    <h2 id='victory'>YOU WIN! CONGRATULATIONS!</h2>
    <br>
    Well done! You beat level <b id='level'>guh</b>!
    <h1>&#11088;&#11088;&#11088;</h1>
    <br>
    <br>
    <button style='left: 36.33%; width: 5vw; top: 40%' onclick='menuSystem.play(menuSystem.levelJustBeaten+1);menuSystem.levelCompleted.style.display = "none";' id='next_level' title="Next level"><h1><img src="textures/UI/next.png"></img></h1></button>
    <button style='left: 47.33%; width: 5vw; top: 40%' onclick='menuSystem.play(menuSystem.levelJustBeaten);menuSystem.levelCompleted.style.display = "none";' title="Play again"><h1><img src="textures/UI/restart.png"></img></h1></button>
    <button style='left: 58.33%; width: 5vw; top: 40%' onclick='menuSystem.levelSelect.style.display = "block";menuSystem.levelCompleted.style.display = "none";' title="Choose level"><h1><img src="textures/UI/level.png"></img></h1></button> `
}

menuSystem.pauseScreen = function() {
  menuSystem.pause = menuSystem.mainMenu.cloneNode();
  document.body.appendChild(menuSystem.pause);
  menuSystem.pause.style.display = "none";
  menuSystem.pause.style.backgroundColor = "rgba(0,0,0,0.1)";
  menuSystem.pause.innerHTML = `
    <br>
    <br>
    <br>
    <br>
    <h1 style="margin-left: 0%">WORMHOLES - GAME PAUSED</h1>
    <br>
    <br>
    <br>
    <br>
    <button style='left: 36.33%; width: 5vw; top: 40%' onclick='mainGame.controls.PointerLock.lock()' title="Resume"><h1><img src="textures/UI/resume.png"></img></h1></button>
    <button style='left: 47.33%; width: 5vw; top: 40%' onclick='menuSystem.play(menuSystem.level);menuSystem.levelCompleted.style.display = "none";' title="Restart level"><h1><img src="textures/UI/restart.png"></img></h1></button>
    <button style='left: 58.33%; width: 5vw; top: 40%' onclick='menuSystem.play("backgroundLevel",true);player.character.body.type = 2;menuSystem.levelSelect.style.display = "block";menuSystem.levelCompleted.style.display = "none";' title="Choose level"><h1><img src="textures/UI/level.png"></img></h1></button> `
}