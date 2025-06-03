let mainHand = 'Left';
let offHand = 'Right';
let maxAmp = 0.5;
let sketchActive = true;
let canvasWidth = 640, canvasHeight = 480;
let modelType = 'full';
let vibratoEnabled = true;

// closedHandDetection external global | default true

function setupForm(){
  const form = document.querySelector('form');
  const handedness = form.querySelector('#handedness');
  const volume = form.querySelector('#max-volume');
  const playbackBtn = form.querySelector('#playback');
  const closedHand = form.querySelector('#closed-hand');
  const vibratoSlider = form.querySelector('#vibrato');
  const waveType = form.querySelector('#wave-type');
  const wEl = form.querySelector("#width");
  const hEl = form.querySelector("#height");
  const model_type = form.querySelector('#model-type');
  
  playbackBtn.innerText = "❚❚";
  sketchActive = true;
  
  wEl.value = canvasWidth;
  hEl.value = canvasHeight;
  
  handedness.checked = false; //default setup
  handedness.addEventListener("change", (e) => {
    if(!e.currentTarget.checked){
      mainHand = 'Left';
      offHand = 'Right';
    } else {
      offHand  =  'Left';
      mainHand = 'Right';
    }
  });
  
  volume.value = maxAmp; //default setup
  volume.addEventListener("change", (e) => {
    let ar = globalAmp/maxAmp;
    ar = (isNaN(ar)) ? 0 : constrain(ar, 0 , 1);
    print(ar)
    let readVal = parseFloat(e.currentTarget.value);
    maxAmp = (isNaN(readVal)) ? maxAmp : readVal;
    globalAmp = ar * maxAmp;
  })
  
  closedHand.checked = closedHandDetection;
  closedHand.addEventListener("change", (e) => {
    closedHandDetection = e.currentTarget.checked;    
  })
  
  vibratoSlider.checked = vibratoEnabled;
  vibratoSlider.addEventListener("change", (e) =>{
    vibratoEnabled = e.currentTarget.checked;
  })
  
  waveType.addEventListener('change', (e) =>{
    pglobalType = globalType;
    globalType = e.currentTarget.value;
  })
  
  model_type.checked = (modelType == 'full');
  
  model_type.addEventListener('change', (e) =>{
    modelType = (e.currentTarget.checked) ? 'full' : 'lite';
    
    loadHandModel();
  })
  
}

function handlePlaybackToggle(){
  const btn = document.querySelector('#playback');
  if(sketchActive){
    noLoop();
    btn.innerText = "▶";
    sketchActive = false;
  } else {
    loop();
    btn.innerText = "❚❚";
    sketchActive = true;
  }
}


function updateCanvasSize(){
  const wElement = document.querySelector("#width");
  const hElement = document.querySelector("#height");
  
  let w = parseInt(wElement.value);
  let h = parseInt(hElement.value);
  
  canvasWidth = (isNaN(w)) ? canvasWidth : w;
  canvasHeight = (isNaN(h)) ? canvasHeight : h;
  
  resizeCanvas(canvasWidth, canvasHeight); 
}