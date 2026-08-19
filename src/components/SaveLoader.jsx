import { useContext, useState, useEffect } from "react";
import { parseSave } from "../utilities/SaveHelpers.js"
import { SaveDataContext } from "../context/SaveData.jsx"

function SaveLoader() {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  function handleSaveChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const buf = file.arrayBuffer();

    buf.then((buffer) => {
      const text = new TextDecoder("utf-8").decode(buffer);
      const state = parseSave(text);

      setSaveData(state)
    })
  }

  return (
    <section id="loader">
      <label>
        Load a save file (save_&lt;slot&gt;.es3):
        <input type="file" id="fileInput" accept=".es3" onChange={handleSaveChange} />
      </label>
    </section>
  )
}

export { SaveLoader };