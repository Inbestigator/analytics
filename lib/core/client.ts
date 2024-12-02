import capture from "./capture.ts";
import recap from "./recap.ts";

type ClientOptions = {
  /** Your client id. */
  clientId: string;
  /** The key to use, can be public or private. Public can only capture logs. */
  key: string;
  /** Use your own API. */
  url?: string;
};

/**
 * Creates a new instance of an analytics client with the given options.
 * The client can be used to capture messages and recap logs.
 *
 * @param options - The options for the client.
 */
export default class CaptureClient {
  clientId: string;
  key: string;
  url: string;

  constructor(options: ClientOptions) {
    this.clientId = options.clientId;
    this.key = options.key;
    this.url = options.url ?? "https://capture.deno.dev";
  }

  /**
   * Captures a log message and sends it to analytics server.
   *
   * @param message - The message to capture.
   * @param data - Optional data to include with the message.
   */
  capture = (
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void | Error> => capture(message, { data, client: this });

  /**
   * Re-capture logs.
   *
   * If a private key is not given, this method will return an error.
   *
   * @param messages - The messages to look up.
   */
  recap = (messages: string[]): Promise<unknown | Error> =>
    this.key.startsWith("cak_r")
      ? recap(messages, { client: this })
      : Promise.reject(
        new Error(
          "Private key not given to client, please provide a private key to use the recap method",
        ),
      );
}
