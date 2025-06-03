let capture;
let handPose;
let handPoseStatus = 'loading';
let hands;

const sensitivity = 0.09;

let grid;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);
  frameRate(30);
  
  setupTone();
  
  setupForm();
  
  
  capture = createCapture(VIDEO);
  capture.hide();
  
  loadHandModel(); // async loading of model 
  
  if (getAudioContext().state !== 'running') {
     getAudioContext().resume();
   }
  
  grid = new keyGrid(width*0.7);  
}

function draw() {
  background(62);
  
  push();
  translate(capture.width, 0);
  scale(-1, 1);  //flip 
  image(capture, 0, 0); // video
  pop();  
  
  // Type updating on change
  if(pglobalType != globalType){
    grid.updateButtonType();
    pglobalType = globalType;
  }
  
  // Model reloading message
  if(handPoseStatus == 'loading'){
    push();
    fill(190);
    text("Loading model...", 10, height - 10)
    pop();
  }
  
  // Draw all the tracked hand points
  let gridInteractable = false;
      
  noStroke();
  // Main hand controls and drawing
  if(hands[mainHand]){     
    fill(50, 120, 240);
    let thumb = hands[mainHand].keypoints[4];
    let index = hands[mainHand].keypoints[8];
    circle(thumb.x, thumb.y, 10);
    circle(index.x, index.y, 10);

    let d = dist(thumb.x, thumb.y, 
                 index.x, index.y);
    let palLen = dist(
      hands[mainHand].keypoints[0].x, 
      hands[mainHand].keypoints[0].y,
      hands[mainHand].keypoints[9].x,
      hands[mainHand].keypoints[9].y);
    d = d/palLen*0.5*maxAmp;
    d = (d < sensitivity*maxAmp) ? 0 : d;

    globalAmp = constrain(d, 0, 1);

    // Vibrado control
    if(vibratoEnabled){
      push();
      stroke(94, 50, 240);
      fill(106, 65, 241);
      line(hands[mainHand].keypoints[0].x,   
           hands[mainHand].keypoints[0].y,
           hands[mainHand].keypoints[9].x,
           hands[mainHand].keypoints[9].y);
      
      circle(hands[mainHand].keypoints[0].x,   
           hands[mainHand].keypoints[0].y, 5)
      circle(hands[mainHand].keypoints[9].x,   
           hands[mainHand].keypoints[9].y, 5)
      pop();

      // calculating |cos| of angle of palm
      let delta = hands[mainHand].keypoints[0].x -
          hands[mainHand].keypoints[9].x;
      let vib = Math.abs( delta / palLen );
      vibrato.amp(vibratoAmp * vib);
    } else{
      vibrato.amp(0);
    }
  }

  // Off hand controls and drawing
  if(hands[offHand]) {
    gridInteractable = true;
    let kp = hands[offHand].keypoints;

    grid.interact(kp);

    fill(240, 60, 50);
    for(let i = 4; i <= 20; i+= 4)
      circle(kp[i].x, kp[i].y, 10);
  }
  
  if(!gridInteractable){
    grid.interact([]); // no hand detected, stop sound
  } 
  
  grid.show(); // draw grid
}

// async loading hand detection model
async function loadHandModel(){
  if (handPose) { //running instance gets stopped
    handPose.detectStop(); 
  }
  hands = { Left: undefined, Right: undefined };
  handPoseStatus = 'loading';
  
  handPose = ml5.handPose({ // creating model
    flipped: true,
    modelType: modelType
  }, () =>{
    handPoseStatus = 'running';
    if(capture){
      print("started capture with model type: " + 
            modelType)
    handPose.detectStart(capture, goHands);
    } else{
      print("WARN: model started and capture not detected")
    }
  });  
}

const smoothing = 0.7;
// detection parsing and formating
function goHands(detections) {
  let l = false;
  let r = false;

  for(let det of detections){
    let LR = det.handedness;

    if(LR == 'Left'){
      if(!l || det.confidence > hands[LR].confidence){
        detectionSmoothing(det, smoothing);
        l = true;
      }
    } 
    else if(!r || det.confidence > hands[LR].confidence){
        detectionSmoothing(det, smoothing);
        r = true;
    }
    
  }
  
  hands.Left = (!l) ? undefined : hands.Left;
  hands.Right = (!r) ? undefined : hands.Right; 
}

function detectionSmoothing(detection, alpha_p){
  // smoothing detections to be less jittery
  // exponential moving average method
  let LR = detection.handedness;
  if( hands[LR] == undefined){ 
    hands[LR] = detection; // first Detection
  } else {
    let newPoints = detection.keypoints.map((pt, i) => {
      const prev = hands[LR].keypoints[i];
      return {
        x: alpha_p* pt.x + (1-alpha_p) * prev.x,
        y: alpha_p* pt.y + (1-alpha_p) * prev.y
      }
    });
    detection.keypoints = newPoints;
    hands[LR] = detection;
  }
}