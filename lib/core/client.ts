import capture from "./capture.ts";
import recap from "./recap.ts";

type ClientOptions = {
  /** Your client id. */
  clientId: string;
  /** Your public key, used for capturing analytics. */
  publicKey: string;
  /** Your private key, used for recapping logs. */
  privateKey: string;
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
  private privateKey: string;
  clientId: string;
  publicKey: string;
  url: string;

  constructor(options: ClientOptions) {
    this.clientId = options.clientId;
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
    this.url = options.url ?? "https://capture-analytics.deno.dev";
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
   * @param messages - The messages to look up.
   */
  recap = (messages: string[]): Promise<unknown | Error> =>
    recap(messages, { client: this, key: this.privateKey });
}
