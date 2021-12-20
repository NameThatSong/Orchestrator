import {
  FileContent,
  IChannel,
  TextContent,
  WebhookController,
} from "@zenvia/sdk";
import { AbstractContent } from "@zenvia/sdk/dist/lib/contents/abstract-content";
import createFile from "../factories/file-content-factory";
import createText from "../factories/text-content-factory";
import { WebMessageEvent } from "../types/message-event";
import recognizeMusic from "./audio-controller";
import transcript from "./gcp-controller";
import search from "./genius-controller";

async function createWebHook(channel: IChannel, channelType: any) {
  try {
    return new WebhookController({
      channel: channelType,

      messageEventHandler: async (messageEvent: WebMessageEvent) => {
        let content: AbstractContent[] = [];
        // channel
        //   .sendMessage(
        //     messageEvent.message.to,
        //     messageEvent.message.from,
        //     createText("Só um segundo...")
        //   );
        if (
          messageEvent?.message?.contents[0]?.type === "file" &&
          messageEvent?.message?.contents[0]?.fileMimeType?.includes("audio")
        ) {
          const audioUrl = messageEvent.message.contents[0].fileUrl;
          const music = await recognizeMusic(
            audioUrl
          );

          if (music) {
            let text = "";
            if (music.title) {
              text = `${text}*Título* ⇒ ${music.title}\n`;
            }
            if (music.artist) {
              text = `${text}*Artista* ⇒ ${music.artist}\n\n`;
            }
            if (music.album) {
              text = `${text}*Álbum* ⇒ ${music.album}\n`;
            }
            if (music.song_link) {
              text = `${text}*Clique para ouvir* ⇒ ${music.song_link}`
            }
            content = [createText(text)];
            // if (music.spotify && music.spotify.picture) {
            //   content.push(createFile(music.spotify.picture, "image/jpeg"));
            // }
            if (music.spotify && music.spotify.preview) {
              content.push(createText("Caso queria ouvir um pouquinho:"));
              content.push(createFile(music.spotify.preview, "audio/mpeg"));
            }
          } else {
            const transcriptResult: string[] = await transcript(audioUrl) as string[];
            console.log(transcriptResult.join(','));
            if (transcriptResult) {
              const searchGenius: any = await search(transcriptResult[0]);
              if (searchGenius) {
                let text = "";
                if (searchGenius.response.hits.length > 1) {
                  text = "Possíveis músicas relacionadas: \n"
                  let rank = 1;
                  for (const hit of searchGenius.response.hits.splice(0, 5)) {
                    text += `[${rank}] *Título* ⇒ ${hit.result.title}\n`;
                    text += `[${rank}] *Artista* ⇒ ${hit.result.artist_names}\n\n`;
                    rank++;
                  }
                } else {
                  text = `${text}*Título* ⇒ ${searchGenius.response.hits[0].result.title}\n`;
                  text = `${text}*Artista* ⇒ ${searchGenius.response.hits[0].result.artist_names}\n\n`;
                }
                //text = `${text}*Álbum* ⇒ ${music.album}\n`;
                content = [createText(text)];
              } else {
                content.push(createText(transcriptResult[0]));
              }
            } else {
              content = [
                createText("Não foi possível reconhecer a música no seu áudio 😞"),
              ];
            }
          }
        } else {
          // TODO: Search by lyrics
        }
        if (content.length !== 0) {
          channel
            .sendMessage(
              messageEvent.message.to,
              messageEvent.message.from,
              ...content
            )
            .then((response) => {
              console.debug("Response:", response);
            }).catch((error) => {
              console.log(error)
            });
        }
      },
    });
  } catch (error) {
    console.log(error);
  }

}

export default createWebHook;
