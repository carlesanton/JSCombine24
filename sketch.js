// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
const artworkWidth = 1000;
const artworkHeight = 1000;
const workingImageWidth = 250;
const workingImageHeight = 250;
// const artwork_seed = -1; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 3617656; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 2443839; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 9648387; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 7211379; // -1 used for random seeds, if set to a positive integer the number is used
const artwork_seed = 2479674; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 8449710; // -1 used for random seeds, if set to a positive integer the number is used
// const artwork_seed = 5667521; // -1 used for random seeds, if set to a positive integer the number is used
const pixel_density = 1;

// FPS parametters
const desired_frame_rate = 15;
const showFPS = false;

// Pallete display variables
const palleteWidth = 40
const palleteHeight = 1000;
const showPallete = false;
const number_of_colors = 20;


// Pixel sort variables
let pixel_sort_step = 0
let sort_noise_scale = 360
let noise_direction_change_rate = 45;
const noise_radius = 1.5;
let angle = -180;
let noise_coordinates;
const pixel_sort_max_steps = -1;
const initial_pixel_sort_max_steps = 50; //50
const pixel_sorting_passes = 8;
const pixel_sort_iters_per_steps = 150000;
let PSShader; // variable for the shader

// Cellular automata variables
let cellular_automata_step = 0
let random_color_change_rate = 3;
let new_random_color_index=0;
const cellular_automata_max_steps = -1;
const initial_cellular_automata_max_steps = 0;
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

const images_keys_path = ['multimedia', [0], 'jpg', '1000']
const json_filter = {'keys': ['category', 'categoryId'], 'value': 'artwork'}
let test_image_url = ''
var img_from_url;
// test_image_url = 'https://freedomtoteach.collins.co.uk/wp-content/uploads/sites/87/2023/03/shutterstock_397626016-1-scaled.jpg'
// test_image_url = 'https://freedomtoteach.collins.co.uk/wp-content/uploads/sites/87/2023/03/shutterstock_397626016-1-scaled.jpg?not-from-cache-please'
// test_image_url = 'https://assets.editor.p5js.org/5d7f7f6d9e2c56001eb58735/29fa94dc-40c1-4ee7-a2c0-f386bc748b07.png'
// test_image_url = 'https://d3uvo7vkyyb63c.cloudfront.net/1/jpg/1000/323825.jpg'
// test_image_url = 'https://d3uvo7vkyyb63c.cloudfront.net/1/jpg/1000/273852.jpg'
test_image_url = "https://d3uvo7vkyyb63c.cloudfront.net/1/jpg/1000/1653604.jpg"
// test_image_url = "https://cors-anywhere.herokuapp.com/https://d3uvo7vkyyb63c.cloudfront.net/1/jpg/1000/1653604.jpg"
// test_image_url = "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189"
// test_image_url = "https://spoonacular.com/recipeImages/604524-556x370.jpg"
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
  'img/3526787.jpg',
  'img/test/test.png'
]

const preview_frame = 30;

function preload() {
  prepareP5Js(artwork_seed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  img = loadImage(imgFiles[floor(random(1000000000) % imgFiles.length)])
  ca_src = loadStrings('./cellular_automata_shader.frag');
  ps_src = loadStrings('./pixel_sort_shader.frag');
  combine_24_json = loadJSON('./Combine24objects.json');
}

function setup() {
  // Parse Combine24 JS
  combine_24_images = parseAndFilterDictArray(combine_24_json['items'], images_keys_path, json_filter);
  // Download and load random image from the list
  img_from_url = createImg(test_image_url);
  // var img_from_url_ = download_image('https://cors-anywhere.herokuapp.com/'+test_image_url);
  img_from_url.hide()
  // var img_from_url = loadImage(test_image_url);
  // var img_from_url = startDownload();
  // var img_from_url = createImg(test_image_url);
  let tmp_canvas = document.getElementById('downloadedImage');
  console.log('tmp_canvas', tmp_canvas)

  let canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);
  frameRate(desired_frame_rate);
  canvas.pixelDensity(pixel_density);
  noSmooth();
  
  let tex = canvas.getTexture(img);
  tex.setInterpolation(NEAREST, NEAREST);
  textureWrap(CLAMP)
  
  scaleCanvasToFit(artworkWidth, artworkHeight);

  img = colorQuantize(img, number_of_colors, get_pallete=true)
  palette = extractCollorPaletteFromImage(img)
  palette_map = buildPaletteIndexDict(palette)

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

  CaShader = createFilterShader(ca_src.join('\n'));
  ps_src = resolveLygia(ps_src.join('\n'));
  PSShader = createFilterShader(ps_src);

  // Apply the loaded font
  textFont(myFont);

  color_buffer.begin();
  tex.setInterpolation(NEAREST, NEAREST);
  image(img, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  tex.setInterpolation(NEAREST, NEAREST);
  color_buffer.end()

  // Pixel Sort
  angle = noise(frameCount)*sort_noise_scale;
  noise_coordinates = angleToCoordinates(angle, noise_radius);
  color_buffer.begin();
  PSShader.setUniform('direction', [noise_coordinates.x, noise_coordinates.y])
  for (let i=0;i < initial_pixel_sort_max_steps; i++) {
    for (let j = 0; j < pixel_sorting_passes; j++) {
      PSShader.setUniform('iFrame', i * pixel_sorting_passes + j)
      filter(PSShader)
    }
  }
  color_buffer.end()

  // Cellular automata
  CaShader.setUniform("normalRes", [1.0/workingImageWidth, 1.0/workingImageHeight]);
  CaShader.setUniform('new_random_color_index', new_random_color_index);
  CaShader.setUniform('palette', palette);
  CaShader.setUniform('next_random_color', palette[new_random_color_index]);

  for (let j=0;j < initial_cellular_automata_max_steps; j++) {
    img = cellular_automata(img)
    // console.log(j)
  }

}

function draw() {
  // Pixel sorting
  color_buffer.begin();
  if (pixel_sort_step < pixel_sort_max_steps || pixel_sort_max_steps == -1) {
    if (frameCount%noise_direction_change_rate==1){
      angle = noise(frameCount/noise_direction_change_rate)*sort_noise_scale;
      noise_coordinates = angleToCoordinates(angle, noise_radius);
      PSShader.setUniform('direction', [noise_coordinates.x, noise_coordinates.y])
    }
    for (let i = 0; i < pixel_sorting_passes; i++) {
      PSShader.setUniform('iFrame', (initial_pixel_sort_max_steps + pixel_sort_step) * pixel_sorting_passes + i)
      filter(PSShader)
    }
    pixel_sort_step+=1
  }
  color_buffer.end()

  // Cellular Automata
  color_buffer.begin();
  if (cellular_automata_step < cellular_automata_max_steps || cellular_automata_max_steps ==-1) {
    if (frameCount%random_color_change_rate==1){
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

function windowResized() {
  scaleCanvasToFit(artworkWidth, artworkHeight);
}
