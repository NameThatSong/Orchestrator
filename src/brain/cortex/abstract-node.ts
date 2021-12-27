import createFile from "../../factories/file-content-factory";
import createText from "../../factories/text-content-factory";
import NodeEngine from "../node-engine";
import { CallbackBundle } from "./callback-bundle";
import { UserInput } from "./input-types";

export default abstract class AbstractNode {

    private callbackBundle: CallbackBundle;

    public constructor() {
        NodeEngine.addNodeToRegistry(this.getID(), this);
    }

    public abstract getID(): number;

    /**
     * This function will execute the actual code inside the Node
     * @param input - Input provided by user
     */
    public abstract run(input: UserInput): Promise<void> | void;

    /**
     * This function will tell context manager which flow it should go to next
     * @param {number} id - ID to which the flow will jump next
     */
    public async goToNode(id: number): Promise<void> {
        this.callbackBundle.changeNodeCallback(id);
    }

    /**
     * Sends the user a message of text type
     * @param text - Message to be sent to the user
     */
    public async sendTextMessage(text: string): Promise<void> {
        return this.callbackBundle.messageCallback(createText(text));
    }

    /**
     * Sends the user a message of audio type
     * @param audioUrl - Audio's URL to be sent
     * @param type - Type of audio (e.g. audio/mpeg)
     */
    public async sendAudioMessage(audioUrl: string, type?: string): Promise<void> {
        return this.callbackBundle.messageCallback(createFile(audioUrl, type ? type : "audio/mpeg"));
    }

    /**
     * Sets a Global Variable under the current user ID
     * @param key - Key of global variable
     * @param value - Value of global variable
     */
    public async setGlobal(key: string, value: Object): Promise<void> {
        return await this.callbackBundle.setGlobalCallback();
    }

    /**
    * Retrieves a variable's value according to its key
    * @param key - Key of global variable
    */
    public async getGlobal(key: string): Promise<Object> {
        return await this.callbackBundle.getGlobalCallback();
    }

    /**
     * Saves event for the purpose of information/data gathering
     * @param eventName - Name of the event
     * @param eventDetails - Details of the event
     */
    public async emitEvent(eventName: string, eventDetails: Object): Promise<void> {
        return this.callbackBundle.emitEventCallback();
    }

    /**
     * Injects dependency into Node
     * @param bundle - Callback bundle that the current Node will use
     */
    public setCallbackBundle(bundle: CallbackBundle): void {
        this.callbackBundle = bundle;
    }

}