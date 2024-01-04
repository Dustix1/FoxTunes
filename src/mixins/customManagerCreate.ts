import { Manager, PlayerOptions, Player } from "magmastream";
import { CustomPlayer } from "./customPlayer.js";

function CustomManagerMixin(Base: typeof Manager) {
    return class CustomManager extends Base {
        create(options: PlayerOptions): Player {
            if (this.players.has(options.guild)) {
                return this.players.get(options.guild)!;
            }
            return new CustomPlayer(options);
        }
    };
}

const CustomManager = CustomManagerMixin(Manager);
export default CustomManager;
