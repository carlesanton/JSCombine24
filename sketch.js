// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
const artworkWidth = 1000;
const artworkHeight = 1000;
const workingImageWidth = 250;
const workingImageHeight = 250;
// Pallete display variables
const palleteWidth = 40
const palleteHeight = 1000;
const showPallete = false;
const number_of_colors = 20;


// Pixel sort variables
let pixel_sort_step = 0
let sort_noise_scale = 360
let noise_direction_change_rate = 30;
const noise_radius = 1.5;
let angle = -180;
let noise_coordinates;
const pixel_sort_max_steps = -1;
const initial_pixel_sort_max_steps = 50; //50
const pixel_sort_iters_per_steps = 150000;

// Cellular automata variables
let cellular_automata_step = 0
let random_color_change_rate = 3;
let new_random_color_index=0;
const cellular_automata_max_steps = -1;
const initial_cellular_automata_max_steps = 0;

let img;
let collor_pallete;
var sorted_image;
let palette;
let palette_map;

const imgFiles = [
  'img/234155.jpg',
  'img/244273.jpg',
  'img/247580.jpg',
  'img/250669.jpg',
  'img/257703.jpg',
  'img/261968.jpg',
  'img/298002.jpg',
  'img/314808.jpg',
  'img/329943.jpg',
  'img/332736.jpg',
  'img/1225657.jpg',
  'img/1360200.jpg',
  'img/1639631.jpg',
  'img/1653604.jpg',
  'img/1765471.jpg',
  'img/1829806.jpg',
  'img/2518195.jpg',
  'img/2669108.jpg',
  'img/3307280.jpg',
  'img/3489753.jpg',
  'img/3526787.jpg'
]

const preview_frame = 30;

function preload() {
  prepareP5Js(); // Order is important! First setup randomness then prepare the token
  prepareToken(); // Do this as soon as possible in your code (before loading any resources)
  
  img = loadImage(imgFiles[floor(random(imgFiles.length))])

}

function setup() {
  createCanvas(artworkWidth, artworkHeight);
  img.resize(workingImageWidth, workingImageHeight);
  // colorMode(HSB, 360, 100, 100, 1);
  // noLoop();
  frameRate(60);
  // frameRate(1);
  pixelDensity(4);
  noSmooth();
  
  scaleCanvasToFit(artworkWidth, artworkHeight);

  img = colorQuantize(img, number_of_colors, get_pallete=true)
  palette = extractCollorPaletteFromImage(img)
  palette_map = buildPaletteIndexDict(palette)

  // Pixel Sort
  angle = noise(frameCount)*sort_noise_scale;
  noise_coordinates = angleToCoordinates(angle, noise_radius);
  for (let i=0;i < initial_pixel_sort_max_steps; i++) {
    // img = sort_step(img)
    img = sort_step_random(img, pixel_sort_iters_per_steps, noise_coordinates)
  }

  // Cellular automata
  for (let j=0;j < initial_cellular_automata_max_steps; j++) {
    img = cellular_automata(img)
    // console.log(j)
  }

}

function draw() {

  img.resize(workingImageWidth, workingImageHeight);

  // Pixel sorting
  if (pixel_sort_step < pixel_sort_max_steps || pixel_sort_max_steps == -1) {
    if (frameCount%noise_direction_change_rate==1){
      angle = noise(frameCount/noise_direction_change_rate)*sort_noise_scale;
    }
    // console.log(angle)
    noise_coordinates = angleToCoordinates(angle, noise_radius);
    // console.log(noise_coordinates)
    img = sort_step_random(img, pixel_sort_iters_per_steps, direction=noise_coordinates)
    pixel_sort_step+=1
  }

  // Cellular Automata
  if (cellular_automata_step < cellular_automata_max_steps || cellular_automata_max_steps ==-1) {
    if (frameCount%random_color_change_rate==1){
      new_random_color_index = Math.round(random(0,palette.length-1))
    }
    img = cellular_automata_multicolor_cicle(img, palette, new_random_color_index)
    cellular_automata_step+=1
  }
  // Example of scaling an image to fit the canvas while maintaining aspect ratio
  const scaleFactor = min(artworkWidth / img.width, artworkHeight / img.height);
  image(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
  // image(img, 0,0)

  if (frameCount == preview_frame) {
    console.log('Saving Preview')
    hl.token.capturePreview();
  }
  if (showPallete){
    displayPalette(palette, palleteWidth, palleteHeight)
  }
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
  hl.token.setName('Generative Pixel Lanscapes');
  hl.token.setDescription(
    'Generative landscape'
  );
}
