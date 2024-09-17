# To Run Localy

- Go To index.html
- Commands > Live Preview (choose internal or external browser)
  - **Needed Live Preview VSCode extension**

## SubModules

This project uses a submodule for the `JSGenerativeArtTools` custom libs.

### Initialize:

To intialise it run:
```
git submodule init
```

Alternatively you can automaticaly get the submodule code when cloning the repository with:
```
git clone --recurse-submodules
```

### Updating:

If someone updated a submodule, the other team-members should update the code of their submodules. This is not automatically done by git pull, because with git pull it only retrieves the information that the submodule is pointing to another commit, but doesn't update the submodule's code. To update the code of your submodules, you should run:
```
git submodule update
```


**[Reference](https://gist.github.com/gitaarik/8735255)**

## Images

Images are not uploaded to the github repository, they should be in the project folder and added to the `imgFiles` list. The ones used for the project are:

```
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
```

# Pixel Sorting

Sorting in fragment shader is done by implementing the _Odd-even transposition_ algorithm as described in [this link](https://ciphrd.com/2020/04/08/pixel-sorting-on-shader-using-well-crafted-sorting-filters-glsl/)

In order to don't make the algorithm to _stiff_ looking the odd-even parity used was vertical (one column is considered even in one pass and odd in the next one) for all diagonal directions  and diagonal (each diagonal is considered even in one pass and odd in the next one) for all the vertical and horizontal directions. Implemented in `lin31-33`.

To better imitate the behaviour of the CPU algorithm removed in [PR4](https://github.com/carlesanton/JSCombine24/pull/4) and give a more natural look to the process Lygia `random` function is used to determine if a pixel and its pair need to be sorted or not, determined by the `SORTING_CHANCE` variable.

In the selection of the random value the function must be sampled at the position of the _original_ pixel if we are in the swaping one, in order to do this with more accuracy and avoid any precision or rounding issues the coordinates of the pixel are divided by the texel (pixel) size to get a number between 0-Image Size and then rounded up to the closest integer.
Despite the efforts to sample the random function of the correct value the variable `RANDOM_SINLESS` was set in order to use a `random` function that does not use a sine function to create the random number. In experiments it was tested that it gave worse results in the sorting process since I was unable to make to consistently sample the right value at the right pixel, resulting in a wrong sort with long stripes of repeated colors due to the fact that the probability of sorting/not sorting was not the same for both pixels of the odd-even pair.

The sorting of the pixels is based on the HSV value to replicate the p5js `brightness` method.

Threshold to not sort pixels based on a brightness threshold with variable `THRESHOLD`.


# Arguments:

## Artwork Dimensions Variables
- `artworkWidth`: The desired width of the final artwork in pixels. This variable determines the size of the canvas where the generative art will be displayed.
- `artworkHeight`: The desired height of the final artwork in pixels. Similar to `artworkWidth`, this variable sets the canvas height.

## FPS
- `desired_frame_rate`: desired frame rate.
- `showFPS`: flag to choose if FPS are computed and displayed on screen.

## Image Processing Variables
- `workingImageWidth`: The width of the image used for processing before being displayed on the canvas. It's smaller than `artworkWidth` to allow for more detailed manipulation.
- `workingImageHeight`: The height of the image used for processing. Like `workingImageWidth`, it's designed for detailed manipulation before resizing to fit the `artworkWidth` and `artworkHeight`.

## Randomness Seed Variable
- `artwork_seed`: A seed value used for generating random numbers. Setting it to `-1` uses a random seed, while a positive integer specifies a fixed seed for reproducible results.

## Palette Display Variables
- `showPallete`: A boolean flag indicating whether the color palette should be displayed. Set to `true` to show the palette, `false` otherwise.
- `number_of_colors`: The number of colors to be included in the color palette extracted from the image.
- `palleteWidth`: The width of the color palette display area in pixels.
- `palleteHeight`: The height of the color palette display area in pixels.

## Pixel Sorting Variables
- `initial_pixel_sort_max_steps`: Number of pixel sorting steps done in the setup before the image is initaly displayed. Serves to modify the image before the piece starts.
- `pixel_sort_max_steps`: The maximum number of steps allowed for the pixel sorting process. Setting it to `-1` means unlimited steps.
- `sort_noise_scale`: The scale factor for the noise used in pixel sorting. Higher values result in more pronounced noise effects.
- `noise_direction_change_rate`: The rate at which the direction of the noise changes during pixel sorting. Lower values lead to slower changes.
- `noise_radius`: The radius of influence for the noise applied during pixel sorting.
- `pixel_sort_iters_per_steps`: The number of iterations performed per step (frame) in the pixel sorting process.

## Cellular Automata Variables
- `initial_cellular_automata_max_steps`: Number of cellular automata steps done in the setup before the image is initaly displayed. Serves to modify the image before the piece starts.
- `cellular_automata_max_steps`: The maximum number of steps allowed for the cellular automata simulation. Setting it to `-1` means unlimited steps.
- `random_color_change_rate`: The frequency at which random colors are introduced in the cellular automata simulation. Lower values introduce more variation.

# Libs used
From **[JSGenerativeArtTools repo](https://github.com/carlesanton/JSGenerativeArtTools)**
- `pixel_sort.js`
- `collor_palette.js`
- `utils.js`

[P5Js Library](https://p5js.org/es/download/)
- `p5.min.js`

[Lygia](https://lygia.xyz/) is a shader library providing functions as noise in shaders. Using `generative/random.glsl` methods with the `RANDOM_SINLESS` flag.

[RgbQuant.js](https://github.com/leeoniya/RgbQuant.js/tree/master)

# Experiments

At the moment the best result seems to be with no pixel sorting while the drawing phase and only celular automata.

## Celular automata rules

### Working, good version

This version generates patterns inside each color

if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
    new_color = current_color;
}
else if ((neighboursWithSameColor < 2  || neighboursWithNextColor == 3)) {
    new_color = nextMajorityColor
} else {
    new_color = current_color;
}

### Approach 2, no patterns

if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
    new_color = current_color;
}
else if ((neighboursWithSameColor < 3  || neighboursWithNextColor == 3 || neighboursWithNextColor == 5)) {
    new_color = nextMajorityColor
} else {
    new_color = current_color;
}

### Approach 3, small patterns at borders

if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
    new_color = current_color;
}
else if ((neighboursWithSameColor < 3  || neighboursWithNextColor >= 3 || neighboursWithNextColor > 4)) {
    new_color = nextMajorityColor
} else {
    new_color = current_color;
}

# Links
(Combine24 Page)[https://combine24.alusta.art/]
(Combine24 Webinar)[https://www.youtube.com/watch?v=FnihRwX32cQ&ab_channel=Kansallisgalleria%E2%8E%B8FinnishNationalGallery]
(Collection Link)[https://www.kansallisgalleria.fi/en/search?copyrightFree=true]
