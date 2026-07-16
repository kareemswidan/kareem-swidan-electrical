import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("ships the complete multi-page website", async () => {
  const pages = [
    "index.html",
    "products.html",
    "productDetails.html",
    "about.html",
    "contactUs.html",
    "privacy.html",
    "terms.html",
  ];
  for (const page of pages) await access(new URL(page, root));

  const home = await read("index.html");
  for (const href of ["products.html", "about.html", "contactUs.html"]) {
    assert.match(home, new RegExp(`href=["']${href}`));
  }
});

test("catalogue exposes search, filtering, and product detail navigation", async () => {
  const [catalogue, detail, script] = await Promise.all([
    read("products.html"),
    read("productDetails.html"),
    read("js/script.js"),
  ]);
  assert.match(catalogue, /search/i);
  assert.match(catalogue, /filter|category/i);
  assert.match(detail, /product/i);
  assert.match(script, /URLSearchParams|productDetails/i);
});

test("contact paths and responsive metadata are present", async () => {
  const [home, contact] = await Promise.all([read("index.html"), read("contactUs.html")]);
  assert.match(home, /name="viewport"/i);
  assert.match(`${home}\n${contact}`, /wa\.me|whatsapp/i);
  assert.match(`${home}\n${contact}`, /tel:/i);
});
