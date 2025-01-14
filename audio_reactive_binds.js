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

    // Audio Level
    console.log('Binding PS Speed to audio level')
    setOnLevelChangeCallback(function(e) {
        var scaled_level = level_scale * e;
        var remapedForLog = map(scaled_level, level_min_value, level_max_value, 1, 2.8)
        remapedForLog = constrain(remapedForLog, 1, 2.8)

        var remapedLevel = map(log(remapedForLog), 0, 1, ps_speed_min_value, ps_speed_max_value)
        remapedLevel = pow(remapedLevel, 1.3)
        remapedLevel = constrain(remapedLevel, ps_speed_min_value, ps_speed_max_value)
        set_ps_passes_per_frame_from_slider(remapedLevel);
    });
    disable_ps_passes_per_frame();

}


export {
    bind_audio_reactive_controls,
}
