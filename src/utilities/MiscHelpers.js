function unescapeJsonString(raw) {
  return JSON.parse('"' + raw + '"');
}

export { unescapeJsonString };