const cheats = {};
cheats.buffer = "";
cheats.enabled = false;

cheats.init = function() {
  document.addEventListener("keypress", function(event) {
    cheats.buffer += event.key;
    if(cheats.buffer.length > 64) {
      var a = cheats.buffer.split("");
      a.shift();
      cheats.buffer = a.join("");
    }
  });
}

cheats.update = function() {
  if(cheats.buffer.includes("monkey")) {
    cheats.enabled = true;
  }
}