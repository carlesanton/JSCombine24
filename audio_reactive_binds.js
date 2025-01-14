import {change_ps_direction, disable_ps_direction_change_rate, set_ps_direction_change_rate_from_slider, set_ps_passes_per_frame_from_slider, disable_ps_passes_per_frame} from './lib/JSGenerativeArtTools/pixel_sort.js'
import {set_ca_passes_per_frame_from_slider, disable_ca_passes_per_frame} from './lib/JSGenerativeArtTools/cellular_automata.js'
import {level_scale, level_min_value, level_max_value, setOnBeatCallback, setOnLevelChangeCallback, setOnEnergyRatioChangeCallback} from './lib/JSGenerativeArtTools/audio/audio_reactive.js'

var ps_speed_min_value = 2;
var ps_speed_max_value = 23;

function bind_audio_reactive_controls(){
    console.log('Binding audio reactive controls')

    // Beat Detect
    console.log('Binding PS Direction to Beat Detection')
    setOnBeatCallback(function() {
        change_ps_direction();
    });
    set_ps_direction_change_rate_from_slider(0);
    disable_ps_direction_change_rate();
}


export {
    bind_audio_reactive_controls,
}
