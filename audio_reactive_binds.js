import {change_ps_direction, disable_ps_direction_change_rate, set_ps_direction_change_rate_from_slider, set_ps_passes_per_frame_from_slider, disable_ps_passes_per_frame, defaultNoiseDirectionChangeRate} from './lib/JSGenerativeArtTools/pixel_sort.js'
import {set_ca_passes_per_frame_from_slider, disable_ca_passes_per_frame} from './lib/JSGenerativeArtTools/cellular_automata.js'
import {audioReactive} from './sketch.js'

var ps_speed_min_value = 2;
var ps_speed_max_value = 23;
var level_max_value_ = 0.1;

function bind_audio_reactive_controls(){
    console.log('Binding audio reactive controls')

    // Beat Detect
    console.log('Binding PS Direction to Beat Detection')
    audioReactive.setOnBeatCallback(function() {
        change_ps_direction();
    });
    audioReactive.addControllToTakeOver(
        () => {
            if (audioReactive.isAudioEnabled()){
                set_ps_direction_change_rate_from_slider(0);
            }
            else {
                set_ps_direction_change_rate_from_slider(defaultNoiseDirectionChangeRate);
            }
            disable_ps_direction_change_rate()
        }
    );

    // Audio Level
    console.log('Binding PS Speed to audio level')
    audioReactive.setOnLevelChangeCallback(function(e) {
        let remapedLevel = audioReactive.mapLevel(e, audioReactive.levelScale)
        remapedLevel = map(remapedLevel, 0, level_max_value_, ps_speed_min_value, ps_speed_max_value)
        remapedLevel = constrain(remapedLevel, ps_speed_min_value, ps_speed_max_value)
        set_ps_passes_per_frame_from_slider(remapedLevel);
    });
    audioReactive.addControllToTakeOver(disable_ps_passes_per_frame);

    // Centroid
    // console.log('Binding PS Speed to audio level')
    // setOnCentroidChange(function(c) {
    //     var remapedCentroid = map(c, 20, 4000, 30, 2)
    //     remapedCentroid = constrain(remapedCentroid, 2, 30)
    //     set_ca_color_change_rate_from_slider(remapedCentroid);
    // });
    // disable_ca_color_change_rate();

    // Energy Ratio
    console.log('Binding CA Speed to MidHigh/Low energy ratio')
    audioReactive.setOnEnergyRatioChangeCallback(function(energyRatio) {
        var remapedRatio = map(energyRatio, 0, 0.3, 0, 5)
        remapedRatio = parseInt(constrain(remapedRatio, 0, 5))
        if (energyRatio<=0.1){ // To generate some CA movement without any audio
            remapedRatio = 1
        }
        set_ca_passes_per_frame_from_slider(remapedRatio);
    });
    audioReactive.addControllToTakeOver(disable_ca_passes_per_frame);

    if(audioReactive.isAudioEnabled()){
        audioReactive.takeOverControlls()
    }
    // HM Energy
    // // Discarted at the moment, using only the energy level of one band
    // // ends up being almost the same as using the level of the whole audio.
    // // better use the ratio between two bands.
    // setOnHMEnergyChangeCallback(function(energy) {
    //     // var remapedEnergy = map(e, 0, 25, 30, 2)
    //     // console.log('remapedEnergy, e', remapedEnergy + ', ' + e)
    //     // remapedEnergy = constrain(remapedEnergy, 2, 30)
    //     var new_ppf = 1;
    //     if (energy > 0.0001 && energy <= 1){
    //         new_ppf = 0
    //     }
    //     else if (energy > 1 && energy <= 10){
    //         new_ppf = 1
    //     }
    //     else if(energy > 10 && energy <= 15){
    //         new_ppf = 2
    //     }
    //     else if(energy > 15 && energy <= 20){
    //         new_ppf = 3
    //     }
    //     else if(energy > 20 && energy <= 30){
    //         new_ppf = 4
    //     }
    //     else if(energy > 40){
    //         new_ppf = 5
    //     }
    //     set_ca_passes_per_frame_from_slider(new_ppf);
    // });
    // disable_ca_passes_per_frame();

}


export {
    bind_audio_reactive_controls,
}
