#ifdef GL_ES
precision mediump float;
#endif

#define THRESHOLD .0
#define RANDOM_SINLESS // Don't use Random Lygia funcion that uses sine
                       // variation is so high between close numbers that even with rounding the coordinates
                       // of the pixel and the neighbour the sampled noise may have a different value
#define SORTING_CHANCE .5

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform vec2 direction;
uniform int iFrame;

float hsvbrightness(vec3 c);

#include "lygia/generative/random.glsl"

void main() {
  vec2 uv = vTexCoord;

  // the frame number parity to make it flip every frame, -1 is odd 1 is even
	float fParity = mod(float(iFrame), 2.) * 2. - 1.;
  // we differentiate every 1/2 pixel on the horizontal axis, will be -1 or 1
  float verticalParity = mod(floor(uv.x / texelSize.x), 2.0) * 2. - 1.;
  float diagonalParity = mod(floor(uv.x / texelSize.x)+floor(uv.y / texelSize.y), 2.0) * 2. - 1.;

  float direction_multiplier = fParity * diagonalParity; // If sum of direction coordinates is odd then use diagonal parity
  if (mod(direction.x+direction.y, 2.)==0.){ // If sum of direction coordinates is even then use vertical parity
    direction_multiplier = fParity * verticalParity;
  }

	vec2 dir = direction * texelSize.xy;
  dir*= direction_multiplier;
  dir.y*= -1.; // direction has to be corrected
  vec2 uv_ = uv + dir;

  vec4 col = texture2D(tex0, uv);
  vec4 neighbour_color = texture2D(tex0, uv_);

  float gCurr = hsvbrightness(col.rgb);
  float gComp = hsvbrightness(neighbour_color.rgb);

  // Check if we should be sorting this pixel based on the random value of the "original" pixel
  float noise_val = 1.0;
  vec4 output_color = col;
  if (direction_multiplier >= 0.0){ // we are in the swapping pixel, we should check the noise value at the origin pixel
    noise_val = random(vec3(ceil(uv.x/texelSize.x), ceil(uv.y/texelSize.y),ceil(float(iFrame))));
  }
  else {
    noise_val = random(vec3(ceil(uv_.x/texelSize.x), ceil(uv_.y/texelSize.y),ceil(float(iFrame))));
  }
  if(noise_val<=1.-SORTING_CHANCE){
    gl_FragColor = col;
    return;
  }

  // we prevent the sort from happening on the borders
  if (uv_.x < 0.0 || uv_.x > 1.0 || uv_.y < 0.0 || uv_.y > 1.0) {
    gl_FragColor = col;
    return;
  }

  // We use the direction_multiplier to know if we are in the pixel that needs to be sorted or its neighbour
  if (direction_multiplier > 0.0) { // if we are in the pixel we should be sorting
    if (gComp > THRESHOLD && gCurr < gComp) {
      output_color = neighbour_color;
    }
  } else { // if we are in the neighbour pixel
    if (gCurr > THRESHOLD && gCurr > gComp) {
      output_color = neighbour_color;
    }
  }

  gl_FragColor = output_color;
}

// From https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
float hsvbrightness(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  return q.x;
}
