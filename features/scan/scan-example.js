/* Illustrated sample only: never used as a fallback for uploaded photos. */
(function(root){
  'use strict';
  root.createLoopMoveExample=function(L,options){
    options=options || {};
    var photo={id:'example-room',order:0,fileName:'小小卧室 · 示例',src:options.imageSrc || './assets/images/example-room.png',width:1448,height:1086};
    var items=[
      ['bed','床架','sleep',{x:0,y:.21,w:.41,h:.53}],
      ['desk','书桌','work',{x:.595,y:.28,w:.32,h:.33}],
      ['laptop','笔记本电脑','work',{x:.684,y:.203,w:.145,h:.13}],
      ['chair','椅子','work',{x:.67,y:.35,w:.215,h:.38}],
      ['suitcase','行李箱','floor',{x:.425,y:.385,w:.155,h:.415}],
      ['plant','绿植','floor',{x:.89,y:.405,w:.11,h:.37}]
    ];
    var observations=items.map(function(item,index){return {id:'sample-obs-'+index,entityId:'sample-item-'+index,catalogKey:item[0],displayLabel:item[1],groupId:item[2],certainty:'high',bbox:item[3]};});
    return L.inspectPhotosWithRecognizer([photo],function(){return {source:'illustrated_example',observations:observations};}).then(function(session){
      session.mode='illustrated_example';session.fixtureId=null;session.liveRecognition=false;
      session.photos[0].groups=[{id:'sleep',label:'休息区'},{id:'work',label:'工作区'},{id:'floor',label:'房间角落'}];
      return session;
    });
  };
})(window);
