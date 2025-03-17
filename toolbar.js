import {create_number_input_text, create_number_input_slider_and_number, create_daisyui_expandable_card, create_button,create_input_image_button, turnDaisyUICardIntoBodyWithTitle, createSmallBreak, create_subtitle} from './lib/JSGenerativeArtTools/ui.js'
import {defaultArtworkSeed, defaultArtworkWidth, defaultArtworkHeight, defaultPixelSize, artwork_seed, applyUIChanges, saveImage, setSeed, flipSize, load_user_image, audioReactive, colorPalette, fps, pixelSort, cellularAutomata, recorder, mask} from './sketch.js'

function createArtworkSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('artworkSettings', 'Artwork Settings');
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    // Add Inputs
    // Size
    const sizeTitle = create_subtitle('Size');
    const width = create_number_input_slider_and_number('artworkWidth', 'Width', defaultArtworkWidth, 0, 4000);
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const changeOrientation = create_button('Flip Orientation', () => { flipSize(); }, '', 'xs')
    elements_dict['changeOrientation'] = changeOrientation.getElementsByTagName('input')[0];

    const height = create_number_input_slider_and_number('artworkHeight', 'Height', defaultArtworkHeight,0, 4000);
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const seed = create_number_input_text('artworkSeed', 'Random Seed', defaultArtworkSeed, '-1', '99999999');
    elements_dict['artworkSeed'] = seed.getElementsByTagName('input')[0];

    const seedButton = create_button('Set Seed', () => { setSeed(); },'Current Seed:', 'xs')
    elements_dict['currentSeed'] = seedButton.getElementsByTagName('text')[0];

    const pixelSize = create_number_input_slider_and_number('pixelSize', 'Pixel Size', defaultPixelSize,1, 100);
    elements_dict['pixelSize'] = pixelSize.getElementsByTagName('input')[0];

    const emptyTitle1 = create_subtitle();
    const emptyTitle2 = create_subtitle();
    // Buttons
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); });
    const saveFrameButton = create_button('Save Current Frame', () => { saveImage(); });
    const loadImage = create_input_image_button(load_user_image, 'Load Image', 'No file chosen', 'Loaded Image: ');

    // FPS, take only body
    var FPSInputs = fps.createFPSSettingsCard();
    var FPSInputsBody = turnDaisyUICardIntoBodyWithTitle(FPSInputs['main-toolbar'])
    elements_dict['fpsInputs'] = FPSInputs;

    // Color Pallete, take only body
    var PaletteInputs = colorPalette.createColorPaletteControlsCard();
    var PaletteInputsBody = turnDaisyUICardIntoBodyWithTitle(PaletteInputs['main-toolbar'])
    elements_dict['paletteInputs'] = PaletteInputs;

    cardBody.appendChild(pixelSize);

    cardBody.appendChild(sizeTitle);
    cardBody.appendChild(width);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(changeOrientation);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(height);

    cardBody.appendChild(emptyTitle1);
    cardBody.appendChild(seed);
    cardBody.appendChild(seedButton);
    cardBody.appendChild(FPSInputsBody);
    
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(PaletteInputsBody);
    
    cardBody.appendChild(emptyTitle2);
    cardBody.appendChild(applyChangesButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(saveFrameButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(loadImage);

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
    var AudioInput = audioReactive.createAudioReactiveControlsCard()
    toolbar.appendChild(AudioInput['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['AudioInputs'] = AudioInput;
    
    // Mask
    var MaskInputs = mask.createMaskSettings()
    toolbar.appendChild(MaskInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['MaskInputs'] = MaskInputs;

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

    // Recorder UI
    var recorderInputs = recorder.createSettingsCard();
    toolbar.appendChild(recorderInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['recorderInputs'] = recorderInputs;
    
    elements_dict['toolbar'] = toolbar;
    // toolbar.style.display = "none" // to hide toolbar

    return elements_dict;

  }

export {
    intialize_toolbar,
}