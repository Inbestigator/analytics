import capture from "./capture.ts";
import recap from "./recap.ts";
import release from "./release.ts";

type ClientOptions = {
  /** Your project's id. */
  projectId: string;
  /** The key to use, can be public or private. Public can only capture logs. */
  key: string;
  /** Use your own API. */
  url?: string;
};

/**
 * Creates a new instance of an analytics client with the given options.
 * The client can be used to capture events and recap logs.
 *
 * @param options - The options for the client.
 */
export default class CaptureClient {
  projectId: string;
  key: string;
  url: string;

  constructor(options: ClientOptions) {
    this.projectId = options.projectId;
    this.key = options.key;
    this.url = options.url ?? "https://capture-analytics.vercel.app";
  }

  /**
   * Captures an event and sends it to the analytics server.
   *
   * @param event - The event to capture.
   * @param options - Options for the capture.
   */
  capture = (
    event: string,
    data?: Record<string, unknown>,
  ): ReturnType<typeof capture> => capture(event, { data, client: this });

  /**
   * Re-capture events.
   *
   * If a private key is not given, this method will return an error.
   *
   * @param events - The events to look up.
   */
  recap = (events: string[]): ReturnType<typeof recap> => {
    if (!this.key.startsWith("cak_r")) {
      throw new Error(
        "Private key not given to client, please provide a private key to use the recap method",
      );
    }

    return recap(events, { client: this });
  };

  /**
   * Deletes a captured event.
   *
   * @param capture - The capture to delete.
   */
  release = (capture: string): ReturnType<typeof release> => {
    if (!this.key.startsWith("cak_r")) {
      throw new Error(
        "Private key not given to client, please provide a private key to use the release method",
      );
    }

    return release(capture, { client: this });
  };
}
