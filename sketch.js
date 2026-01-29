import {ColorPalette} from './lib/JSGenerativeArtTools/colorPalette/colorPalette.js';
import {FPS} from './lib/JSGenerativeArtTools/fps/fps.js';
import {PixelSort} from './lib/JSGenerativeArtTools/pixelSorting/pixelSort.js';
import {CellularAutomata} from './lib/JSGenerativeArtTools/cellularAutomata/cellularAutomata.js'
import {scaleCanvasToFit, prepareP5Js} from './lib/JSGenerativeArtTools/utils.js';
import { intialize_toolbar, is_toolbar_hiden, hide_toolbar, show_toolbar } from './toolbar.js';
import {AudioReactive} from './lib/JSGenerativeArtTools/audio/audio_reactive.js'
import {bind_audio_reactive_controls} from './audio_reactive_binds.js'
import { Recorder } from './lib/JSGenerativeArtTools/record/record.js';
import { Mask } from './lib/JSGenerativeArtTools/mask/mask.js';
import { log_memory } from './lib/log_memory.js'

// Parameter file
const parameter_file_path = 'param_files/parameters.json'
let parameters_json;

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
export let artwork_seed; // -1 used for random seeds, if set to a positive integer the number is used

// To check if user loaded an image or default one is loaded
let loaded_user_image = false;
let image_loaded_successfuly = false;
let reloadPagePeriodicaly = false;
let reloadPageInterval = 100; // seconds

const pixel_density = 1;
let canvas;

let img;
let myFont;
let color_buffer;
let interface_color_buffer;
const videoFormats = ['mp4', 'webm', 'mkv', 'flv', 'avi', 'mov', 'm4p']

// Chroma Fade Vars
let nextImg;
let chroma_buffer; // To store the image with chroma applied without losing the color_buffer
let fadeSpeed = 0.03;
let fadeToNewImage = false;
let chromaColor = [0.,1.,0.,1.];

const defaultImgFiles = [
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
let img_files;
let current_image_path;


// Automaticaly Reload Images
let auto_reload_images = false;
let last_reload_time;
let seconds_between_reloads = 300;
let remaining_images_to_reload;


const preview_frame = 30;
export let audioReactive;
export let colorPalette;
export let fps;
export let pixelSort;
export let cellularAutomata;
export let recorder;
export let mask;
let maskImage;
let inputs;

function preload() {
  artwork_seed = prepareP5Js(defaultArtworkSeed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  
  // Load default images as first image before we can access the ones form params file
  loadJSON(
    parameter_file_path, loaded_json => {
      console.log('Successfuly loaded params file', parameter_file_path)
      parameters_json = loaded_json
      if (Object.prototype.hasOwnProperty.call(parameters_json, "images")) {
        img_files = Object.keys(parameters_json['images'])
        console.log('Loadnig images from json:', img_files)
      }
      else {
        console.log('Using default images, faield to load images from json')
        img_files = defaultImgFiles
      }
      if (img_files.length == 0) { img_files = defaultImgFiles}
      current_image_path = img_files[floor(random(1000000000)%img_files.length)]
      img = loadImage(
        current_image_path,
        () => { image_loaded_successfuly = true; },
        () => { image_loaded_successfuly = false; }
      )
      console.log('Loaded image: ', current_image_path)
    },
  );

  pixelSort = new PixelSort();
  cellularAutomata = new CellularAutomata();
  mask = new Mask();
}

function setup() {
  remaining_images_to_reload = structuredClone(img_files)

  audioReactive = new AudioReactive()
  colorPalette = new ColorPalette()
  recorder = new Recorder()
  fps = new FPS()
  inputs = intialize_toolbar();
  MainInputs = inputs.mainInputs;

  recorder.setSketchFPSMethod(() => {return fps.getFPS()})

  updateArtworkSettings()

  // Create Canvas
  canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);

  // Move Canvas to canvas-wrapper div
  canvas.parent("canvas-wrapper")

  // Set pixelDensity
  canvas.pixelDensity(pixel_density);

  pixelSort.initializeShader()
  cellularAutomata.initializeShader()
  mask.initializeShader()

  cellularAutomata.setChromaColor(chromaColor);

  // Bind Audio Reactive Methods
  userStartAudio([], audioReactive.initializeAudio());
  bind_audio_reactive_controls();

  // Apply the loaded font
  textFont(myFont);

  // Load main parameters from config json
  set_main_parameters()

  if (image_loaded_successfuly){
    initializeCanvas(img)
  }
  last_reload_time = millis(); // Initialize when we actualy start
  
  // Auto reload page for Calandria
  if (reloadPagePeriodicaly) {
    setTimeout(() => {
      location.reload();
    }, reloadPageInterval * 1000)
  }
}

function draw() {
  if (audioReactive.isAudioEnabled()){
    run_audio_analysis();
  }

  if (image_loaded_successfuly){
    draw_steps()
  }
  else {
    display_image_error_message()
  }

  drawInterface()
  if (auto_reload_images) {periodicaly_reload_image(seconds_between_reloads)}
}

function draw_steps(){
  // Recreate Mask if needed
  maskImage = mask.createMask(mask.getPreviousUsedImage());
  if (!mask.getEnable()) { // If masking is not enabled return black mask
    maskImage = null;
  }
  pixelSort.setMask(maskImage);
  cellularAutomata.setMask(maskImage);

  // Pixel sorting
  color_buffer = pixelSort.pixelSortingGPU(color_buffer, true)


  // Cellular Automata
  if (frameCount%cellularAutomata.getRandomColorChangeRate()==1){
    var new_ca_random_color = colorPalette.getRandomColor()
    cellularAutomata.setNewRandomColor(new_ca_random_color)
  }
  color_buffer = cellularAutomata.cellularAutomataGPU(color_buffer)

  // Apply Chroma if active
  chroma_buffer = color_buffer;
  if (fadeToNewImage && nextImg !== null && nextImg !== undefined){
    chroma_buffer = mask.applyMask(color_buffer, nextImg, chromaColor)
  }

  // Example of scaling an image to fit the canvas while maintaining aspect ratio
  image(chroma_buffer, 0-width/2, 0-height/2, width, height)
}

function drawInterface(){
  interface_color_buffer.begin()
  clear()
  
  if (mask.isDisplayEnabled()){
    mask.displayMask();
  }
  
  if (colorPalette.isDisplayEnabled()){
    colorPalette.display(-artworkWidth/2, -artworkHeight/2)
  }

  if (fps.isDisplayEnabled()) {
    fps.calculateFPS(millis());
    fps.displayFPS(artworkWidth/2, -artworkHeight/2);
  }

  if (audioReactive.isDisplayVisualizationEnabled()){
    audioReactive.displayVisualization();
  }

  interface_color_buffer.end()
  image(interface_color_buffer, 0-width/2, 0-height/2, width, height)
}

function initializeCanvas(input_image){
  set_main_parameters()
  set_image_parameters()

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
  // Remove buffers if existing
  if(color_buffer !== undefined) {
    color_buffer.remove(); // Delete from GPU memory.
    color_buffer = undefined; // Delete from CPU memory.
  }
  if(chroma_buffer !== undefined) {
    chroma_buffer.remove(); // Delete from GPU memory.
    chroma_buffer = undefined; // Delete from CPU memory.
  }
  if(interface_color_buffer !== undefined) {
    interface_color_buffer.remove(); // Delete from GPU memory.
    interface_color_buffer = undefined; // Delete from CPU memory.
  }
  color_buffer = createFramebuffer(color_buffer_otions)
  chroma_buffer = createFramebuffer(color_buffer_otions)
  interface_color_buffer = createFramebuffer({width: artworkWidth, height: artworkHeight})

  let tex = canvas.getTexture(input_image);
  tex.setInterpolation(NEAREST, NEAREST);
  textureWrap(CLAMP)
  
  input_image = colorPalette.colorQuantize(input_image)
  colorPalette.extractFromImage(input_image)

  // Create mask
  maskImage = mask.createMask(input_image);

  color_buffer.begin();
  tex.setInterpolation(NEAREST, NEAREST);
  image(input_image, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  tex.setInterpolation(NEAREST, NEAREST);
  color_buffer.end()

  if (!mask.getEnable()) { // If masking is not enabled return black mask
    maskImage = null;
  }
  pixelSort.setMask(maskImage);
  cellularAutomata.setMask(maskImage);

  // Pixel Sort
  var old_max_steps = pixelSort.setMaxSteps(pixelSort.getInitialSteps())
  pixelSort.changeDirection();
  pixelSort.resetSteps()
  for (let i=0; i<pixelSort.getInitialSteps(); i++){
    color_buffer = pixelSort.pixelSortingGPU(color_buffer, false)
  }
  pixelSort.setMaxSteps(old_max_steps)
  
  // Cellular automata
  var new_ca_random_color =  colorPalette.getRandomColor()
  cellularAutomata.setNewRandomColor(new_ca_random_color);

  var old_max_steps = cellularAutomata.setMaxSteps(cellularAutomata.getInitialSteps());
  cellularAutomata.resetSteps();
  for (let j=0;j < cellularAutomata.getInitialSteps(); j++) {
    color_buffer = cellularAutomata.cellularAutomataGPU(color_buffer);
  }
  cellularAutomata.setMaxSteps(old_max_steps);

  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);

  recorder.setFilenameSufix('seed-'+ artwork_seed);

  // Remove textures and image
  tex.dispose?.();      // if available
  tex.delete?.();       // some renderers
}

function run_audio_analysis(){
  let audioLevel = audioReactive.getAudioLevel()
  audioReactive.getSpectrum()
  audioReactive.getHMEnergy()
  audioReactive.getEnergyRatio()
  audioReactive.detectBeat(audioLevel)
}

function windowResized() {
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);
}

export function applyUIChanges(){
  updateArtworkSettings();

  // prepareP5Js(artwork_seed)

  // // Update canvas size
  // resizeCanvas(artworkWidth, artworkHeight);
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);
  audioReactive.setVisualizationSize(artworkHeight, artworkWidth)
  
  // Reset pixel sorting and cellular automata steps
  
  // Redraw everything
  updateArtworkSeed()
  colorPalette.setHeight(artworkHeight)
}

function updateArtworkSettings() {
  artworkWidth = parseInt(MainInputs['artworkWidth'].value);
  artworkHeight = parseInt(MainInputs['artworkHeight'].value);
  pixelSize = parseInt(MainInputs['pixelSize'].value);

  pixelSort.updateAllParameters();
  cellularAutomata.updateAllParameters()
}

function updateArtworkSeed(){
  artwork_seed = parseInt(MainInputs['artworkSeed'].value);
  artwork_seed = prepareP5Js(artwork_seed)

  // Set Current Seed text to current seed
  MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

  if (!loaded_user_image){
    current_image_path = img_files[floor(random(1000000000)%img_files.length)]
    console.log('Loading new image: ',current_image_path)
    loadImage(current_image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
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
  current_image_path = img_files[floor(random(1000000000)%img_files.length)]
  loadImage(current_image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
}

export function flipSize(){
  // Set input seed to current seed
  const oldArtworkWidth = MainInputs['artworkWidth'].value;
  const oldArtworkHeight = MainInputs['artworkHeight'].value;

  artworkWidth = oldArtworkHeight;
  artworkHeight = oldArtworkWidth;

  MainInputs['artworkWidth'].value = artworkWidth;
  MainInputs['artworkHeight'].value = artworkHeight;

  // Update slider aswell by sending input event
  var event = new Event('input');
  MainInputs['artworkWidth'].dispatchEvent(event);
  MainInputs['artworkHeight'].dispatchEvent(event);

  updateArtworkSettings();
  audioReactive.setVisualizationSize(artworkHeight, artworkWidth)

  // Restart Artowk with current seed
  const oldSeed = MainInputs['artworkSeed'].value
  setSeed()

  // Set input seed to current seed
  MainInputs['artworkSeed'].value = oldSeed;
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

export function load_user_file(user_file, user_file_name){
  current_image_path = user_file_name
  const fileExtension = getFileExtension(user_file);
  if (videoFormats.includes(fileExtension)) {
    console.log('Cannot use video')
  }
  else {
    loadImage(user_file,
      (loadedImage)=>{
        img = loadedImage;
        initializeCanvas(loadedImage)
      },
      () => { image_loaded_successfuly = false; loaded_user_image = true; }
    );
  }
  loaded_user_image = true;
  image_loaded_successfuly = true;
}

function getFileExtension(base64String) {
  // Extract the MIME type
  const match = /^data:(.*?);base64,/.exec(base64String);
  if (!match || match.length < 2) {
      throw new Error("Invalid base64 string format");
  }

  const mimeType = match[1]; // e.g., "video/mp4" or "image/jpeg"  
  // Get the extension from the MIME type
  const extension = mimeType.split('/')[1];

  return extension;
}

export function setFadeToNewImage(newFadeToNewImage) {
  fadeToNewImage = newFadeToNewImage;
  if (nextImg !== null && nextImg !== undefined){ // Only start if a new image is ready
    cellularAutomata.setFadeToNewImage(fadeToNewImage)
  }
}

export function setFadeSpeed(newFadeSpeed) {
  fadeSpeed = newFadeSpeed;
  cellularAutomata.setFadeSpeed(fadeSpeed)
}

export function loadNewImage(new_image, new_image_path) {
  current_image_path = new_image_path
  loadImage(
    new_image,
    (loadedImage)=>{
      nextImg = loadedImage;
      cellularAutomata.setFadeToNewImage(fadeToNewImage); // Set fadeToNewImage in case we didn't do it when 
                                                          // it was activated if there was no image loaded
    }
  );
}

export function applyTransition() {
  console.log('Applying Transition')

  // Copy chroma buffer to color_buffer to actuate with it
  color_buffer.begin();
  image(chroma_buffer, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  color_buffer.end();

  // Color quantixe and extract palette of new image
  nextImg = colorPalette.colorQuantize(nextImg)
  colorPalette.extractFromImage(nextImg)
  // Create new mask, it will be passed to PS and CA in new loop
  // mostly we create it here to update the last used image by the mask
  maskImage = mask.createMask(nextImg);

  nextImg = null; // Remove previous image
  cellularAutomata.setFadeToNewImage(false); // Stop fading from CA
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

function set_main_parameters() {
  // Guard against missing or invalid data
  if (
    !parameters_json ||
    typeof parameters_json !== 'object' ||
    !current_image_path
  ) {
    return;
  }

  // Check if the current image key exists in the JSON
  if (Object.prototype.hasOwnProperty.call(parameters_json, "main_parameters")) {
    const main_parameters_dict = parameters_json["main_parameters"];

    // Ensure the value is a plain object before passing it on
    if (main_parameters_dict && typeof main_parameters_dict === 'object') {
      set_parameters_from_dict(main_parameters_dict);
    }
  }
}

function set_image_parameters() {
  // Guard against missing or invalid data
  if (
    !parameters_json ||
    typeof parameters_json !== 'object' ||
    !current_image_path
  ) {
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(parameters_json, 'images')){
    return;
  }

  // Check if the current image key exists in the JSON
  if (Object.prototype.hasOwnProperty.call(parameters_json['images'], current_image_path)) {
    const image_parameters_dict = parameters_json['images'][current_image_path];

    // Ensure the value is a plain object before passing it on
    if (image_parameters_dict && typeof image_parameters_dict === 'object') {
      set_parameters_from_dict(image_parameters_dict);
    }
  }
}

function set_parameters_from_dict(image_parameters_dict) {
  console.log('Setting image parameters from dict', image_parameters_dict)
  // Get all values if available
  var auto_reload = get_value_if_exists(image_parameters_dict, 'autoReload') // For changing images
  var reaload_time = get_value_if_exists(image_parameters_dict, 'secondsBetweenReloads')
  var reload_page_periodicaly = get_value_if_exists(image_parameters_dict, 'reloadPagePeriodicaly') // For reloading full page
  var reload_page_interval = get_value_if_exists(image_parameters_dict, 'reloadPageInterval') // For reloading full page
  var pixel_size = get_value_if_exists(image_parameters_dict, 'pixelSize')
  var width = get_value_if_exists(image_parameters_dict, 'width')
  var height = get_value_if_exists(image_parameters_dict, 'height')
  var hideToolbar = get_value_if_exists(image_parameters_dict, 'hideToolbar')
  var mask_enable = get_value_if_exists(image_parameters_dict, 'maskEnable')
  var mask_min = get_value_if_exists(image_parameters_dict, 'maskMin')
  var mask_max = get_value_if_exists(image_parameters_dict, 'maskMax')
  var mask_display = get_value_if_exists(image_parameters_dict, 'maskDisplay')
  var mask_opacity = get_value_if_exists(image_parameters_dict, 'maskOpacity')
  var audio_reactive_enable = get_value_if_exists(image_parameters_dict, 'audioReactiveEnable')
  var audio_reactive_audio_scale = get_value_if_exists(image_parameters_dict, 'audioReactiveAudioScale')
  var audio_reactive_beat_detection = get_value_if_exists(image_parameters_dict, 'audioReactiveBeatDetection')
  var audio_reactive_decay_rate = get_value_if_exists(image_parameters_dict, 'audioReactiveDecayRate')
  var audio_reactive_ps_strenght = get_value_if_exists(image_parameters_dict, 'audioReactivePsStrenght')
  var audio_reactive_ca_strenght = get_value_if_exists(image_parameters_dict, 'audioReactiveCaStrenght')
  var audio_reactive_show_viz = get_value_if_exists(image_parameters_dict, 'audioReactiveShowViz')
  var ps_enable = get_value_if_exists(image_parameters_dict, 'psEnable')
  var ps_direction_change_rate = get_value_if_exists(image_parameters_dict, 'psDirectionChangeRate')
  var ps_initial_steps = get_value_if_exists(image_parameters_dict, 'psInitialSteps')
  var ca_color_change_rate = get_value_if_exists(image_parameters_dict, 'caColorChangeRate')
  var ca_enable = get_value_if_exists(image_parameters_dict, 'caEnable')
  var ca_initial_steps = get_value_if_exists(image_parameters_dict, 'caInitialSteps')
  
  // Set values
  // Main
  if (auto_reload !== undefined) {auto_reload_images = auto_reload}
  if (reaload_time !== undefined) {seconds_between_reloads = reaload_time}
  if (reload_page_periodicaly !== undefined) {reloadPagePeriodicaly = reload_page_periodicaly}
  if (reload_page_interval !== undefined) {reloadPageInterval = reload_page_interval}
  if (pixel_size !== undefined) {pixelSize = pixel_size}
  if (width !== undefined) {artworkWidth = width}
  if (height !== undefined) {artworkHeight = height}
  // Mask
  if (mask_enable !== undefined) {mask.setEnable(mask_enable)}
  if (mask_min !== undefined) {mask.setMinBirghtness(mask_min)}
  if (mask_max !== undefined) {mask.setMaxBirghtness(mask_max)}
  if (mask_display !== undefined) {mask.setDisplay(mask_display)}
  if (mask_opacity !== undefined) {mask.setOpacity(mask_opacity)}
  // AudioReactive
  if (audio_reactive_enable !== undefined) {
    audioReactive.setEnableAudio(audio_reactive_enable);
    // Not using takeOverControlls because it will make the direction change rate still have effect
  }
  if (audio_reactive_audio_scale !== undefined) {audioReactive.setLevelScale(audio_reactive_audio_scale)}
  if (audio_reactive_beat_detection !== undefined) {audioReactive.setBeatDetectLevel(audio_reactive_beat_detection)}
  if (audio_reactive_decay_rate !== undefined) {audioReactive.setBeatDecayRate(audio_reactive_decay_rate)}
  if (audio_reactive_ps_strenght !== undefined) {audioReactive.setAudioLevelStrength(audio_reactive_ps_strenght)}
  if (audio_reactive_ca_strenght !== undefined) {audioReactive.setLHEnergyRatioStrength(audio_reactive_ca_strenght)}
  if (audio_reactive_show_viz !== undefined) {audioReactive.setDisplayVisualization(audio_reactive_show_viz)}
  // Pixel Sorting
  if (ps_enable !== undefined) {pixelSort.setEnable(ps_enable)}
  if (ps_direction_change_rate !== undefined) {pixelSort.setDirectionChangeRate(ps_direction_change_rate)}
  if (ps_initial_steps !== undefined) {pixelSort.setInitialSteps(ps_initial_steps)}
  // Cellular automata
  if (ca_enable !== undefined) {cellularAutomata.setEnable(ca_enable)}
  if (ca_color_change_rate !== undefined) {cellularAutomata.setRandomColorChangeRate(ca_color_change_rate)}
  if (ca_initial_steps !== undefined) {cellularAutomata.setInitialSteps(ca_initial_steps)}
  // Toolbar
  if (hideToolbar!== undefined) {
    if (hideToolbar) {
      hide_toolbar(inputs['toolbar']);
    } else {
      show_toolbar(inputs['toolbar']);
    }
  }
}

function get_value_if_exists(dict, key) {
  if (!dict || typeof dict !== 'object') {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return dict[key];
  }

  return undefined;
}


function periodicaly_reload_image(time_between_reloads) {
  var current_time = millis();
  if (current_time - last_reload_time >= time_between_reloads*1000) {
    last_reload_time = current_time;
    if (!loaded_user_image){
      const new_image_index = floor(random(1000000000)%remaining_images_to_reload.length)
      const new_image_path = remaining_images_to_reload[new_image_index];
      current_image_path = new_image_path

      // Remove selected image (the fast way)
      remaining_images_to_reload[new_image_index] = remaining_images_to_reload[remaining_images_to_reload.length - 1];
      remaining_images_to_reload.pop();

      console.log('Reloading image after ',time_between_reloads, 'seconds')
      console.log('Remaining images:', remaining_images_to_reload.length)
      console.log('Loading new image: ',current_image_path)
      if (remaining_images_to_reload.length === 0) {
        remaining_images_to_reload = structuredClone(img_files)
      }
      loadImage(current_image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
      log_memory()
    }
  }
}


window.preload = preload
window.setup = setup
window.draw = draw
window.windowResized = windowResized
