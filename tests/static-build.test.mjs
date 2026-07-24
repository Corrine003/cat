import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("build outputs the Netlify static site", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>猫格观测所<\/title>/);
  assert.match(html, /\/assets\/index-/);

  await access(new URL("../dist/favicon.svg", import.meta.url));
});
