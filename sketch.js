// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
const artworkWidth = 1000;
const artworkHeight = 1000;
const workingImageWidth = 250;
const workingImageHeight = 250;
const artwork_seed = -1; // -1 used for random seeds, if set to a positive integer the number is used

// FPS parametters
const desired_frame_rate = 60;
const showFPS = false;

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
let myFont;

let ca_src = `
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
// uniform vec2 canvasSize;
uniform vec2 texelSize;
uniform vec2 normalRes;
uniform vec4 next_random_color;
int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color);
float count_neighbours_with_same_color_(vec4 neighbour_colors[8], vec4 pixel_color);
vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid);
bool colorsAreEqual(vec4 v1, vec4 v2);
bool colorsAreEqualEpsilon(vec4 v1, vec4 v2);

void main() {
  vec2 uv = vTexCoord;

  vec4 neighbourColors[8];
  vec2 directions[8];  
  directions[0] = vec2(-1.0, -1.0);
  directions[1] = vec2(-1.0, 0.0);
  directions[2] = vec2(-1.0, 1.0);
  directions[3] = vec2(0.0, -1.0);
  directions[4] = vec2(0.0, 1.0);
  directions[5] = vec2(1.0, -1.0);
  directions[6] = vec2(1.0, 0.0);
  directions[7] = vec2(1.0, 1.0);

  vec4 col = texture2D(tex0, uv);

  for(int i = 0; i < 8; i++) {
    vec2 uv_ = uv + directions[i] * texelSize;

    vec4 neighbour_color = col;
    if (uv_.x >= 0.0 && uv_.x <= 1.0 && uv_.y >= 0.0 && uv_.y <= 1.0){
      neighbour_color = texture2D(tex0, uv_);
    }

    neighbourColors[i] = neighbour_color;
  }

  int neighboursWithSameColor = count_neighbours_with_same_color(neighbourColors, col);
  float neighboursWithSameColor_ = count_neighbours_with_same_color_(neighbourColors, col);
  vec4 nextMajorityColor = findMostRepeatedColor(neighbourColors, col);
  int neighboursWithNextColor = count_neighbours_with_same_color(neighbourColors, nextMajorityColor);

  vec4 new_color = vec4(1.0,1.0,0.0,1.0);
  if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
    new_color = col;
  }
  else if (neighboursWithSameColor < 2  || neighboursWithNextColor == 3){
    new_color = nextMajorityColor ;
  }
  else if (neighboursWithNextColor < 3 && neighboursWithSameColor == 5){
    new_color = next_random_color/255.0;
  } 
  else {
    new_color = col;
  }

  gl_FragColor = new_color;
}


int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color){
  int neighbours_with_same_color = 0;
  for (int i=0; i<8; i++){
    vec4 tmp_color = neighbour_colors[i];
    if(colorsAreEqual(tmp_color, pixel_color)){
      neighbours_with_same_color+=1; 
    }
  }

  return neighbours_with_same_color;
}

float count_neighbours_with_same_color_(vec4 neighbour_colors[8], vec4 pixel_color){
  float neighbours_with_same_color = 0.0;
  float epsilon = 0.01; // Adjust based on precision needs
  for (int i=0; i<8; i++){
    vec4 tmp_color = neighbour_colors[i];
    if(abs(tmp_color.r - pixel_color.r) < epsilon && abs(tmp_color.g - pixel_color.g) < epsilon && abs(tmp_color.b - pixel_color.b) < epsilon) {
        neighbours_with_same_color += 1.;
    }  
  }
  neighbours_with_same_color = neighbours_with_same_color/8.;
  return neighbours_with_same_color;
}

vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid) {
    int maxCount = 0;
    vec4 mostRepeatedVector = vec4(0.);

    for (int i = 0; i < 8; i++) {
        if (colorsAreEqual(colors[i], color_to_avoid)){
          continue;
        }
        int currentCount = 0;
        for (int j = 0; j < 8; j++) {
          if (colorsAreEqual(colors[i], colors[j])) {
              currentCount++;
          }
          if (currentCount > 4) { // Stop once we've found a vector with more than 4 occurrences
            mostRepeatedVector = colors[i];
            return mostRepeatedVector;
          }
        }
        if (currentCount > maxCount) {
            maxCount = currentCount;
            mostRepeatedVector = colors[i];
        }
    }
    if (colorsAreEqual(mostRepeatedVector, vec4(0.))) {
      mostRepeatedVector = color_to_avoid;
    }

    return mostRepeatedVector;
}

bool colorsAreEqual(vec4 v1, vec4 v2) {
  return all(equal(v1, v2));
  return colorsAreEqualEpsilon(v1, v2);
  return v1.r==v2.r && v1.g==v2.g && v1.b==v2.b;
}

bool colorsAreEqualEpsilon(vec4 v1, vec4 v2) {
  float epsilon = 0.01; // Adjust based on precision needs
  bool areEqual = false;
  if(abs(v1.r - v2.r) < epsilon &&
    abs(v1.g - v2.g) < epsilon &&
    abs(v1.b - v2.b) < epsilon) {
      areEqual = true;
  }
  return areEqual;
}

`

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
  prepareP5Js(artwork_seed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  img = loadImage(imgFiles[floor(random(1000000000)%imgFiles.length)])
}

function setup() {
  createCanvas(artworkWidth, artworkHeight);
  img.resize(workingImageWidth, workingImageHeight);
  // colorMode(HSB, 360, 100, 100, 1);
  // noLoop();
  frameRate(desired_frame_rate);
  pixelDensity(4);
  noSmooth();
  
  scaleCanvasToFit(artworkWidth, artworkHeight);

  img = colorQuantize(img, number_of_colors, get_pallete=true)
  palette = extractCollorPaletteFromImage(img)
  palette_map = buildPaletteIndexDict(palette)

  // Apply the loaded font
  textFont(myFont);

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
