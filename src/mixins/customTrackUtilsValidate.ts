import { TrackUtils as BaseTrackUtils } from 'magmastream';
import logMessage from '../utils/logMessage.js';

const TRACK_SYMBOL = Symbol("track");
const UNRESOLVED_TRACK_SYMBOL = Symbol("unresolved");

// Create a mixin function for modifying the validate static method
function CustomTrackUtilsMixin(Base: typeof BaseTrackUtils) {
    return class CustomTrackUtils extends Base {
        static validate(trackOrTracks: any): boolean {

            if (typeof trackOrTracks === "undefined")
                throw new RangeError("Provided argument must be present.");

            if (Array.isArray(trackOrTracks) && trackOrTracks.length) {
                for (const track of trackOrTracks) {
                    if (!(track[TRACK_SYMBOL] || track[UNRESOLVED_TRACK_SYMBOL]))
                        logMessage(`Track is an array and is not valid -> "TRACK_SYMBOL" or "UNRESOLVED_TRACK_SYMBOL" property on track object --> ignoring it.`, true, 'warn');
                }
                return true;
            }

            if (!(trackOrTracks[TRACK_SYMBOL] || trackOrTracks[UNRESOLVED_TRACK_SYMBOL])) {
                logMessage(`Track is not an array and is not valid -> probably missing "TRACK_SYMBOL" or "UNRESOLVED_TRACK_SYMBOL" property on track object --> ignoring it.`, true, 'warn');
            }
            return true;
        }
    };
}

// Apply the mixin to the original TrackUtils class
const CustomTrackUtils = CustomTrackUtilsMixin(BaseTrackUtils);

export default CustomTrackUtils;
