function getAtPath(obj, path) {
  let cur = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

function setAtPath(obj, path, value) {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  const base = obj != null ? obj : (typeof key === "number" ? [] : {});
  if (Array.isArray(base)) {
    const next = base.slice();
    next[key] = setAtPath(base[key], rest, value);
    return next;
  }
  return { ...base, [key]: setAtPath(base[key], rest, value) };
}

function updateAtPath(obj, path, updater) {
  return setAtPath(obj, path, updater(getAtPath(obj, path)));
}

function appendAtPath(obj, path, item) {
  const arr = getAtPath(obj, path) || [];
  return setAtPath(obj, path, [...arr, item]);
}

function removeAtPath(obj, path, index) {
  const arr = getAtPath(obj, path) || [];
  return setAtPath(obj, path, arr.filter((_, i) => i !== index));
}

export { getAtPath, setAtPath, updateAtPath, appendAtPath, removeAtPath };
