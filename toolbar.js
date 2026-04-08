import {
    create_number_input_text,
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    create_button,
    create_input_file_button,
    createSmallBreak,
    create_subtitle,
    createToggleButton,
} from './lib/JSGenerativeArtTools/ui.js'
import {
    defaultArtworkSeed,
    defaultArtworkWidth,
    defaultArtworkHeight,
    defaultPixelSize,
    artwork_seed,
    applyUIChanges,
    saveImage,
    setSeed,
    flipSize,
    load_user_file,
    audioReactive,
    colorPalette,
    fps,
    pixelSort,
    cellularAutomata,
    recorder,
    mask,
    setFadeToNewImage,
    setFadeSpeed,
    loadNewImage,
    applyTransition,
} from './sketch.js'

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
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); }, '', 'sm');
    const loadImage = create_input_file_button(load_user_file, 'Load Image', 'No file chosen', 'Loaded Image: ');

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

    
    cardBody.appendChild(emptyTitle2);
    cardBody.appendChild(applyChangesButton);
    cardBody.appendChild(loadImage);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function createFadeToNewImageCard() {
    const elements_dict = {};
    
    const card = create_daisyui_expandable_card('newImageSettings', 'New Image');
    const cardBody = card.getElementsByClassName('collapse-content')[0];

    // New Image input
    const newImageButton = create_input_file_button(loadNewImage, 'New Image', 'No file chosen', 'Loaded Image: ');

    // Fade To new Image
    const activateFade = createToggleButton('Fade to new Image', (a) => {
        setFadeToNewImage(a.target.checked);
    }, cellularAutomata.fadeToNewImage);
    elements_dict['activateFade'] = activateFade.getElementsByTagName('button')[0];
    
    // Stop Transition
    const applyTransitionButton = create_button(
        'Apply Transition',
        applyTransition,
        '',
        'sm'
    );
    elements_dict['applyTransition'] = activateFade.getElementsByTagName('button')[0];

    // Fade Speed
    const fadeSpeed = create_number_input_slider_and_number(
        'FadeSpeed',
        'Fade Speed',
        cellularAutomata.fadeSpeed,
        0.,
        1.,
        (value) => setFadeSpeed(value),
        0.01
    );
    elements_dict['fadeSpeed'] = fadeSpeed.getElementsByTagName('input')[0];

    cardBody.appendChild(newImageButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(activateFade);
    cardBody.appendChild(fadeSpeed);
    cardBody.appendChild(applyTransitionButton);

    elements_dict['main-toolbar'] = card;
    return elements_dict;
}

function intialize_toolbar(){
    var elements_dict = {}
    toolbar = document.getElementById('toolbar');

    // Hide Toolbar Info
    var hideToolbarInfo = create_subtitle('Hide/Show Toolbar with [F]')
    hideToolbarInfo.getElementsByTagName('h2')[0].className = 'text-sm';
    console.log('hideToolbarInfo', hideToolbarInfo)
    toolbar.appendChild(hideToolbarInfo);

    // Main Settings UI
    var MainInputs = createArtworkSettingsCard();
    MainInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(MainInputs['main-toolbar']);
    // // Initialize Defaults
    MainInputs['currentSeed'].textContent = `Current Seed: ${artwork_seed}`

    elements_dict['mainInputs'] = MainInputs;
  
    // Audio Reactive
    var AudioInput = audioReactive.createAudioReactiveControlsCard()
    AudioInput['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(AudioInput['main-toolbar']);
    elements_dict['AudioInputs'] = AudioInput;
    
    // Mask
    var MaskInputs = mask.createMaskSettings()
    MaskInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(MaskInputs['main-toolbar']);
    elements_dict['MaskInputs'] = MaskInputs;

    // Pixel Sorting UI
    var PSInputs = pixelSort.createPixelSortingSettings();
    PSInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(PSInputs['main-toolbar']);
    elements_dict['psInputs'] = PSInputs;
    
    // Cellular Automata UI
    var CAInputs = cellularAutomata.createSettingsCard();
    CAInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(CAInputs['main-toolbar']);
    elements_dict['caInputs'] = CAInputs;

    // New Image UI
    var NewImageInput = createFadeToNewImageCard();
    NewImageInput['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(NewImageInput['main-toolbar']);
    elements_dict['newImageInputs'] = NewImageInput;

    // Recorder UI
    var recorderInputs = recorder.createSettingsCard();
    recorderInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(recorderInputs['main-toolbar']);
    elements_dict['recorderInputs'] = recorderInputs;

    // Color Pallete, take only body
    var PaletteInputs = colorPalette.createColorPaletteControlsCard();
    PaletteInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(PaletteInputs['main-toolbar']);
    elements_dict['paletteInputs'] = PaletteInputs;


    // FPS
    var FPSInputs = fps.createFPSSettingsCard();
    FPSInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(FPSInputs['main-toolbar']);
    elements_dict['fpsInputs'] = FPSInputs;
    
    elements_dict['toolbar'] = toolbar;
    // toolbar.style.display = "none" // to hide toolbar

    document.addEventListener('keydown', (event) => {
        // Ignore if the user is typing in an input/textarea
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (event.key === 'f' || event.key === 'F') {
            if (is_toolbar_hiden(toolbar)) {
                show_toolbar(toolbar);
            } else {
                hide_toolbar(toolbar);
            }
        }
    });

    return elements_dict;

}

function show_toolbar(toolbar) {
    toolbar.style.display = '';
}

function hide_toolbar(toolbar) {
    toolbar.style.display = 'none';
}

function is_toolbar_hiden(toolbar) {
    return toolbar.style.display === 'none'
}

export {
    intialize_toolbar,
    is_toolbar_hiden,
    show_toolbar,
    hide_toolbar
}