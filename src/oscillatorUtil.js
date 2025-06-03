let globalAmp = 0.2;
const transition = 1;
let globalType = 'sine';
let pglobalType = globalType;

let vibrato;
let vibratoFreq = 5;
let vibratoAmp = 10

// Setup vibrado oscillator
function setupTone(){
  vibrato = new p5.Oscillator();
  vibrato.amp(0);
  vibrato.freq(vibratoFreq);
  vibrato.disconnect();
  vibrato.start();
}


const noteChart = [49, 55, 61.74, 65.41, 
                   73.42, 82.41, 87.31]
function getTone(i, j){ // turn grid index to note Hz
  if(i <= gridRows/2) 
    return noteChart[j] * Math.pow(2, i);
  else{
    let halfInd = Math.floor(gridRows/2)
    let halfway = noteChart[j] * Math.pow(2, halfInd);
    return (i-halfInd + 1)*halfway;
  }
  // return noteChart[j] * Math.pow(2, i);
}