const cheats = {};
cheats.buffer = "";
cheats.enabled = false;

cheats.init = function() {
  document.addEventListener("keypress", function(event) {
    cheats.buffer += event.key[0];
    if(cheats.buffer.length > 64) {
      var a = cheats.buffer.split("");
      a.shift();
      cheats.buffer = a.join("");
    }
  });
}

cheats.update = function() {
  if(cheats.buffer.includes("monkey")) {
    setTimeout(function(){
      cheats.enabled = true;
    },100);
    cheats.buffer = "";
  }
  if(cheats.buffer.includes("wormholes")) {
    menuSystem.play("originalTestingLevel",true);
    cheats.buffer = "";
  }
}