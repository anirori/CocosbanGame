var size;
var level = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1],
  [1, 1, 3, 0, 2, 0, 1],
  [1, 0, 0, 4, 0, 0, 1],
  [1, 0, 3, 1, 0, 2, 1],
  [1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

var init_map = [            // 初期化用のマップ配列
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1],
  [1, 1, 3, 0, 2, 0, 1],
  [1, 0, 0, 4, 0, 0, 1],
  [1, 0, 3, 1, 0, 2, 1],
  [1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

var init_crates = [];       // 初期化用の木箱スプライト配列
var back_map = [];          // 戻り処理用のマップ配列
var back_crates = [];       // 戻り処理用の木箱スプライト配列

var playerPosition; //マップ内のプレイやの位置(ｘ、ｙ)を保持する
var playerSprite; //プレイヤーのスプライト
var cratesArray = []; //配置した木箱のスプライトを配列に保持する

var startTouch;
var endTouch;
var swipeTolerance = 10;//スワイプかを判断する閾値

var game_f = 0;

audioEngine = cc.audioEngine;

var gameScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    var layer0 = new gameLayer();
    layer0.init();
    if (!audioEngine.isMusicPlaying()) {
      audioEngine.playMusic(res.bgm_main, true);
    }
    this.addChild(layer0);
  }
});

var gameLayer = cc.Layer.extend({
  init: function() {
    this._super();
    //スプライトフレームのキャッシュオブジェクトを作成する
    cache = cc.spriteFrameCache;
    //スプライトフレームのデータを読み込む
    cache.addSpriteFrames(res.spritesheet_plist);
    var backgroundSprite = cc.Sprite.create(cache.getSpriteFrame("background.png"));
    //アンチエイリアス処理を止める
    backgroundSprite.getTexture().setAliasTexParameters();

    backgroundSprite.setPosition(240, 160);
    //スプライトがとても小さいので拡大する
    backgroundSprite.setScale(5);
    this.addChild(backgroundSprite);

    var levelSprite = cc.Sprite.create(cache.getSpriteFrame("level.png"));
    levelSprite.setPosition(240, 110);
    levelSprite.setScale(5);
    this.addChild(levelSprite);

    for (i = 0; i < 7; i++) {　　　　　　
      cratesArray[i] = [];　 //配列オブジェクトの生成
      init_crates[i] = [];
      for (j = 0; j < 7; j++) {
        switch (level[i][j]) {
          case 4:
          case 6:
            playerSprite = cc.Sprite.create(cache.getSpriteFrame("player.png"));
            playerSprite.setPosition(165 + 25 * j, 185 - 25 * i);
            playerSprite.setScale(5);
            this.addChild(playerSprite);
            playerPosition = {
              x: j,
              y: i
            };　　　　　　　　　　　　
            cratesArray[i][j] = null;　 //playerがいるので、その場所には木箱はないのでnullを代入する
            var copy = cratesArray[i][j];
            init_crates[i][j] = copy;
            break;
          case 3:
          case 5:
            var crateSprite = cc.Sprite.create(cache.getSpriteFrame("crate.png"));
            crateSprite.setPosition(165 + 25 * j, 185 - 25 * i);
            crateSprite.setScale(5);
            this.addChild(crateSprite);
            cratesArray[i][j] = crateSprite;//(i,j)の位置にcrateSpriteを入れる
            var copy = cratesArray[i][j];
            init_crates[i][j] = copy;
            break;
          default:
            cratesArray[i][j] = null;//木箱のコード以外の場合は、その場所に木箱がない値としてnullを代入する
            var copy = cratesArray[i][j];
            init_crates[i][j] = copy;
            break;
        }
      }
    }
    cc.eventManager.addListener(listener, this);
    cc.eventManager.addListener({
      event: cc.EventListener.KEYBOARD,
      onKeyPressed: function(keyCode, event){
        if(keyCode == 82) reset();          // R-Keyでリセット
        if(keyCode == 8) back();           // BACKSPACE-Keyでバック
      }
    }, this);
  },
});

var listener = cc.EventListener.create({
  event: cc.EventListener.TOUCH_ONE_BY_ONE,
  swallowTouches: true,
  onTouchBegan:function (touch,event) {
    startTouch = touch.getLocation();
    return true;
  },
  onTouchEnded:function(touch, event){
    endTouch = touch.getLocation();
    swipeDirection();
  }
});

//スワイプ方向を検出する処理
function swipeDirection(){
    var distX = endTouch.x - startTouch.x ;
    var distY = endTouch.y - startTouch.y ;
    if(Math.abs(distX)+Math.abs(distY)>swipeTolerance){
        if(Math.abs(distX)>Math.abs(distY)){
            if(distX>0){//右方向移動
                move(1,0);
            }
            else{//左方向移動
                move(-1,0);
            }
        }
        else{
            if(distY>0){ //上方向移動
              //console.log("上 move(0,-1) distY "+ distY );
              move(0,-1);
            }
            else{ //下方向移動
              //console.log("下 move(0,1) distY "+ distY );
              move(0,1);
            }
        }
    }
}

function move(deltaX,deltaY){
  back_up();      // 動きのバックアップ
  switch(level[playerPosition.y+deltaY][playerPosition.x+deltaX]){
      case 0:
      case 2:
          level[playerPosition.y][playerPosition.x]-=4;
          playerPosition.x+=deltaX;
          playerPosition.y+=deltaY;
          level[playerPosition.y][playerPosition.x]+=4;
          playerSprite.setPosition(165+25*playerPosition.x,185-25*playerPosition.y);
          break;
      case 3:
      case 5:
          if(level[playerPosition.y+deltaY*2][playerPosition.x+deltaX*2]==0 ||
          level[playerPosition.y+deltaY*2][playerPosition.x+deltaX*2]==2){
          level[playerPosition.y][playerPosition.x]-=4;
          playerPosition.x+=deltaX;
          playerPosition.y+=deltaY;
          level[playerPosition.y][playerPosition.x]+=1;
          playerSprite.setPosition(165+25*playerPosition.x,185-25*playerPosition.y);
          level[playerPosition.y+deltaY][playerPosition.x+deltaX]+=3;
          var movingCrate = cratesArray[playerPosition.y][playerPosition.x];
          movingCrate.setPosition(movingCrate.getPosition().x+25*deltaX,movingCrate.
          getPosition().y-25*deltaY);
          cratesArray[playerPosition.y+deltaY][playerPosition.x+deltaX]=movingCrate;
          cratesArray[playerPosition.y][playerPosition.x]=null;
          }
          break;
  }
  complete_check()      //クリアの確認
}

// リセット処理
function reset(){
  for (var i = 0; i < 7; i++){
    for (var j = 0; j < 7; j++){
      var copy = init_map[i][j];
      level[i][j] = copy;
      switch (level[i][j]) {
        case 4:
        case 6:
          playerSprite.setPosition(165 + 25 * j, 185 - 25 * i);
          playerPosition = {
            x: j,
            y: i
          };
          var copy = init_crates[i][j];
          cratesArray[i][j] = copy;
          break;
        case 3:
        case 5:
          var copy = init_crates[i][j];
          cratesArray[i][j] = copy;
          var crateSprite = cratesArray[i][j];
          crateSprite.setPosition(165 + 25 * j, 185 - 25 * i);
          break;
        default:
          var copy = init_crates[i][j];
          cratesArray[i][j] = copy;
          break;
      }
    }
  }
}

// １行動前のバックアップ
function back_up(){
  for (var i = 0; i < 7; i++){
    back_map[i] = [];
    back_crates[i] = [];
    for (var j = 0; j < 7; j++){
      var copy1 = level[i][j];
      back_map[i][j] = copy1;
      var copy2 = cratesArray[i][j];
      back_crates[i][j] = copy2;
    }
  }
}

// 1行動前に戻る処理
function back(){
  for (var i = 0; i < 7; i++){
    for (var j = 0; j < 7; j++){
      var copy1 = back_map[i][j];
      level[i][j] = copy1;
      switch (level[i][j]) {
        case 4:
        case 6:
          playerSprite.setPosition(165 + 25 * j, 185 - 25 * i);
          playerPosition = {
            x: j,
            y: i
          };
          var copy2 = back_crates[i][j];
          cratesArray[i][j] = copy2;
          break;
        case 3:
        case 5:
          var copy2 = back_crates[i][j];
          cratesArray[i][j] = copy2;
          var crateSprite = cratesArray[i][j];
          crateSprite.setPosition(165 + 25 * j, 185 - 25 * i);
          break;
        default:
          var copy2 = back_crates[i][j];
          cratesArray[i][j] = copy2;
          break;
      }
    }
  }
}

// クリアチェック処理
function complete_check(){
  var game_f = 0;
  for (var i = 0; i < 7; i++) {
    for (var j = 0; j < 7; j++) {
      if ( level[i][j] == 5 ) game_f++;
    }
  }
  console.log(game_f);
  if (game_f == 2){
    if (audioEngine.isMusicPlaying()) {
      audioEngine.stopMusic();
    }
    cc.director.runScene(new gameover());
  }
}
