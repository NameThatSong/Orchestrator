import AbstractNode from "../core/cortex/abstract-node";
import { UserInput } from "../core/cortex/input-types";
import sendList from "../integrations/zenvia/list-content";
import WhatsappList from "../types/whatsapp-list";

export default class Hello extends AbstractNode {
    public getID(): number {
        return 1;
    }

    public async run(input: UserInput): Promise<void> {

        /*
        Checks if user sent audio or text
        If it's audio, go to node 20
        If it's text, go to node 30
        */

        if (input.isAudio()) {

            // Recognize music

            this.runNode(20, input);
        } else {

            // Text
            this.runNode(30, input);
            /*this.sendList("oi", "abra",
                "Resultados", "seção",
                { title: "Botão 1", description: "Descrição 1" },
                { title: "Botão 2", description: "Descrição 2" });*/
        }
    }

}
