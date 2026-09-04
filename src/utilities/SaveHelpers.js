import {
  INV_KEYS,
  PLAYER_STORE_NESTED_FIELDS,
  VALID_ESCAPE_CHARS
} from "./constants.js";

function isWhitespaceChar(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

function skipWhitespace(text, i) {
  while (i < text.length && isWhitespaceChar(text[i])) i++;
  return i;
}

function sanitizeInvalidEscapes(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\" && i + 1 < str.length) {
      const next = str[i + 1];
      result += VALID_ESCAPE_CHARS.has(next) ? str[i] + next : next;
      i++;
      continue;
    }
    result += str[i];
  }
  return result;
}

function parseJson(str) {
  return JSON.parse(sanitizeInvalidEscapes(str));
}

function restoreQuoteEscapes(str) {
  return str.replace(/[“”]/g, (ch) => "\\" + ch);
}

function skipString(text, i) {
  i++;
  while (i < text.length) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === "\"") return i + 1;
    i++;
  }
  return i;
}

function skipValue(text, i) {
  i = skipWhitespace(text, i);
  const ch = text[i];
  if (ch === "\"") return skipString(text, i);
  if (ch === "{" || ch === "[") {
    let depth = 1;
    i++;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (c === "\"") { i = skipString(text, i); continue; }
      if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") depth--;
      i++;
    }
    return i;
  }
  while (i < text.length && !/[,}\]\s]/.test(text[i])) i++;
  return i;
}

function scanChildren(text, openIndex) {
  const fields = {};
  let i = skipWhitespace(text, openIndex + 1);
  while (i < text.length && text[i] !== "}") {
    const keyEnd = skipString(text, i);
    const key = parseJson(text.slice(i, keyEnd));
    i = skipWhitespace(text, keyEnd);
    i = skipWhitespace(text, i + 1); // skip ':'
    const valueStart = i;
    const valueEnd = skipValue(text, i);
    fields[key] = { valueStart, valueEnd };
    i = skipWhitespace(text, valueEnd);
    if (text[i] === ",") i = skipWhitespace(text, i + 1);
  }
  return fields;
}

function findKeySpan(text, key) {
  const re = new RegExp(`"${key}"\\s*:\\s*`);
  const m = re.exec(text);
  if (!m) return null;
  const valueStart = m.index + m[0].length;
  return { valueStart, valueEnd: skipValue(text, valueStart) };
}

function scanWrappedValueFields(text, wrapperKey) {
  const outer = findKeySpan(text, wrapperKey);
  if (!outer || text[outer.valueStart] !== "{") return null;
  const outerFields = scanChildren(text, outer.valueStart);
  const valueField = outerFields.value;
  if (!valueField || text[valueField.valueStart] !== "{") return null;
  return scanChildren(text, valueField.valueStart);
}

function isScalarSpan(text, span) {
  const ch = text[span.valueStart];
  return ch !== "{" && ch !== "[";
}

function readSpans(text, fields, keys, excluded) {
  const values = {};
  const spans = {};
  for (const key of keys) {
    if (excluded && excluded.has(key)) continue;
    const span = fields[key];
    if (!span) continue;
    values[key] = parseJson(text.slice(span.valueStart, span.valueEnd));
    spans[key] = span;
  }
  return { values, spans };
}

function parseSave(text) {
  const playerStoreFields = scanWrappedValueFields(text, "playerStore") || {};

  const idSpan = playerStoreFields.currentUniqueId || null;
  const currentUniqueId = idSpan ? parseJson(text.slice(idSpan.valueStart, idSpan.valueEnd)) : null;

  const inventories = {};
  const invSpans = {};
  for (const key of INV_KEYS) {
    const span = playerStoreFields[key];
    if (!span) continue;
    const inner = parseJson(text.slice(span.valueStart, span.valueEnd));
    inventories[key] = parseJson(inner);
    invSpans[key] = span;
  }

  const missing = [];
  if (currentUniqueId === null) missing.push("currentUniqueId");
  for (const key of INV_KEYS) if (!(key in inventories)) missing.push(key);
  if (missing.length) {
    throw new Error(`This doesn't look like a Probably Stolen save file - missing: ${missing.join(", ")}`);
  }

  const excludedScalarKeys = new Set([...INV_KEYS, "currentUniqueId", ...PLAYER_STORE_NESTED_FIELDS]);
  const scalarKeys = Object.keys(playerStoreFields)
    .filter(key => !excludedScalarKeys.has(key) && isScalarSpan(text, playerStoreFields[key]));
  const { values: playerStore, spans: playerStoreSpans } = readSpans(text, playerStoreFields, scalarKeys);
  const { values: nestedValues, spans: playerStoreBlockSpans } = readSpans(text, playerStoreFields, PLAYER_STORE_NESTED_FIELDS);
  Object.assign(playerStore, nestedValues);

  const storeStationFields = scanWrappedValueFields(text, "storeStation") || {};
  const storeStationKeys = Object.keys(storeStationFields)
    .filter(key => !excludedScalarKeys.has(key) && isScalarSpan(text, storeStationFields[key]));
  const { values: storeStation, spans: storeStationSpans } = readSpans(text, storeStationFields, storeStationKeys);

  return {
    text,
    inventories, invSpans, currentUniqueId, idSpan,
    playerStore, playerStoreSpans, playerStoreBlockSpans,
    storeStation, storeStationSpans,
  };
}

function serializeSave(state) {
  const edits = [];

  edits.push({ ...state.idSpan, text: JSON.stringify(state.currentUniqueId) });

  for (const key of INV_KEYS) {
    const span = state.invSpans[key];
    const inner = JSON.stringify(state.inventories[key]);
    edits.push({ ...span, text: restoreQuoteEscapes(JSON.stringify(inner)) });
  }

  for (const [spans, values] of [
    [state.playerStoreSpans, state.playerStore],
    [state.playerStoreBlockSpans, state.playerStore],
    [state.storeStationSpans, state.storeStation],
  ]) {
    for (const key of Object.keys(spans)) {
      edits.push({ ...spans[key], text: JSON.stringify(values[key]) });
    }
  }

  edits.sort((a, b) => b.valueStart - a.valueStart);

  let text = state.text;
  for (const edit of edits) {
    text = text.slice(0, edit.valueStart) + edit.text + text.slice(edit.valueEnd);
  }

  return text;
}

export { parseSave, serializeSave };
