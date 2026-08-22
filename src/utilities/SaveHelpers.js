import { INV_KEYS } from "../constants.js";
import { unescapeJsonString } from "./MiscHelpers.js";

const PLAYER_STORE_NESTED_FIELDS = ["storeReputations", "healthData", "secData", "savedItemFeatureList"];

// Matches a "key" : value line whose value is a single scalar (string, number,
// bool or null) that fits entirely on one line - i.e. a direct, non-nested
// field of whatever object we're currently scanning through.
const SCALAR_FIELD_RE = /^\s*"([^"]+)"\s*:\s*(true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")\s*,?\s*$/;

// Depth is tracked purely by counting brace/bracket characters per line, not
// by actually parsing JSON - cheap, and works even through the file's non-JSON
// bits (unquoted numeric keys in PhoneClientDict etc.) since those still open
// and close braces normally. This only breaks if a string value itself
// contains a literal { } [ ] character, which doesn't happen anywhere in the
// known save format.
function braceDelta(line) {
  const opens = (line.match(/[{[]/g) || []).length;
  const closes = (line.match(/[}\]]/g) || []).length;
  return opens - closes;
}

// Scans the direct (depth-1) children of the object whose opening line is
// `objectOpenIndex`, collecting every scalar "key": value field found there.
// Nested objects/arrays are skipped over (depth-tracked) rather than parsed.
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

// Finds the line opening `"childKey" : {` as a direct child of the object
// opened at `parentOpenIndex`, returning its index (or -1 if not found).
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

// Finds the full [start, end] line range (both inclusive) of a direct child
// "childKey" : { ... } or "childKey" : [ ... ] block - i.e. from its opening
// bracket down to the line where that same bracket closes.
function findChildBlockRange(lines, parentOpenIndex, childKey) {
  const openRe = new RegExp(`^\\s*"${childKey}"\\s*:\\s*[{[]\\s*$`);
  let depth = 0;

  for (let i = parentOpenIndex; i < lines.length; i++) {
    const line = lines[i];
    if (depth === 1 && openRe.test(line)) {
      let innerDepth = 0;
      for (let j = i; j < lines.length; j++) {
        innerDepth += braceDelta(lines[j]);
        if (innerDepth <= 0) return [i, j];
      }
      return null;
    }

    depth += braceDelta(line);
    if (depth <= 0 && i > parentOpenIndex) return null;
  }

  return null;
}

// Extracts a nested object/array field as real parsed JSON, along with the
// line range it occupies so it can be written back later. Unlike the
// inventories (JSON-encoded as an escaped string), these blocks are inline,
// multi-line JSON - so editing one and collapsing it to a single line on save
// changes the file's total line count, which is why callers must apply edits
// bottom-up (see serializeSave).
function extractJsonBlock(lines, parentOpenIndex, childKey) {
  const range = findChildBlockRange(lines, parentOpenIndex, childKey);
  if (!range) return null;
  const [start, end] = range;

  const colonIdx = lines[start].indexOf(":");
  const text = [lines[start].slice(colonIdx + 1), ...lines.slice(start + 1, end + 1)].join("\n");
  const trimmed = text.replace(/,\s*$/, "");

  return { value: JSON.parse(trimmed), start, end, hadTrailingComma: trimmed.length !== text.length };
}

// Scans one object's direct fields into a flat editable `fields` map: plain
// scalars are captured automatically, and any key named in `nestedKeys` is
// additionally captured as a parsed object/array (see extractJsonBlock).
// `scalarLineIndexes`/`blockRanges` record where each came from so
// serializeSave can write edits back to the right place.
function scanObjectFields(lines, objectOpenIndex, { excludeScalarKeys = [], nestedKeys = [] } = {}) {
  const scanned = scanScalarFields(lines, objectOpenIndex);
  const excluded = new Set(excludeScalarKeys);

  const fields = {};
  const scalarLineIndexes = {};
  for (const key of Object.keys(scanned.fields)) {
    if (excluded.has(key)) continue;
    fields[key] = scanned.fields[key];
    scalarLineIndexes[key] = scanned.lineIndexes[key];
  }

  const blockRanges = {};
  for (const key of nestedKeys) {
    const extracted = extractJsonBlock(lines, objectOpenIndex, key);
    if (extracted) {
      fields[key] = extracted.value;
      blockRanges[key] = extracted;
    }
  }

  return { fields, scalarLineIndexes, blockRanges };
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

  const excludedScalarKeys = [...INV_KEYS, "currentUniqueId"];

  // playerStore.value and storeStation.value hold their fields inline as
  // real (if partially non-standard-JSON) nested objects, unlike the
  // inventories which are JSON-encoded strings.
  let playerStore = {};
  let playerStoreLineIndexes = {};
  let playerStoreBlockRanges = {};
  const playerStoreOpenIndex = lines.findIndex(l => /^\s*"playerStore"\s*:\s*\{\s*$/.test(l));
  if (playerStoreOpenIndex !== -1) {
    const valueOpenIndex = findChildObjectStart(lines, playerStoreOpenIndex, "value");
    if (valueOpenIndex !== -1) {
      const scanned = scanObjectFields(lines, valueOpenIndex, {
        excludeScalarKeys: excludedScalarKeys,
        nestedKeys: PLAYER_STORE_NESTED_FIELDS,
      });
      playerStore = scanned.fields;
      playerStoreLineIndexes = scanned.scalarLineIndexes;
      playerStoreBlockRanges = scanned.blockRanges;
    }
  }

  let storeStation = {};
  let storeStationLineIndexes = {};
  let storeStationBlockRanges = {};
  const storeStationOpenIndex = lines.findIndex(l => /^\s*"storeStation"\s*:\s*\{\s*$/.test(l));
  if (storeStationOpenIndex !== -1) {
    const valueOpenIndex = findChildObjectStart(lines, storeStationOpenIndex, "value");
    if (valueOpenIndex !== -1) {
      const scanned = scanObjectFields(lines, valueOpenIndex, { excludeScalarKeys: excludedScalarKeys });
      storeStation = scanned.fields;
      storeStationLineIndexes = scanned.scalarLineIndexes;
      storeStationBlockRanges = scanned.blockRanges;
    }
  }

  return {
    lines, inventories, currentUniqueId, currentUniqueIdLineIndex, invLineIndexes,
    playerStore, playerStoreLineIndexes, playerStoreBlockRanges,
    storeStation, storeStationLineIndexes, storeStationBlockRanges,
  };
}

function serializeScalarLine(originalLine, value) {
  const m = originalLine.match(/^(\s*"[^"]+"\s*:\s*)(?:true|false|null|-?\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*")(\s*,?\s*)$/);
  return m[1] + JSON.stringify(value) + m[2];
}

function serializeBlockLine(originalStartLine, value, hadTrailingComma) {
  const colonIdx = originalStartLine.indexOf(":");
  const prefix = originalStartLine.slice(0, colonIdx + 1);
  return `${prefix} ${JSON.stringify(value)}${hadTrailingComma ? "," : ""}`;
}

function serializeSave(state) {
  // Every edit is recorded as a [start, end] line range (inclusive) plus the
  // replacement line(s). Scalar edits replace exactly one line with one line,
  // so they never shift anything. Block edits collapse a multi-line
  // object/array down to one line, which DOES shift every line below it -
  // so all edits are applied via splice from the bottom of the file upward,
  // meaning an edit is always applied while every index above it is still
  // the one recorded at parse time.
  const edits = [];

  edits.push({
    start: state.currentUniqueIdLineIndex,
    end: state.currentUniqueIdLineIndex,
    lines: [`\t\t\t"currentUniqueId" : ${state.currentUniqueId},`],
  });

  for (const key of INV_KEYS) {
    const idx = state.invLineIndexes[key];
    const inner = JSON.stringify(state.inventories[key]);
    edits.push({ start: idx, end: idx, lines: [`\t\t\t"${key}" : ${JSON.stringify(inner)},`] });
  }

  for (const [lineIndexes, values] of [
    [state.playerStoreLineIndexes, state.playerStore],
    [state.storeStationLineIndexes, state.storeStation],
  ]) {
    for (const key of Object.keys(lineIndexes)) {
      const idx = lineIndexes[key];
      edits.push({ start: idx, end: idx, lines: [serializeScalarLine(state.lines[idx], values[key])] });
    }
  }

  for (const [blockRanges, values] of [
    [state.playerStoreBlockRanges, state.playerStore],
    [state.storeStationBlockRanges, state.storeStation],
  ]) {
    for (const key of Object.keys(blockRanges)) {
      const { start, end, hadTrailingComma } = blockRanges[key];
      edits.push({ start, end, lines: [serializeBlockLine(state.lines[start], values[key], hadTrailingComma)] });
    }
  }

  edits.sort((a, b) => b.start - a.start);

  const lines = state.lines.slice();
  for (const edit of edits) {
    lines.splice(edit.start, edit.end - edit.start + 1, ...edit.lines);
  }

  return lines.join("\n");
}

export { parseSave, serializeSave };
