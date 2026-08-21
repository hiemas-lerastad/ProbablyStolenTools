import { useContext, useState, useEffect } from "react";
import { parseSave, serializeSave } from "../../../utilities/SaveHelpers.js"
import { SaveDataContext } from "../../../context/SaveData.jsx"

import { ContentButton } from "../../ContentButton/ContentButton.jsx"

import './SaveLoader.css'

function SaveLoader() {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const [fileName, setFileName] = useState("save.es3");

  function handleSaveChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name)
    const buf = file.arrayBuffer();

    buf.then((buffer) => {
      const text = new TextDecoder("utf-8").decode(buffer);
      const state = parseSave(text);

      setSaveData({ ...state, loadId: Date.now() })
    })
  }

  function DownloadSave() {
    const text = serializeSave(saveData);
    const blob = new Blob([new TextEncoder().encode(text)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="save-loader">
      <label className="save-loader-label">
        Load a save file (save_&lt;slot&gt;.es3):
        <input type="file" id="fileInput" accept=".es3" onChange={handleSaveChange} className="save-loader-input"/>
      </label>
      {saveData &&
        <ContentButton className="download" onClickFunc={DownloadSave} label="Download Modified Save"/>
      }
    </section>
  )
}

export { SaveLoader };