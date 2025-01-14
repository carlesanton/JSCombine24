import {extractCollorPaletteFromImage, buildPaletteIndexDict, displayPalette, colorQuantize} from './lib/JSGenerativeArtTools/collor_palette.js';
import {load_pixel_shader_code, initialize_pixel_sorting_shader, change_ps_direction, pixel_sorting_gpu, update_all_ps_parametters, set_ps_max_steps, reset_ps_steps, get_PixelSortInitialSteps} from './lib/JSGenerativeArtTools/pixel_sort.js';
import {load_cellular_automata_code, set_ca_max_steps, reset_ca_steps, get_CellularAutomataInitialSteps, initialize_cellular_automata_shader, cellular_automata_gpu, update_all_ca_parametters, set_ca_new_random_color, get_CARandomColorChangeRate} from './lib/JSGenerativeArtTools/cellular_automata.js';
import {scaleCanvasToFit, prepareP5Js} from './lib/JSGenerativeArtTools/utils.js';
import {calculateFPS, displayFPS} from './lib/JSGenerativeArtTools/fps.js';
import {intialize_toolbar} from './toolbar.js';
import {initializeAudio, getEnergyRatio, getHMEnergy, getSpectrum, getAudioLevel, detectBeat} from './lib/JSGenerativeArtTools/audio/audio_reactive.js'
import {bind_audio_reactive_controls} from './audio_reactive_binds.js'

// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
// Inputs
// Main
let MainInputs

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

let img;
let palette;
let myFont;
let color_buffer;

const imgFiles = [
  'img/1225657.jpg',
  'img/1360200.jpg',
  'img/1653604.jpg',
  'img/1765471.jpg',
  'img/1829806.jpg',
  'img/234155.jpg',
  'img/244273.jpg',
  'img/247580.jpg',
  'img/250669.jpg',
  'img/2518195.jpg',
  'img/257703.jpg',
  'img/261968.jpg',
  'img/2669108.jpg',
  'img/298002.jpg',
  'img/314808.jpg',
  'img/329943.jpg',
  'img/3307280.jpg',
  'img/332736.jpg',
  'img/3489753.jpg',
  'img/3526787.jpg'
]

const preview_frame = 30;

function preload() {
  artwork_seed = prepareP5Js(defaultArtworkSeed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  var image_path = imgFiles[floor(random(1000000000)%imgFiles.length)]
  console.log('Loaded image: ', image_path)
  img = loadImage(
    image_path,
    () => { image_loaded_successfuly = true; },
    () => { image_loaded_successfuly = false; }
)
  load_pixel_shader_code();
  load_cellular_automata_code();
}

function setup() {
  var toolbar_elements = intialize_toolbar();
  MainInputs = toolbar_elements.mainInputs;

  updateArtworkSettings()

  // Create Canvas
  canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);

  // Move Canvas to canvas-wrapper div
  canvas.parent("canvas-wrapper")

  // Set FrameRate and pixelDensity
  frameRate(fps);
  canvas.pixelDensity(pixel_density);

  initialize_cellular_automata_shader()
  initialize_pixel_sorting_shader()

  // Bind Audio Reactive Methods
  initializeAudio();
  bind_audio_reactive_controls();

  // Apply the loaded font
  textFont(myFont);

  if (image_loaded_successfuly){
    initializeCanvas(img)
  }
}

function draw() {
  run_audio_analysis();

  if (image_loaded_successfuly){
    draw_steps()
  }
  else {
    display_image_error_message()
  }
}

function draw_steps(){
  // Pixel sorting
  color_buffer = pixel_sorting_gpu(color_buffer, true)


  // Cellular Automata
  if (frameCount%get_CARandomColorChangeRate()==1){
    var new_random_color_index = Math.round(random(0,palette.length-1))
    var new_ca_random_color =  palette[new_random_color_index];
    set_ca_new_random_color(new_ca_random_color)
  }
  color_buffer = cellular_automata_gpu(color_buffer)

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

  color_buffer.begin();
  tex.setInterpolation(NEAREST, NEAREST);
  image(input_image, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  tex.setInterpolation(NEAREST, NEAREST);
  color_buffer.end()

  var old_max_steps = set_ps_max_steps(get_PixelSortInitialSteps())
  change_ps_direction()
  reset_ps_steps()
  for (let i=0; i<get_PixelSortInitialSteps(); i++){
    color_buffer = pixel_sorting_gpu(color_buffer, false)
  }
  set_ps_max_steps(old_max_steps)
  
  // Cellular automata
  var new_random_color_index = Math.round(random(0,palette.length-1))
  var new_ca_random_color =  palette[new_random_color_index];
  set_ca_new_random_color(new_ca_random_color)

  var old_max_steps = set_ca_max_steps(get_CellularAutomataInitialSteps())
  reset_ca_steps()
  for (let j=0;j < get_CellularAutomataInitialSteps(); j++) {
    color_buffer = cellular_automata_gpu(color_buffer)
  }
  set_ca_max_steps(old_max_steps)

  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);

}

function run_audio_analysis(){
  var audioLevel = getAudioLevel()
  getSpectrum()
  getHMEnergy()
  getEnergyRatio()
  detectBeat(audioLevel)
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
  
  // Redraw everything
  updateArtworkSeed()
  initializeCanvas()
}

function updateArtworkSettings() {
  fps = parseInt(MainInputs['FPS'].value);
  artworkWidth = parseInt(MainInputs['artworkWidth'].value);
  artworkHeight = parseInt(MainInputs['artworkHeight'].value);
  pixelSize = parseInt(MainInputs['pixelSize'].value);

  update_all_ps_parametters()
  update_all_ca_parametters()
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

export function change_fps(new_fps){
  var old_fps = fps;
  fps = parseInt(new_fps);
  console.log('Changing FPS to: ', fps)
  frameRate(fps);
  return old_fps
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
