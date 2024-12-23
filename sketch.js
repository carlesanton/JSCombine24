import {extractCollorPaletteFromImage, buildPaletteIndexDict, displayPalette, colorQuantize} from './lib/JSGenerativeArtTools/collor_palette.js';
import {angleToCoordinates} from './lib/JSGenerativeArtTools/pixel_sort.js';
import {scaleCanvasToFit, prepareP5Js} from './lib/JSGenerativeArtTools/utils.js';
import {calculateFPS, displayFPS} from './lib/JSGenerativeArtTools/fps.js';
import {intialize_toolbar} from './toolbar.js';

// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
// Inputs
// Main
let MainInputs
// Pixel Sorting
let PSInputs;
// Cellular Automata
let CAInputs;

// Defaults
// Main
export const defaultArtworkWidth = 1280;
export const defaultArtworkHeight = 720;
export const defaultArtworkSeed = -1;
export const defaultPixelSize = 4;
export const defaultFPS = 15;

// Variables
// Main
let artworkWidth;
let artworkHeight;
let workingImageWidth;
let workingImageHeight;
let pixelSize;
let fps;
export let artwork_seed; // -1 used for random seeds, if set to a positive integer the number is used
// Pixel Sorting
let sortNoiseScale;
let noiseDirectionChangeRate;
let pixelSortMaxSteps;
let PixelSortInitialSteps;
let pixelSortingPassesPerFrame;
// Cellular Automata
let CARandomColorChangeRate;
let CAMaxSteps;
let CellularAutomataInitialSteps;

// To check if user loaded an image or default one is loaded
let loaded_user_image = false;
let image_loaded_successfuly = false;

const pixel_density = 1;
let canvas;

// FPS parametters
const showFPS = false;

// Pallete display variables
const palleteWidth = 40
const palleteHeight = 1000;
const showPallete = false;
const number_of_colors = 20;


// Pixel sort variables
let pixel_sort_step = 0
const noise_radius = 1.5;
let angle = -180;
let noise_coordinates;
let PSShader; // variable for the shader

// Cellular automata variables
let cellular_automata_step = 0
let new_random_color_index=0;
let CaShader; // variable for the shader

let img;
let collor_pallete;
var sorted_image;
let palette;
let palette_map;
let myFont;
let color_buffer;

let ca_src = '';
let ps_src = '';

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
  artwork_seed = prepareP5Js(defaultArtworkSeed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  img = loadImage(
    imgFiles[floor(random(1000000000)%imgFiles.length)],
    () => { image_loaded_successfuly = true; },
    () => { image_loaded_successfuly = false; }
)
  ca_src = loadStrings('./cellular_automata_shader.frag');
  ps_src = loadStrings('./pixel_sort_shader.frag');
}

function setup() {
  var toolbar_elements = intialize_toolbar();
  MainInputs = toolbar_elements.mainInputs;
  PSInputs = toolbar_elements.psInputs;
  CAInputs = toolbar_elements.caInputs;
  
  updateArtworkSettings()

  // Create Canvas
  canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);

  // Move Canvas to canvas-wrapper div
  canvas.parent("canvas-wrapper")

  // Set FrameRate and pixelDensity
  frameRate(fps);
  canvas.pixelDensity(pixel_density);

  CaShader = createFilterShader(ca_src.join('\n'));
  ps_src = resolveLygia(ps_src.join('\n'));
  PSShader = createFilterShader(ps_src);

  // Apply the loaded font
  textFont(myFont);

}

function draw() {
  // Pixel sorting
  color_buffer.begin();
  if (pixel_sort_step < pixelSortMaxSteps || pixelSortMaxSteps == -1) {
    if (frameCount%noiseDirectionChangeRate==1){
      angle = noise(frameCount/noiseDirectionChangeRate)*sortNoiseScale;
      noise_coordinates = angleToCoordinates(angle, noise_radius);
      PSShader.setUniform('direction', [noise_coordinates.x, noise_coordinates.y])
    }
    for (let i = 0; i < pixelSortingPassesPerFrame; i++) {
      PSShader.setUniform('iFrame', (PixelSortInitialSteps + pixel_sort_step) * pixelSortingPassesPerFrame + i)
      filter(PSShader)
    }
    pixel_sort_step+=1
  }
  color_buffer.end()

  // Cellular Automata
  color_buffer.begin();
  if (cellular_automata_step < CAMaxSteps || CAMaxSteps ==-1) {
    if (frameCount%CARandomColorChangeRate==1){
      new_random_color_index = Math.round(random(0,palette.length-1))
      CaShader.setUniform('next_random_color', palette[new_random_color_index]);
    }
    filter(CaShader)
    cellular_automata_step+=1
  }
  color_buffer.end();

  // Example of scaling an image to fit the canvas while maintaining aspect ratio
  image(color_buffer, 0-width/2, 0-height/2, width, height)

  if (showPallete){
    displayPalette(palette, palleteWidth, palleteHeight)
  }

  if (showFPS) {
    fps = calculateFPS(millis());
    displayFPS(fps);
  }
}

function initializeCanvas(input_image){
  workingImageHeight = artworkHeight/pixelSize
  workingImageWidth = artworkWidth/pixelSize

  let color_buffer_otions = {
    width: workingImageWidth,
    height: workingImageHeight,
    textureFiltering: NEAREST,
    antialias: false,
    desity: 1,
    format: UNSIGNED_BYTE,
    depth: false,
    channels: RGBA,
  }
  color_buffer = createFramebuffer(color_buffer_otions)

  let tex = canvas.getTexture(input_image);
  tex.setInterpolation(NEAREST, NEAREST);
  textureWrap(CLAMP)
  
  input_image = colorQuantize(input_image, number_of_colors)
  palette = extractCollorPaletteFromImage(input_image)
  palette_map = buildPaletteIndexDict(palette)

  color_buffer.begin();
  tex.setInterpolation(NEAREST, NEAREST);
  image(input_image, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  tex.setInterpolation(NEAREST, NEAREST);
  color_buffer.end()

  // Pixel Sort
  angle = noise(frameCount)*sortNoiseScale;
  noise_coordinates = angleToCoordinates(angle, noise_radius);
  color_buffer.begin();
  PSShader.setUniform('direction', [noise_coordinates.x, noise_coordinates.y])
  for (let i=0;i < PixelSortInitialSteps; i++) {
    for (let j = 0; j < pixelSortingPassesPerFrame; j++) {
      PSShader.setUniform('iFrame', i * pixelSortingPassesPerFrame + j)
      filter(PSShader)
    }
  }
  color_buffer.end()

  // Cellular automata
  CaShader.setUniform("normalRes", [1.0/workingImageWidth, 1.0/workingImageHeight]);
  CaShader.setUniform('new_random_color_index', new_random_color_index);
  CaShader.setUniform('palette', palette);
  CaShader.setUniform('next_random_color', palette[new_random_color_index]);

  for (let j=0;j < CellularAutomataInitialSteps; j++) {
    input_image = cellular_automata(input_image)
    // console.log(j)
  }
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);

}

function windowResized() {
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);
}

export function applyUIChanges(){
  updateArtworkSettings();

  frameRate(fps);
  // prepareP5Js(artwork_seed)

  // // Update canvas size
  // resizeCanvas(artworkWidth, artworkHeight);
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);
  
  // Reset pixel sorting and cellular automata steps
  pixel_sort_step = 0;
  cellular_automata_step = 0;
  
  // Redraw everything
  updateArtworkSeed()
  // initializeCanvas()
}

function updateArtworkSettings() {
  fps = parseInt(MainInputs['FPS'].value);
  artworkWidth = parseInt(MainInputs['artworkWidth'].value);
  artworkHeight = parseInt(MainInputs['artworkHeight'].value);
  pixelSize = parseInt(MainInputs['pixelSize'].value);

  sortNoiseScale = parseInt(PSInputs['PSnoiseScale'].value)
  noiseDirectionChangeRate = parseInt(PSInputs['PSnoiseDirectionChangeRate'].value)
  pixelSortMaxSteps = parseInt(PSInputs['PSMaxSteps'].value)
  PixelSortInitialSteps = parseInt(PSInputs['PSinitialSteps'].value)
  pixelSortingPassesPerFrame = parseInt(PSInputs['PSPassesPerFrame'].value)
  
  
  CARandomColorChangeRate = parseInt(CAInputs['CARandomColorChangeRate'].value)
  CAMaxSteps = parseInt(CAInputs['CAMaxSteps'].value)
  CellularAutomataInitialSteps = parseInt(CAInputs['CAInitialSteps'].value)
}

function updateArtworkSeed(){
  artwork_seed = parseInt(MainInputs['artworkSeed'].value);
  artwork_seed = prepareP5Js(artwork_seed)

  // Set Current Seed text to current seed
  MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

  if (!loaded_user_image){
    var image_path = imgFiles[floor(random(1000000000)%imgFiles.length)]
    console.log('Loading new image: ',image_path)
    loadImage(image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
  }
  else{ // To restart the process if we already had a user image loaded but parameters change
    initializeCanvas(img)
  }
}

export function setSeed(){
  // Set input seed to current seed
  MainInputs['artworkSeed'].value = artwork_seed;
  // Set Current Seed text to current seed
  MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

  artwork_seed = prepareP5Js(artwork_seed)
  var image_path = imgFiles[floor(random(1000000000)%imgFiles.length)]
  console.log('image_path',image_path)
  loadImage(image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
}

export function saveImage() {
  let color_buffer_otions = {
    width: artworkWidth,
    height: artworkHeight,
    textureFiltering: NEAREST,
    antialias: false,
    desity: 1,
    format: UNSIGNED_BYTE,
    depth: false,
    channels: RGBA,
  }
  let tmp_buffer = createFramebuffer(color_buffer_otions)

  tmp_buffer.begin();
  image(color_buffer, 0-artworkWidth/2, 0-artworkHeight/2, artworkWidth, artworkHeight);
  tmp_buffer.end()
  let filename =  `${artwork_seed}.png`
  // Save the image
  saveCanvas(tmp_buffer, filename, 'png');
}

export function load_user_image(user_image){
  loadImage(user_image,
    (loadedImage)=>{
      img = loadedImage;
      initializeCanvas(loadedImage)
    },
    () => { image_loaded_successfuly = false; loaded_user_image = true; }
  );
  loaded_user_image = true;
  image_loaded_successfuly = true;
}

function display_image_error_message(){
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  if (loaded_user_image){
    text("Failed to load image. \n Upload a new image with the 'Load Image' button", 0, 0);
  }
  else {
    text("Failed to load default image. \n Upload an image with the 'Load Image' button", 0, 0)
  }
}

window.preload = preload
window.setup = setup
window.draw = draw
window.windowResized = windowResized
