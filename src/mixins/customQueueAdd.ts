import { Queue, Track } from 'magmastream';
import CustomTrackUtils from './customTrackUtilsValidate.js';

function CustomQueueMixin(Base: typeof Queue) {
    return class CustomQueue extends Base {
        add(track: Track | Track[], offset?: number): void {

            if (!CustomTrackUtils.validate(track)) {
                throw new RangeError('Track must be a "Track" or "Track[]".');
            }

            if (!this.current) {
                if (Array.isArray(track)) {
                    this.current = track.shift() || null;
                    this.push(...track);
                } else {
                    this.current = track;
                }
            } else {
                if (typeof offset !== "undefined" && typeof offset === "number") {
                    if (isNaN(offset)) {
                        throw new RangeError("Offset must be a number.");
                    }
                    if (offset < 0 || offset > this.length) {
                        throw new RangeError(`Offset must be between 0 and ${this.length}.`);
                    }
                    if (Array.isArray(track)) {
                        this.splice(offset, 0, ...track);
                    } else {
                        this.splice(offset, 0, track);
                    }
                } else {
                    if (Array.isArray(track)) {
                        this.push(...track);
                    } else {
                        this.push(track);
                    }
                }
            }
        }
    };
}

const CustomQueue = CustomQueueMixin(Queue);

export default CustomQueue;