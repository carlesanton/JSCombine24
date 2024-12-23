import {create_number_input_text, create_expandable_card, create_button, create_card, create_input_image_button} from './lib/JSGenerativeArtTools/ui.js'
import {defaultFPS, defaultArtworkSeed, defaultArtworkWidth, defaultArtworkHeight, defaultPixelSize, artwork_seed, applyUIChanges, saveImage, setSeed, load_user_image} from './sketch.js'
import {createPixelSortingSettings} from './lib/JSGenerativeArtTools/pixel_sort.js'
import {createCASettingsCard} from './lib/JSGenerativeArtTools/cellular_automata.js'

function createArtworkSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_expandable_card('artworkSettings', 'Artwork Settings');
    const cardBody = card.getElementsByClassName('card-body')[0]

    // Add Inputs
    const fps = create_number_input_text('FPS', 'FPS', defaultFPS, '0', '300');
    elements_dict['FPS'] = fps.getElementsByTagName('input')[0];

    const seed = create_number_input_text('artworkSeed', 'Artwork Seed', defaultArtworkSeed, '-1', '99999999');
    elements_dict['artworkSeed'] = seed.getElementsByTagName('input')[0];

    const seedButton = create_button('Set Seed', () => { setSeed(); },'Current Seed:')
    elements_dict['currentSeed'] = seedButton.getElementsByTagName('text')[0];

    const width = create_number_input_text('artworkWidth', 'Artwork Width', defaultArtworkWidth,'100', '4000');
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const height = create_number_input_text('artworkHeight', 'Artwork Height', defaultArtworkHeight,'100', '4000');
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const pixelSize = create_number_input_text('pixelSize', 'Pixel Size', defaultPixelSize,'1', '4000');
    elements_dict['pixelSize'] = pixelSize.getElementsByTagName('input')[0];

    cardBody.appendChild(fps);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(seed);
    cardBody.appendChild(seedButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(width);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(height);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(pixelSize);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function createArtworkControlsCard() {
    var elements_dict = {};
    // Create the main card
    const card = create_card('controllsCard')
    const cardBody = card.getElementsByClassName('card-body')[0]

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
    // // Initialize Defaults
    MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

    elements_dict['mainInputs'] = MainInputs;
  
    // Pixel Sorting UI
    var PSInputs = createPixelSortingSettings();
    toolbar.appendChild(PSInputs['main-toolbar']);
    elements_dict['psInputs'] = PSInputs;
    
    // Cellular Automata UI
    var CAInputs = createCASettingsCard();
    toolbar.appendChild(CAInputs['main-toolbar']);
    elements_dict['caInputs'] = CAInputs;
    
    // Main controll Buttons
    var MainButtons = createArtworkControlsCard();
    toolbar.appendChild(MainButtons['main-toolbar']);
    elements_dict['mainButtons'] = MainButtons;
  
    // toolbar.style.display = "none" // to hide toolbar

    return elements_dict;

  }

export {
    intialize_toolbar,
}