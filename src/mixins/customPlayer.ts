import { Player } from "magmastream";
import CustomQueue from "./customQueueAdd.js";

function CustomPlayerMixin(Base: typeof Player) {
    return class CustomPlayer extends Base {
        queue = new CustomQueue(); 
    };
}

export class CustomPlayer extends CustomPlayerMixin(Player) {
}
