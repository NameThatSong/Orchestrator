import AbstractNode from "../core/cortex/abstract-node";
import { UserInput } from "../core/cortex/input-types";

export default class LetraNode extends AbstractNode {
    public getID(): number {
        return 2;
    }

    public async run(input: UserInput): Promise<void> {
        if (input.getMessage().includes("letra")) {
            this.sendTextMessage(
                `É a música que você queria?\n1- ${/* musica */}\n${/* artista */ }`,
            );
        } else {
            this.sendTextMessage("Não entendi :/");
        }
    }
}
