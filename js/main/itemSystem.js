const itemSystem = {};
itemSystem.currentItem = false;
itemSystem.lastItem = false;
itemSystem.models = {};
itemSystem.loader = new THREE.GLTFLoader();

itemSystem.init = function() {
  itemSystem.viewModel = new THREE.Group();
  mainGame.scene.add(itemSystem.viewModel);
  document.body.addEventListener("mousedown", function(event){
    mainGame.controls.PointerLock.isLocked && itemSystem.currentItem && itemTypes[itemSystem.currentItem].use(event);
  });
}

itemSystem.prepareItem = function(name) {
  itemSystem.models[name] = "<loading>";
  itemSystem.loader.load("models/items/"+name+".glb", function(e){
    itemSystem.models[name] = e.scene;
  });
}

itemSystem.switchTo = function(name) {
  itemSystem.currentItem = name;
}

itemSystem.update = function() {
  itemSystem.viewModel.lookAt(itemSystem.viewModel.position);
  //itemSystem.viewModel.applyQuaternion(mainGame.camera.quaternion);
  itemSystem.viewModel.position.copy(player.character.position.clone().add(new THREE.Vector3(0,player.character.scale.y/2,0)));
  itemSystem.viewModel.rotation.reorder("YXZ");
  itemSystem.viewModel.rotation.set(0,mainGame.camera.rotation.y-Math.PI/2,-mainGame.camera.rotation.x);
  itemSystem.viewModel.rotation.reorder("YXZ");
  if(itemSystem.currentItem != itemSystem.lastItem) {
    if(!itemSystem.models[itemSystem.currentItem]) {
      itemSystem.prepareItem(itemSystem.currentItem);
    }
    if(itemSystem.models[itemSystem.currentItem] != "<loading>") {
      if(!itemSystem.models[itemSystem.currentItem].parent) {
        itemSystem.viewModel.add(itemSystem.models[itemSystem.currentItem]);
        itemSystem.lastItem && itemSystem.models[itemSystem.lastItem].removeFromParent();
        itemSystem.lastItem = itemSystem.currentItem;
      }
    }
  }
  if(Object.values(player.movement).toString().includes(true)) {
    itemSystem.viewModel.position.y += Math.sin(Date.now()/200)/7;
  }
  var a = player.character.body.velocity.y/30;
  itemSystem.viewModel.position.y -= (a > -1 ? a : -1);
  itemSystem.currentItem && itemTypes[itemSystem.currentItem].update && itemTypes[itemSystem.currentItem].update();
}