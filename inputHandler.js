const palmPadd = 20; // palm padding [px]

const gridRows = 7;
const gridCols = 7;

let closedHandDetection = true;

class keyButton {
  constructor(x, y, w, Hz) {
    this.x = x;
    this.y = y;
    this.size = w;
    
    this.osc = new p5.Oscillator(globalType);
    this.osc.start();
    this.osc.amp(0);
    this.osc.freq(Hz);
    // this.osc.freq(vibrato);
    this.playing = false;
  }
  
  playNote() {
    if(this.playing){
      this.osc.freq(vibrato, transition);
      this.osc.amp(globalAmp, transition);
    }else{
      this.osc.amp(0, transition);
    }
  }
  
  show() {
    push();
    
    if(this.playing){
      strokeWeight(3);
      let c = hslToRgb( 
        map(this.x, width*0.38, width, 0, 360), 
        70, 61, 148*(globalAmp/maxAmp || 0.4)
      ) 
      stroke(c);
      fill( red(c), green(c), blue(c), alpha(c)*0.3);
    } 
    else {
      stroke(128, 5);
      noFill();
    }
    
    rect(this.x, this.y, 
         this.size, this.size );

    pop();    
  }
  
  isPressed(points){
    if(points.length == 0){
      this.playing = false;
      return false;
    }
    
    let tips = [];
    for(let i = 4; i <= 20; i+= 4){
      if(!closedHandDetection || isFingerUp(points[i], points))
        tips.push(points[i]);
    }
    
    for(let t of tips){
      if(
         t.x >= this.x && 
         t.x < this.x + this.size &&
         t.y >= this.y &&
         t.y < this.y + this.size
      ){
        this.playing = true;
        return true;
      }
    }
    this.playing = false;
    return false;
  }
}

class keyGrid {
  constructor(size){
    this.size = size;
    
    let keySize = size/gridCols;
    
    this.grid = Array.from(
      { length: gridRows }, () => 
      Array.from(
        { length: gridCols },() => undefined 
      )
    );
    
    for(let i = 0; i < gridRows; i++){
    for(let j = 0; j < gridCols; j++){
      let x = j*keySize + (width-size);
      let y = i*keySize + (height-keySize*gridRows)*0.5;
      let k = 
      new keyButton(x, y, keySize, 
              getTone(gridRows-i-1, j) );
      this.grid[i][j] = k;
    }}
  }
  
  interact(points){
    let tips = [];
    
    for(let i = 4; i <= 20; i+= 4){
      // if(isFingerUp(points[i], points))
        tips.push(points[i]);
    }
    
    
    
    for(let row of this.grid ){
    for(let k of row){
      k.isPressed(points);
      k.playNote();
    }}
  }
  
  updateButtonType(){
    if(pglobalType == globalType)
      return;
    
    for(let i = 0; i < gridRows; i++){
    for(let j = 0; j < gridCols; j++){
      this.grid[i][j].osc.setType(globalType);
    }}
  }
  
  manualStartup(){
  for(let i = 0; i < gridRows; i++){
  for(let j = 0; j < gridCols; j++){
    this.grid[i][j].osc.stop();
    this.grid[i][j].osc.start();

  }}
}
  
  show() {
    for(let row of this.grid ){
    for(let k of row){      
      k.show();
    }}
  }
}

function isFingerUp(tip, points){
  const palm = [
    points[0], points[1] , points[5],
    points[9], points[13], points[17]
  ];
  
  let tl = createVector(width, height);
  let br = createVector(0,0);
  for(let p of palm){
    if(p.x < tl.x)
      tl.x = p.x
    if(p.x > br.x)
      br.x = p.x
    
    if(p.y < tl.y)
      tl.y = p.y
    if(p.y > br.y)
      br.y = p.y
  }
  
  tl.x -= palmPadd;
  tl.y -= palmPadd*0.5;
  br.x += palmPadd;
  // br.y += palmPadd;
  
  push();
  stroke(220, 0, 0);
  noFill();
  rect(tl.x, tl.y, br.x-tl.x, br.y-tl.y);
  pop();
  
  return (tip.x < tl.x || tip.x > br.x ||
          tip.y < tl.y || tip.y > br.y )
}

function hslToRgb(h, s, l, al){
  s *= 0.01;
  l *= 0.01;
  let r, g, b;

  const k = n => (n+h / 30) % 12;
  const a = s *Math.min(l, 1-l);
  const f = n => 
  l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
  r = 255*f(0);
  g = 255*f(8);
  b = 255*f(4);
  return color(r, g, b, al)
}