import { walkFiles } from "@svarta/walk-it";

const srcDir = "./src";

Deno.mkdirSync(srcDir, { recursive: true });

for await (
  const { file, path } of walkFiles(srcDir, {
    filterFile: (entry) => entry.name.endsWith(".ts"),
  })
) {
  const inputFile = `${srcDir}/${file.name}`;
  const outputFile = `${srcDir}/${
    path.split(/[\\\/]src[\\\/]/)[1].split(file.name)[0]
  }${file.name.replace(".ts", ".js")}`;

  console.log(`Bundling and minifying ${inputFile}...`);

  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "npm:esbuild", "--bundle", "--minify", inputFile],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = command.spawn();

  child.stdout.pipeTo(
    Deno.openSync(outputFile, { write: true, create: true }).writable,
  );

  const status = await child.status;
  if (status.success) {
    console.log(`Successfully bundled ${inputFile} to ${outputFile}`);
  } else {
    console.error(`Failed to bundle ${inputFile}`);
  }
  child.stdin.close();
}
