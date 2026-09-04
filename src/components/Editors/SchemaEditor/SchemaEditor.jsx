import { useContext, useState } from "react";

import { SaveDataContext } from "../../../context/SaveData.jsx"
import { getAtPath, updateAtPath, appendAtPath, removeAtPath } from "../../../utilities/PathHelpers.js"

import { EditableField, InfoPanel, IconButton, ContentInput, ContentButton } from "../../components.js"

import "./SchemaEditor.css"

function resolveTitle(node, item, index) {
  if (node.titleFn) return node.titleFn(item, index);
  if (node.titleField && item && item[node.titleField]) return item[node.titleField];
  return `${node.label || node.key} ${index}`;
}

function defaultForType(type) {
  if (type === "number") return 0;
  if (type === "checkbox") return false;
  return "";
}

const defaultDictAccessors = {
  entries: (raw) => Object.entries(raw || {}),
  getValue: (value) => value,
  setValue: (raw, name, value) => ({ ...raw, [name]: value }),
  addEntry: (raw, name, itemType) => ({ ...raw, [name]: defaultForType(itemType) }),
  removeEntry: (raw, name) => {
    const next = { ...raw };
    delete next[name];
    return next;
  },
};

function DictField({ node, entries, getValue, mutable, onValueChange, onRemove, onAdd }) {
  const [newName, setNewName] = useState("");

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName("");
  }

  return (
    <div className="schema-editor-dict">
      <div className="schema-editor-fields">
        {entries.map(([name, rawValue]) => (
          <EditableField
            key={name}
            label={name}
            type={node.itemType || "text"}
            value={getValue(rawValue) ?? ""}
            onValueChange={(_, v) => onValueChange(name, v)}
            onDeletePressed={mutable ? () => onRemove(name) : undefined}
          />
        ))}
      </div>
      {mutable &&
        <div className="schema-editor-dict-footer">
          <ContentInput type="text" value={newName} placeholder="Key name" onChangeFunc={e => setNewName(e.currentTarget.value)} />
          <ContentButton onClickFunc={handleAdd} label="Add" />
        </div>
      }
    </div>
  );
}

function SchemaNodeList({ nodes, scopePath, saveData, setSaveData, className = "schema-editor-fields" }) {
  function handleLeafChange(node, fieldPath, value) {
    const parsedValue = node.type === "number" ? Number(value) : value;
    setSaveData(prev => updateAtPath(prev, fieldPath, () => parsedValue));
  }

  function handleAddItem(node, arrayPath) {
    const fallback = node.itemSchema ? {} : defaultForType(node.itemType);
    setSaveData(prev => appendAtPath(prev, arrayPath, node.defaultItem ? node.defaultItem() : fallback));
  }

  function handleRemoveItem(arrayPath, index) {
    setSaveData(prev => removeAtPath(prev, arrayPath, index));
  }

  function handleDictChange(node, containerPath, name, value) {
    const setValue = node.setValue || defaultDictAccessors.setValue;
    setSaveData(prev => updateAtPath(prev, containerPath, raw => setValue(raw, name, value)));
  }

  function handleDictAdd(node, containerPath, name) {
    const addEntry = node.addEntry || ((raw, n) => defaultDictAccessors.addEntry(raw, n, node.itemType));
    setSaveData(prev => updateAtPath(prev, containerPath, raw => addEntry(raw, name)));
  }

  function handleDictRemove(node, containerPath, name) {
    const removeEntry = node.removeEntry || defaultDictAccessors.removeEntry;
    setSaveData(prev => updateAtPath(prev, containerPath, raw => removeEntry(raw, name)));
  }

  return (
    <div className={className}>
      {nodes.map((node) => {
        const fullPath = [...scopePath, ...(node.path || []), node.key];

        if (node.type === "dict") {
          const containerPath = [...scopePath, ...(node.path || [])];
          const raw = getAtPath(saveData, containerPath);
          const entriesFn = node.entries || defaultDictAccessors.entries;
          const getValueFn = node.getValue || defaultDictAccessors.getValue;
          const mutable = node.mutable !== false;

          return (
            <InfoPanel key={node.key} title={node.label || node.key} collapsable={true} className="schema-editor-dict-panel details-card">
              <DictField
                node={node}
                entries={entriesFn(raw)}
                getValue={getValueFn}
                mutable={mutable}
                onValueChange={(name, value) => handleDictChange(node, containerPath, name, value)}
                onRemove={(name) => handleDictRemove(node, containerPath, name)}
                onAdd={(name) => handleDictAdd(node, containerPath, name)}
              />
            </InfoPanel>
          );
        }

        if (node.type === "object") {
          return (
            <InfoPanel key={node.key} title={node.label || node.key} collapsable={true} className="schema-editor-object details-card">
              <SchemaNodeList nodes={node.fields} scopePath={fullPath} saveData={saveData} setSaveData={setSaveData} />
            </InfoPanel>
          );
        }

        if (node.type === "array") {
          const items = getAtPath(saveData, fullPath) || [];
          const mutable = node.mutable !== false;

          if (!node.itemSchema) {
            return (
              <div key={node.key} className="schema-editor-array schema-editor-array-scalar">
                {items.map((value, index) => (
                  <EditableField
                    key={index}
                    label={node.label || node.key}
                    type={node.itemType || "text"}
                    value={value}
                    onValueChange={(_, v) => handleLeafChange({ type: node.itemType }, [...fullPath, index], v)}
                    onDeletePressed={mutable ? () => handleRemoveItem(fullPath, index) : undefined}
                  />
                ))}
                {mutable &&
                  <IconButton iconName="plus" tag="button" onClickFunc={() => handleAddItem(node, fullPath)} className="schema-editor-add" />
                }
              </div>
            );
          }

          return (
            <div key={node.key} className="schema-editor-array">
              {items.map((item, index) => {
                const titleText = <span>{resolveTitle(node, item, index)}</span>;
                const buttons = mutable ? (<IconButton iconName="close" tag="button" onClickFunc={() => handleRemoveItem(fullPath, index)} />) : false;
                return (
                  <InfoPanel key={index} title={titleText} collapsable={true} className="schema-editor-array-item details-card" buttons={buttons}>
                    <SchemaNodeList nodes={node.itemSchema} scopePath={[...fullPath, index]} saveData={saveData} setSaveData={setSaveData} />
                  </InfoPanel>
                );
              })}
              {mutable &&
                <IconButton iconName="plus" tag="button" onClickFunc={() => handleAddItem(node, fullPath)} className="schema-editor-add" />
              }
            </div>
          );
        }

        const value = getAtPath(saveData, fullPath);
        return (
          <EditableField
            key={node.key}
            label={node.label || node.key}
            type={node.type}
            value={node.type === "number" && !value ? 0 : value}
            onValueChange={(_, v) => handleLeafChange(node, fullPath, v)}
          />
        );
      })}
    </div>
  );
}

function SchemaEditor({ schema, className = "", rootPath = [] }) {
  const { saveData, setSaveData } = useContext(SaveDataContext);
  if (!saveData) return null;

  return (
    <SchemaNodeList nodes={schema} scopePath={rootPath} saveData={saveData} setSaveData={setSaveData} className={`schema-editor ${className}`} />
  );
}

export { SchemaEditor };
