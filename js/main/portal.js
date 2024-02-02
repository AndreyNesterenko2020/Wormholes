const portalSystem = {};
portalSystem.portals = [];
portalSystem.portalgeometry = new THREE.PlaneGeometry( 1, 1, 1 );
portalSystem.portalmaterial = new THREE.MeshBasicMaterial( {map:mainGame.textureLoader.load("textures/1.png") } );
portalSystem.portalmaterial2 = new THREE.MeshBasicMaterial( {map:mainGame.textureLoader.load("textures/2.png") } );
portalSystem.oldRenderTarget = mainGame.renderer.getRenderTarget();
portalSystem.portalCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
portalSystem.portalSize = new THREE.Vector2(1.5,2.5);
portalSystem.portalCamera.aspect = portalSystem.portalSize.x/portalSystem.portalSize.y;
portalSystem.portalCamera.updateProjectionMatrix();
portalSystem.lastRender = 0;
portalSystem.settings = {
  renderFrequency: 10,
  renderPortals: true,
  resolution: 256,
  gpuSafe: false,
  renderTargetsCount: 2,
}

portalSystem.spawnPortal = function (counterpart, canvasTex, rendertarget) {
  var portal = new THREE.Mesh(portalSystem.portalgeometry, portalSystem.portalmaterial);
  if(!canvasTex) {
   portal.rendertarget_=[];
   for(var i = 0; i < portalSystem.settings.renderTargetsCount; i++) {
     portal.rendertarget_.push(new THREE.WebGLRenderTarget(portalSystem.portalSize.x*portalSystem.settings.resolution,portalSystem.portalSize.y*portalSystem.settings.resolution));
   }
   portal.currentrendertarget = 0;
  }
  portal.canvasTex = canvasTex;
  portal.rendertarget = rendertarget;
  portal.counterpart = counterpart;
  mainGame.scene.add(portal);
  portalSystem.portals.push(portal);
  //
  portal.material=new THREE.MeshBasicMaterial();// {map:mainGame.textureLoader.load("textures/0.png") } );
  //
  
  //
  var edging = new THREE.Mesh(portalSystem.portalgeometry, portalSystem.portalmaterial);
  edging.scale.setScalar(1.2);
  edging.position.z-=0.01;
  portal.add(edging);
  portal.edging = edging;
  //
  var placeholder = new THREE.Mesh(portalSystem.portalgeometry, portalSystem.portalmaterial2);
  placeholder.position.z+=0.02;
  portal.add(placeholder);
  portal.placeholder = placeholder;
  portal.scale.set(-portalSystem.portalSize.x,portalSystem.portalSize.y,-1);
  return portal;
}

portalSystem.getOtherPortal = function (portal) {
  var result = false;
  portalSystem.portals.forEach(function(portal_){
    if(portal_.counterpart == portal) {
      portal.counterpart = portal_;
      result = portal_;
    }
  });
  return result;
}

portalSystem.updatePortals = function () {
  if(Date.now() - portalSystem.lastRender < portalSystem.settings.renderFrequency) {
    return;
  } else {
    portalSystem.lastRender = Date.now();
  }
  portalSystem.portals.forEach(function(portal){
    if(!portal.material.map) {
      portal.material.map = new THREE.Texture();
      portal.material.map.image = new Image();
    }
    if(portal.counterpart) {
      if(!portalSystem.settings.renderPortals) {
        return;
      }
      portal.placeholder.visible = false;
      delete portal.material.color;
      if(!portal.rendertarget && !portal.canvasTex) {
        if(!portal.tmprenderer) {
          var tmprenderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
          tmprenderer.setSize(window.innerWidth, window.innerHeight);
          document.body.appendChild(tmprenderer.domElement);
          portal.tmprenderer = tmprenderer;
          var tmpcamera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
          portal.tmpcamera = tmpcamera;
        }
        
        portal.tmpcamera.position.copy(portal.counterpart.position);
        portal.tmpcamera.rotation.copy(portal.counterpart.rotation);//set(portal.rotation.x+mainGame.camera.rotation.x,portal.rotation.y+mainGame.camera.rotation.y,portal.rotation.z+mainGame.camera.rotation.z);
        
        portal.tmprenderer.render(mainGame.scene,portal.tmpcamera);
        portal.material.map.image.src = /*mainGame.renderer.domElement.toDataURL();*/portal.tmprenderer.domElement.toDataURL();
        portal.material.map.image.complete = true;
        portal.material.map.needsUpdate = true;
        portal.buh=portal.tmprenderer.domElement.toDataURL();
      } else {
        if(!portal.canvasTex) {
          //
          //if(!portalSystem.settings.gpuSafe) portal.rendertarget_=new THREE.WebGLRenderTarget(portalSystem.portalSize.x*portalSystem.settings.resolution,portalSystem.portalSize.y*portalSystem.settings.resolution);
          //
          //TODO: when you look through a portal at another portal which is supposed to be visible through the portal that you are looking at, it may not work properly, causing the portal output's angle to be wrong
          if(!portal.rendertarget_[portal.currentrendertarget]) portal.currentrendertarget = 0;
          
          portalSystem.portalCamera.position.copy(portal.counterpart.position);
          portalSystem.portalCamera.lookAt(portal.counterpart.position);
          portalSystem.portalCamera.applyQuaternion(mainGame.camera.quaternion);
          portalSystem.portalCamera.rotation.reorder("YXZ");
          mainGame.camera.rotation.reorder("YXZ");
          portalSystem.portalCamera.rotation.x = ((portal.counterpart.rotation.x-portal.rotation.x)-(-mainGame.camera.rotation.x));
          portalSystem.portalCamera.rotation.z = ((portal.counterpart.rotation.z-portal.rotation.z)-(-mainGame.camera.rotation.z));
          portalSystem.portalCamera.rotation.y = ((portal.counterpart.rotation.y-portal.rotation.y)-(Math.PI-mainGame.camera.rotation.y));
          portal.rendertarget_[portal.currentrendertarget].texture.colorSpace=mainGame.renderer.colorSpace;
          mainGame.renderer.setRenderTarget(portal.rendertarget_[portal.currentrendertarget]);
          mainGame.renderer.render(mainGame.scene,portalSystem.portalCamera);
          portal.material.map = portal.rendertarget_[portal.currentrendertarget].texture;
          portal.material.needsUpdate = true;
          portal.currentrendertarget++;
        } else {
          portal.material.map=new THREE.CanvasTexture(mainGame.renderer.domElement);
        }
      }
    } else {
      portal.placeholder.visible = true;
      portalSystem.getOtherPortal(portal);
      if(!portal.counterpart) {
        portal.material.color = "red";
      }
    }
    portalSystem.portalmaterial.map.offset.x=Math.sin(Date.now()/400)/70;
    portalSystem.portalmaterial.map.offset.y=Math.cos(Date.now()/400)/70;
    portalSystem.portalmaterial2.map.offset.x=Math.sin(Date.now()/300)/30;
    portalSystem.portalmaterial2.map.offset.y=Math.cos(Date.now()/300)/30;
    portal.edging.position.z = (portal.counterpart ? -0.01 : 0.01);
  });
  mainGame.renderer.setRenderTarget(portalSystem.oldRenderTarget);
}