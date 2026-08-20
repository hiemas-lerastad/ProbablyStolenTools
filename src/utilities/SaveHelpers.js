import { INV_KEYS } from "../constants.js";
import { unescapeJsonString } from "./MiscHelpers.js";

function parseSave(text) {
  const lines = text.split(/\r\n|\r|\n/);
  const invRe = /^\s*"([a-zA-Z]+JSON)"\s*:\s*"(.+)",?\s*$/;
  const idRe = /^\s*"currentUniqueId"\s*:\s*(\d+),?\s*$/;

  const inventories = {};
  const invLineIndexes = {};
  let currentUniqueId = null;
  let currentUniqueIdLineIndex = -1;

  lines.forEach((line, i) => {
    const idMatch = line.match(idRe);
    if (idMatch) {
      currentUniqueId = parseInt(idMatch[1], 10);
      currentUniqueIdLineIndex = i;
      return;
    }
    const m = line.match(invRe);
    if (m && INV_KEYS.includes(m[1])) {
      inventories[m[1]] = JSON.parse(unescapeJsonString(m[2]));
      invLineIndexes[m[1]] = i;
    }
  });

  const missing = [];
  if (currentUniqueId === null) missing.push("currentUniqueId");
  for (const key of INV_KEYS) if (!(key in inventories)) missing.push(key);
  if (missing.length) {
    throw new Error(`This doesn't look like a Probably Stolen save file - missing: ${missing.join(", ")}`);
  }

  return { lines, inventories, currentUniqueId, currentUniqueIdLineIndex, invLineIndexes };
}

function serializeSave(state) {
  const lines = state.lines.slice();
  lines[state.currentUniqueIdLineIndex] = `\t\t\t"currentUniqueId" : ${state.currentUniqueId},`;
  for (const key of INV_KEYS) {
    const idx = state.invLineIndexes[key];
    const inner = JSON.stringify(state.inventories[key]);
    lines[idx] = `\t\t\t"${key}" : ${JSON.stringify(inner)},`;
  }
  return lines.join("\n");
}

export { parseSave, serializeSave };