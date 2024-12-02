(() => {
  // ../../../../../../node_modules/@jsr/std__fmt/colors.js
  var { Deno } = globalThis;
  var noColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
  var enabled = !noColor;
  function code(open, close) {
    return {
      open: `\x1B[${open.join(";")}m`,
      close: `\x1B[${close}m`,
      regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
    };
  }
  function run(str, code2) {
    return enabled
      ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}`
      : str;
  }
  function red(str) {
    return run(
      str,
      code([
        31,
      ], 39),
    );
  }
  function green(str) {
    return run(
      str,
      code([
        32,
      ], 39),
    );
  }
  var ANSI_PATTERN = new RegExp(
    [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
    ].join("|"),
    "g",
  );

  // ../../../../../../node_modules/@capture/analytics/lib/core/capture.js
  async function capture(message, options) {
    try {
      const res = await fetch(
        `${options.client.url}/api/capture?id=${options.client.clientId}`,
        {
          method: "POST",
          body: JSON.stringify({
            message,
            data: options.data,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          }),
          headers: {
            Authorization: options.client.publicKey,
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) throw new Error(res.statusText);
      console.log(green("Captured"), message);
      res.body?.cancel();
    } catch (error) {
      console.error(red("Failed to capture"), message, error);
      return new Error(`Failed to capture "${message}"`);
    }
  }

  // ../../../../../../node_modules/@capture/analytics/lib/core/recap.js
  async function recap(messages, options) {
    try {
      const res = await fetch(
        `${options.client.url}/api/recap?id=${options.client.clientId}&messages=${
          encodeURIComponent(JSON.stringify(messages))
        }`,
        {
          method: "GET",
          headers: {
            Authorization: options.key,
          },
        },
      );
      if (!res.ok) throw new Error(res.statusText);
      console.log(green("Recapped data"));
      return res.json();
    } catch (error) {
      console.error(red("Failed to recap data"), error);
      return new Error("Failed to recap data");
    }
  }

  // ../../../../../../node_modules/@capture/analytics/lib/core/client.js
  var CaptureClient = class {
    privateKey;
    clientId;
    publicKey;
    url;
    constructor(options) {
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
    capture = (message, data) =>
      capture(message, {
        data,
        client: this,
      });
    /**
     * Re-capture logs.
     *
     * @param messages - The messages to look up.
     */
    recap = (messages) =>
      recap(messages, {
        client: this,
        key: this.privateKey,
      });
  };

  // ../../../../../../node_modules/@capture/analytics/lib/mod.js
  var mod_default = CaptureClient;

  // ../analytics.ts
  var analytics_default = new mod_default({
    clientId: "cm46kwfn700009wuwctnc3lvb",
    publicKey:
      "cak_uMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEodE4ktVI2kmIJ3DwgUYnbpK8Jrqb",
  });

  // script.ts
  var [getProject, setProject] = state("currentProject", null);
  var [_getKeys, setKeys] = state("keys", null);
  document.getElementById("create-project")?.addEventListener(
    "click",
    async () => {
      const currentProject = getProject();
      if (currentProject) {
        toast("You already have a project!");
        return;
      }
      const name = prompt("What is the project name?");
      if (!name || !name.trim() || name.length < 1) {
        return;
      }
      const res = await fetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        toast("Failed to create project");
        return;
      }
      const { id } = await res.json();
      analytics_default.capture("projectCreate", {
        id,
      });
      const keypair = await fetch(`/api/keypair?id=${id}`, {
        method: "GET",
      });
      if (!keypair.ok) {
        toast("Failed to create keys");
        return;
      }
      const { publicKey, privateKey } = await keypair.json();
      toast("Project created");
      setProject(id);
      setKeys({ publicKey, privateKey });
      alert(
        `Client ID: ${id}
Public key: ${publicKey}
Private key: ${privateKey}`,
      );
    },
  );
  function toast(message) {
    const toast2 = document.createElement("button");
    toast2.textContent = message;
    toast2.classList.add("toast");
    toast2.onclick = () => toast2.remove();
    document.body.appendChild(toast2);
  }
  function state(key, defaultValue) {
    const value = localStorage.getItem(key);
    if (value === null) {
      setState(defaultValue);
    }
    function setState(value2) {
      localStorage.setItem(key, JSON.stringify(value2));
    }
    function getState() {
      const value2 = localStorage.getItem(key);
      return JSON.parse(value2);
    }
    return [getState, setState];
  }
})();
