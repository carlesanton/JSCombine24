import {create_number_input_text, create_number_input_slider_and_number, create_daisyui_expandable_card, create_button,create_input_image_button, turnDaisyUICardIntoBodyWithTitle} from './lib/JSGenerativeArtTools/ui.js'
import {defaultArtworkSeed, defaultArtworkWidth, defaultArtworkHeight, defaultPixelSize, artwork_seed, applyUIChanges, saveImage, setSeed, load_user_image, audioReactive, colorPalette, fps, pixelSort, cellularAutomata} from './sketch.js'

function createArtworkSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('artworkSettings', 'Artwork Settings');
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    // Add Inputs
    const width = create_number_input_slider_and_number('artworkWidth', 'Artwork Width', defaultArtworkWidth, 0, 4000);
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const height = create_number_input_slider_and_number('artworkHeight', 'Artwork Height', defaultArtworkHeight,0, 4000);
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const seed = create_number_input_text('artworkSeed', 'Artwork Seed', defaultArtworkSeed, '-1', '99999999');
    elements_dict['artworkSeed'] = seed.getElementsByTagName('input')[0];

    const seedButton = create_button('Set Seed', () => { setSeed(); },'Current Seed:', 'xs')
    elements_dict['currentSeed'] = seedButton.getElementsByTagName('text')[0];

    const pixelSize = create_number_input_slider_and_number('pixelSize', 'Pixel Size', defaultPixelSize,1, 4000);
    elements_dict['pixelSize'] = pixelSize.getElementsByTagName('input')[0];

    // FPS, take only body
    var FPSInputs = fps.createFPSSettingsCard();
    var FPSInputsBody = turnDaisyUICardIntoBodyWithTitle(FPSInputs['main-toolbar'])
    elements_dict['fpsInputs'] = FPSInputs;

    cardBody.appendChild(width);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(height);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(seed);
    cardBody.appendChild(seedButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(pixelSize);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(FPSInputsBody);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function createArtworkControlsCard() {
    var elements_dict = {};
    // Create the main card
    var card = create_daisyui_expandable_card('mainButtons', 'Main Actions')
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    // Add Buttons
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); });
    const saveFrameButton = create_button('Save Current Frame', () => { saveImage(); });
    const loadImage = create_input_image_button(load_user_image, 'Load Image', 'No file chosen', 'Loaded Image: ');

    cardBody.appendChild(applyChangesButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(saveFrameButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(loadImage);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function intialize_toolbar(){
    var elements_dict = {}
    toolbar = document.getElementById('toolbar');

    // Main Settings UI
    var MainInputs = createArtworkSettingsCard();
    toolbar.appendChild(MainInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    // // Initialize Defaults
    MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

    elements_dict['mainInputs'] = MainInputs;
  
    // Audio Reactive
    console.log('audioReactive', audioReactive)
    // var AudioInput = audioReactive.createAudioReactiveControlsCard()
    var AudioInput = audioReactive.createAudioReactiveControlsCard()
    toolbar.appendChild(AudioInput['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['AudioInputs'] = AudioInput;

    // Pixel Sorting UI
    var PSInputs = pixelSort.createPixelSortingSettings();
    toolbar.appendChild(PSInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['psInputs'] = PSInputs;
    
    // Cellular Automata UI
    var CAInputs = cellularAutomata.createSettingsCard();
    toolbar.appendChild(CAInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['caInputs'] = CAInputs;
    
    // Color Palette
    var PaletteInputs = colorPalette.createColorPaletteControlsCard();
    toolbar.appendChild(PaletteInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['paletteInputs'] = PaletteInputs;

    // Main controll Buttons
    var MainButtons = createArtworkControlsCard();
    toolbar.appendChild(MainButtons['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['mainButtons'] = MainButtons;
  
    // toolbar.style.display = "none" // to hide toolbar

    return elements_dict;

  }

export {
    intialize_toolbar,
}