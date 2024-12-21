import {create_number_input_text, create_expandable_card, create_button, create_card} from './lib/JSGenerativeArtTools/ui.js'

function createArtworkSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_expandable_card('artworkSettings', 'Artwork Settings');
    const cardBody = card.getElementsByClassName('card-body')[0]

    // Add Inputs
    const fps = create_number_input_text('FPS', 'FPS');
    elements_dict['FPS'] = fps.getElementsByTagName('input')[0];

    const seed = create_number_input_text('artworkSeed', 'Artwork Seed', '-1', '99999999');
    elements_dict['artworkSeed'] = seed.getElementsByTagName('input')[0];

    const seedButton = create_button('Set Seed', 'setSeed()','Current Seed:')
    elements_dict['currentSeed'] = seedButton.getElementsByTagName('text')[0];

    const width = create_number_input_text('artworkWidth', 'Artwork Width', '100', '4000');
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const height = create_number_input_text('artworkHeight', 'Artwork Height', '100', '4000');
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const pixelSize = create_number_input_text('pixelSize', 'Pixel Size', '1', '4000');
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
    const applyChangesButton = create_button('Apply Changes', 'updateArtworkSettings()');
    const saveFrameButton = create_button('Save Current Frame', 'saveImage()');

    cardBody.appendChild(applyChangesButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(saveFrameButton);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}
export {
    createArtworkSettingsCard,
    createArtworkControlsCard,
}