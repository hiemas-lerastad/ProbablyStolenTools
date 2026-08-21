import { INV_KEYS } from "../constants.js";
import { unescapeJsonString } from "./MiscHelpers.js";

const SCALAR_FIELD_RE = /^\s*"([^"]+)"\s*:\s*(true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")\s*,?\s*$/;

function braceDelta(line) {
  const opens = (line.match(/[{[]/g) || []).length;
  const closes = (line.match(/[}\]]/g) || []).length;
  return opens - closes;
}

function scanScalarFields(lines, objectOpenIndex) {
  const fields = {};
  const lineIndexes = {};
  let depth = 0;

  for (let i = objectOpenIndex; i < lines.length; i++) {
    const line = lines[i];
    if (depth === 1) {
      const m = line.match(SCALAR_FIELD_RE);
      if (m) {
        fields[m[1]] = JSON.parse(m[2]);
        lineIndexes[m[1]] = i;
      }
    }

    depth += braceDelta(line);
    if (depth <= 0 && i > objectOpenIndex) break;
  }

  return { fields, lineIndexes };
}

function findChildObjectStart(lines, parentOpenIndex, childKey) {
  const re = new RegExp(`^\\s*"${childKey}"\\s*:\\s*\\{\\s*$`);
  let depth = 0;

  for (let i = parentOpenIndex; i < lines.length; i++) {
    const line = lines[i];
    if (depth === 1 && re.test(line)) return i;

    depth += braceDelta(line);
    if (depth <= 0 && i > parentOpenIndex) return -1;
  }

  return -1;
}

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

  let playerStore = {};
  let playerStoreLineIndexes = {};
  const playerStoreOpenIndex = lines.findIndex(l => /^\s*"playerStore"\s*:\s*\{\s*$/.test(l));
  if (playerStoreOpenIndex !== -1) {
    const valueOpenIndex = findChildObjectStart(lines, playerStoreOpenIndex, "value");
    if (valueOpenIndex !== -1) {
      const scanned = scanScalarFields(lines, valueOpenIndex);
      const excluded = new Set([...INV_KEYS, "currentUniqueId"]);
      for (const key of Object.keys(scanned.fields)) {
        if (excluded.has(key)) continue;
        playerStore[key] = scanned.fields[key];
        playerStoreLineIndexes[key] = scanned.lineIndexes[key];
      }
    }
  }

  let storeStation = {};
  let storeStationLineIndexes = {};
  const storeStationOpenIndex = lines.findIndex(l => /^\s*"storeStation"\s*:\s*\{\s*$/.test(l));
  if (storeStationOpenIndex !== -1) {
    const valueOpenIndex = findChildObjectStart(lines, storeStationOpenIndex, "value");
    if (valueOpenIndex !== -1) {
      const scanned = scanScalarFields(lines, valueOpenIndex);
      const excluded = new Set([...INV_KEYS, "currentUniqueId"]);
      for (const key of Object.keys(scanned.fields)) {
        if (excluded.has(key)) continue;
        storeStation[key] = scanned.fields[key];
        storeStationLineIndexes[key] = scanned.lineIndexes[key];
      }
    }
  }

  return { lines, inventories, currentUniqueId, currentUniqueIdLineIndex, invLineIndexes, playerStore, playerStoreLineIndexes, storeStation, storeStationLineIndexes };
}

function serializePlayerStoreField(originalLine, value) {
  const m = originalLine.match(/^(\s*"[^"]+"\s*:\s*)(?:true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")(\s*,?\s*)$/);
  return m[1] + JSON.stringify(value) + m[2];
}

function serializeStoreStationField(originalLine, value) {
  const m = originalLine.match(/^(\s*"[^"]+"\s*:\s*)(?:true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")(\s*,?\s*)$/);
  return m[1] + JSON.stringify(value) + m[2];
}

function serializeSave(state) {
  const lines = state.lines.slice();
  lines[state.currentUniqueIdLineIndex] = `\t\t\t"currentUniqueId" : ${state.currentUniqueId},`;
  for (const key of INV_KEYS) {
    const idx = state.invLineIndexes[key];
    const inner = JSON.stringify(state.inventories[key]);
    lines[idx] = `\t\t\t"${key}" : ${JSON.stringify(inner)},`;
  }
  for (const key of Object.keys(state.playerStoreLineIndexes)) {
    const idx = state.playerStoreLineIndexes[key];
    lines[idx] = serializePlayerStoreField(state.lines[idx], state.playerStore[key]);
  }
  for (const key of Object.keys(state.storeStationLineIndexes)) {
    const idx = state.storeStationLineIndexes[key];
    lines[idx] = serializeStoreStationField(state.lines[idx], state.storeStation[key]);
  }
  return lines.join("\n");
}

export { parseSave, serializeSave };
