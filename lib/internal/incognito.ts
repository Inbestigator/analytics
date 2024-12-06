// deno-lint-ignore-file no-explicit-any
/*!
 *
 * detectIncognito v1.3.7
 *
 * https://github.com/Joe12387/detectIncognito
 *
 * MIT License
 *
 * Copyright (c) 2021 - 2024 Joe Rutkowski <Joe@dreggle.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Please keep this comment intact in order to properly abide by the MIT License.
 *
 **/

export default async function detectIncognito(): Promise<{
  isPrivate: boolean;
  browserName: string;
}> {
  return await new Promise(function (resolve, reject) {
    let browserName = "Unknown";

    function __callback(isPrivate: boolean): void {
      resolve({
        isPrivate,
        browserName,
      });
    }

    function identifyChromium(): string {
      const ua = navigator.userAgent;
      if (ua.match(/Chrome/)) {
        if ((navigator as any).brave !== undefined) {
          return "Brave";
        } else if (ua.match(/Edg/)) {
          return "Edge";
        } else if (ua.match(/OPR/)) {
          return "Opera";
        }
        return "Chrome";
      } else {
        return "Chromium";
      }
    }

    function assertEvalToString(value: number): boolean {
      return value === eval.toString().length;
    }

    function feid(): number {
      let toFixedEngineID = 0;
      try {
        (-1).toFixed(-1);
      } catch (e) {
        toFixedEngineID = (e as Error).message.length; // Safari 44, Chrome 51, Firefox 25
      }
      return toFixedEngineID;
    }

    function isSafari(): boolean {
      return feid() === 44;
    }

    function isChrome(): boolean {
      return feid() === 51;
    }

    function isFirefox(): boolean {
      return feid() === 25;
    }

    function isMSIE(): boolean {
      return (
        (navigator as any).msSaveBlob !== undefined && assertEvalToString(39)
      );
    }

    /**
     * Safari (Safari for iOS & macOS)
     */

    function newSafariTest(): void {
      const tmp_name = String(Math.random());

      try {
        const db = (globalThis as any).indexedDB.open(tmp_name, 1);

        db.onupgradeneeded = function (i: { target: IDBRequest }) {
          const res = (i.target as IDBRequest).result;

          try {
            res
              .createObjectStore("test", {
                autoIncrement: true,
              })
              .put(new Blob());

            __callback(false);
          } catch (e) {
            let message = e;

            if (e instanceof Error) {
              message = e.message ?? e;
            }

            if (typeof message !== "string") {
              __callback(false);
              return;
            }

            const matchesExpectedError = message.includes(
              "BlobURLs are not yet supported",
            );

            __callback(matchesExpectedError);
            return;
          } finally {
            res.close();
            globalThis.indexedDB.deleteDatabase(tmp_name);
          }
        };
      } catch {
        __callback(false);
      }
    }

    function oldSafariTest(): void {
      const openDB = (globalThis as any).openDatabase;
      const storage = globalThis.localStorage;
      try {
        openDB(null, null, null, null);
      } catch {
        __callback(true);
        return;
      }
      try {
        storage.setItem("test", "1");
        storage.removeItem("test");
      } catch {
        __callback(true);
        return;
      }
      __callback(false);
    }

    function safariPrivateTest(): void {
      if (navigator.maxTouchPoints !== undefined) {
        newSafariTest();
      } else {
        oldSafariTest();
      }
    }

    /**
     * Chrome
     */

    function getQuotaLimit(): number {
      const w = globalThis as any;
      if (
        w.performance !== undefined &&
        w.performance.memory !== undefined &&
        w.performance.memory.jsHeapSizeLimit !== undefined
      ) {
        return (performance as any).memory.jsHeapSizeLimit;
      }
      return 1073741824;
    }

    // >= 76
    function storageQuotaChromePrivateTest(): void {
      (navigator as any).webkitTemporaryStorage.queryUsageAndQuota(
        function (_: number, quota: number) {
          const quotaInMib = Math.round(quota / (1024 * 1024));
          const quotaLimitInMib = Math.round(getQuotaLimit() / (1024 * 1024)) *
            2;

          __callback(quotaInMib < quotaLimitInMib);
        },
        function (e: any) {
          reject(
            new Error(
              "detectIncognito somehow failed to query storage quota: " +
                e.message,
            ),
          );
        },
      );
    }

    // 50 to 75
    function oldChromePrivateTest(): void {
      const fs = (globalThis as any).webkitRequestFileSystem;
      const success = function () {
        __callback(false);
      };
      const error = function () {
        __callback(true);
      };
      fs(0, 1, success, error);
    }

    function chromePrivateTest(): void {
      if (
        self.Promise !== undefined &&
        (self.Promise as any).allSettled !== undefined
      ) {
        storageQuotaChromePrivateTest();
      } else {
        oldChromePrivateTest();
      }
    }

    /**
     * Firefox
     */

    function firefoxPrivateTest(): void {
      __callback(navigator.serviceWorker === undefined);
    }

    /**
     * MSIE
     */

    function msiePrivateTest(): void {
      __callback(globalThis.indexedDB === undefined);
    }

    function main(): void {
      if (isSafari()) {
        browserName = "Safari";
        safariPrivateTest();
      } else if (isChrome()) {
        browserName = identifyChromium();
        chromePrivateTest();
      } else if (isFirefox()) {
        browserName = "Firefox";
        firefoxPrivateTest();
      } else if (isMSIE()) {
        browserName = "Internet Explorer";
        msiePrivateTest();
      } else {
        reject(new Error("Cannot determine the browser"));
      }
    }

    main();
  });
}