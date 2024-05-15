// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
const artworkWidth = 1000;
const artworkHeight = 1000;
const workingImageWidth = 150;
const workingImageHeight = 150;
const max_steps = 10000;
const iters_per_steps = 5000;
let img;
let collor_pallete;
var sorted_image;
let step = 0


function preload() {
  prepareP5Js(); // Order is important! First setup randomness then prepare the token
  prepareToken(); // Do this as soon as possible in your code (before loading any resources)
  
  
  // img = loadImage('img/332736.jpg')
  // img = loadImage('img/2669108.jpg')
  img = loadImage('img/2518195.jpg')
}

function setup() {
  createCanvas(artworkWidth, artworkHeight);
  img.resize(workingImageWidth, workingImageHeight);
  collor_pallete = extractCollorPaletteFromImage(img)
  // colorMode(HSB, 360, 100, 100, 1);
  // noLoop();
  frameRate(60);
  // frameRate(1);
  // pixelDensity(displayDensity());
  pixelDensity(4);
  noSmooth();
  print(img.width);
  print(img.height);
  
  //By default, rotations are specified in radians
  // textFont(plexMonoFont);
  // textSize(16);
  // textAlign(CENTER, CENTER);
  // img = sortStep(img)
  scaleCanvasToFit(artworkWidth, artworkHeight);
}

function draw() {

  // if (frameCount === 1){
  //   capturer.start()
  // }

  img.resize(workingImageWidth, workingImageHeight);
  
  // const numberOfColumns = Math.ceil(Math.sqrt(collor_pallete.length));
  // const squareSize = workingImageWidth / numberOfColumns;
  // const yOffset = (workingImageHeight - (squareSize * numberOfColumns)) / 2;
  
  // image(img, 0,0)
  // for (let row = 0; row < numberOfColumns; row++) {
  //   for (let col = 0; col < numberOfColumns; col++) {
  //     let i = row * numberOfColumns + col;
  //     if (i < collor_pallete.length) {
  //       fill(collor_pallete[i]);
  //       square(col * squareSize, yOffset + row * squareSize, squareSize);
  //     }
  //   }
  // }
  if (step < max_steps) {
    // img = sort_step(img)
    img = sort_step_random(img)
    step+=1
  }
  // Example of scaling an image to fit the canvas while maintaining aspect ratio
  const scaleFactor = min(artworkWidth / img.width, artworkHeight / img.height);
  image(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
  // image(img, 0,0)

  hl.token.capturePreview();
  // if (frameCount < 360){
  //   capturer.capture(canvas)
  // } else if (frameCount === 360){
  //   capturer.save()
  //   capturer.stop()
  // }
}

function windowResized() {
  scaleCanvasToFit(artworkWidth, artworkHeight);
}

// We are using p5.js which means we can set the seed and use p5.js random methods instead of
// hl-gen.js for simplicity.
function prepareP5Js() {
  const hlRandomSeed = hl.random(1_000_000_000_000);
  randomSeed(hlRandomSeed);
  noiseSeed(hlRandomSeed);
}

function prepareToken() {
  // Notice we are using "random()" from p5.js and not "hl.random()" because we set it up in "prepareP5Js()"
  // You can use which ever is more comfortable for you.
  
  const traits = {
  };

  hl.token.setTraits(traits);
  hl.token.setName('');
  hl.token.setDescription(
    ''
  );
}
