const player = {};
player.character = new THREE.Object3D();
player.character.position.set(5,3,0);
player.character.scale.set(0.8,1.8,0.8);
player.speed = 20;
player.jumpVel = 6;
player.canJump = false;
player.movement = {
  forward: false,
}
player.settings = {
  thirdPerson: false,
  autoRun: false,
  hidden: false,
}
player.cameraControlTaken = false;
player.lastCorrectPosition = new CANNON.Vec3();
player.renderHelp = false;
player.lastPositionCheck = 0;

player.init = function () {
  mainGame.scene.add(player.character);
  player.character.add(new THREE.Mesh(new THREE.BoxGeometry, new THREE.MeshBasicMaterial({color:"purple",transparent:true})));
  physicsSystem.makeHitbox(player.character);
  player.character.body.angularDamping = 1;
  player.character.body.addEventListener("collide", function(e) {
    var contactNormal = new CANNON.Vec3();
    var upAxis = new CANNON.Vec3(0,1,0);
    var contact = e.contact;
    if(contact.bi.id == player.character.body.id)
        contact.ni.negate(contactNormal);
    else
        contact.ni.copy(contactNormal);
    if(contactNormal.dot(upAxis) > 0.5) 
    player.canJump = true;
  });
  document.addEventListener("keypress", function(e){
    if(player.cameraControlTaken) return;
    if(e.key == " ") {
      if(player.canJump) {
        player.character.body.velocity.y = player.jumpVel;
        player.canJump = false;
      }
    }
    if(e.key.toLowerCase() == "w") {
      player.movement.forward = true;
    }
    if(e.key.toLowerCase() == "a") {
      player.movement.left = true;
    }
    if(e.key.toLowerCase() == "s") {
      player.movement.backward = true;
    }
    if(e.key.toLowerCase() == "d") {
      player.movement.right = true;
    }
  });
  document.addEventListener("keyup", function(e){
    if(e.key.toLowerCase() == "w") {
      player.movement.forward = false;
    }
    if(e.key.toLowerCase() == "a") {
      player.movement.left = false;
    }
    if(e.key.toLowerCase() == "s") {
      player.movement.backward = false;
    }
    if(e.key.toLowerCase() == "d") {
      player.movement.right = false;
    }
    if(typeof cheats != "undefined" && cheats.enabled) {
      if(e.key == "y") {
        player.settings.hidden = !player.settings.hidden;
      }
      if(e.key == "u") {
        player.settings.thirdPerson = !player.settings.thirdPerson;
      }
      if(e.key == "i") {
        player.speed < 50 ? player.speed += 3 : 0;
      }
      if(e.key == "o") {
        player.speed > 3 ? player.speed -= 3 : 0;
      }
      if(e.key == "p") {
        document.getElementById("load").innerHTML = "";
      }
      if(e.key == "h") {
        portalSystem.settings.renderPortals = !portalSystem.settings.renderPortals;
      }
      if(e.key == "j") {
        portalSystem.portals.forEach(function(portal) {
          portal.rendertarget_.forEach(function(target){
            mainGame.renderer.setRenderTarget(target);
            mainGame.renderer.clear();
          });
        });
      }
      if(e.key == "k") {
        player.cameraControlTaken = !player.cameraControlTaken;
      }
    }
  });
  setTimeout(function(){
    player.renderHelp = true;
  }, 0);//10000);
  player.character.body.material=new CANNON.Material({friction:0});
  var a = new CANNON.ContactMaterial(physicsSystem.world.defaultMaterial,player.character.body.material);
  a.friction = -1;
  a.restitution = 0;
  physicsSystem.world.addContactMaterial(a);
}

player.update = function () {
  if(!player.character.body) return;
  
  //prevent falling off the map
  if(Date.now() - player.lastPositionCheck > 500) {
    player.lastPositionCheck = Date.now();
    if(player.character.position.y < -2) {
      player.character.body.position.copy(player.lastCorrectPosition);
      player.character.body.velocity.set(0,0,0);
    }
    if(player.character.position.y > 0) {
      if(player.canJump && physicsSystem.isColliding(player.character)) player.lastCorrectPosition.copy(player.character.body.position);
    }
  }
  
  //movement
  var rot = mainGame.camera.rotation.reorder("YXZ").y;
  player.character.body.velocity.x = 0;
  player.character.body.velocity.z = 0;
  if(player.movement.forward || player.settings.autoRun) {
    player.character.body.velocity.x = Math.sin(rot-Math.PI)*player.speed*(player.canJump?1:0.5);
    player.character.body.velocity.z = Math.cos(rot-Math.PI)*player.speed*(player.canJump?1:0.5);
  }
  if(player.movement.left) {
    player.character.body.velocity.x = Math.sin(rot-Math.PI/2)*player.speed*(player.canJump?1:0.5);
    player.character.body.velocity.z = Math.cos(rot-Math.PI/2)*player.speed*(player.canJump?1:0.5);
  }
  if(player.movement.right) {
    player.character.body.velocity.x = Math.sin(rot+Math.PI/2)*player.speed*(player.canJump?1:0.5);
    player.character.body.velocity.z = Math.cos(rot+Math.PI/2)*player.speed*(player.canJump?1:0.5);
  }
  if(player.movement.backward) {
    player.character.body.velocity.x = Math.sin(rot)*player.speed;
    player.character.body.velocity.z = Math.cos(rot)*player.speed;
  }
  
  //camera update
  if(!player.cameraControlTaken) {
    mainGame.camera.position.copy(player.character.position.clone().add(new THREE.Vector3(0,player.character.scale.y/2,0)));
    if(player.settings.thirdPerson) {
      mainGame.camera.position.sub(new THREE.Vector3(0,0,-5).applyQuaternion(mainGame.camera.quaternion));
    }
  }
  

  //fix occasional weird camera rotation
  mainGame.camera.rotation.z=0
  
  //visibility
  player.character.visible = !player.settings.hidden;
  
  //whether or not to show help/cheat menu
  if(player.renderHelp && typeof cheats != "undefined" && cheats.enabled) {
    document.getElementById("load").innerHTML = "<h4>HELP MENU</h4><b>Player help</b><br>y key - toggle player visibility<br>u key - toggle third person<br>i key - increase speed<br>o key - decrease speed<br>p key - hide help<br><br><b>Rendering help</b><br>h key - toggle portal rendering<br>j key - refresh portals<br>k key - freecam";
  } else {
    document.getElementById("load").innerHTML = "";
  }
}