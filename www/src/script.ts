import captureClient from "../analytics.ts";

const [getProject, setProject] = state<string | null>("currentProject", null);
const [_getKeys, setKeys] = state<
  {
    publicKey: string;
    privateKey: string;
  } | null
>("keys", null);

document
  .getElementById("create-project")
  ?.addEventListener("click", async () => {
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

    captureClient.capture("projectCreate", {
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
      `Client ID: ${id}\n\nPublic key: ${publicKey}\n\nPrivate key: ${privateKey}`,
    );
  });

function toast(message: string) {
  const toast = document.createElement("button");
  toast.textContent = message;
  toast.classList.add("toast");
  toast.onclick = () => toast.remove();
  document.body.appendChild(toast);
}

function state<T>(key: string, defaultValue: T) {
  const value = localStorage.getItem(key);

  if (value === null) {
    setState(defaultValue);
  }

  function setState(value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getState(): T {
    const value = localStorage.getItem(key)!;
    return JSON.parse(value);
  }

  return [getState, setState] as const;
}
