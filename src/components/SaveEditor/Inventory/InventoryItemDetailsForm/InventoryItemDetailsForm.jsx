import { useContext, useState, useEffect } from "react";

import { InfoCard } from "../../../InfoCard/InfoCard.jsx"
import { ContentInput } from "../../../ContentInput/ContentInput.jsx"
import { ContentButton } from "../../../ContentButton/ContentButton.jsx"
import { IconButton } from "../../../IconButton/IconButton.jsx"

import { SaveDataContext } from "../../../../context/SaveData.jsx"
import { EDITABLE_FIELDS } from "../../../../constants.js"

import { getTagValue, setTagValueFromInput, addItemTag, removeItemTag } from "../../../../utilities/ItemHelpers.js"

import "./InventoryItemDetailsForm.css"

function EditableField({label, value, type, onValueChange, onDeletePressed}) {

  function handleValueChange(e) {
    if (onValueChange) {
      onValueChange(label, e.currentTarget.value)
    }
  }

  function handleDeletePressed(e) {
    if (onDeletePressed) {
      onDeletePressed(label)
    }
  }

  return (
    <label className="editable-section-field">
      <span>{label}</span>
      <ContentInput type={type} value={value} onChangeFunc={handleValueChange} className="details-input"/>
      {onDeletePressed &&
        // <button onClick={handleDeletePressed}>X</button>
      <IconButton onClickFunc={handleDeletePressed} iconName="close"tag="button" />
      }
    </label>
  );
}

const POSITION_FIELDS = [
  ["x", "<minX>k__BackingField"],
  ["y", "<minY>k__BackingField"],
];

function updateItem(prev, invKey, index, updater) {
  const saveItems = prev.inventories[invKey].saveItems;
  const updatedItems = saveItems.map((it, i) => i === index ? updater(it) : it);

  return {
    ...prev,
    inventories: {
      ...prev.inventories,
      [invKey]: { ...prev.inventories[invKey], saveItems: updatedItems },
    },
  };
}

function InventoryItemDetailsForm({item, index, invKey, handleClose}) {
  const { setSaveData } = useContext(SaveDataContext);
  const [newTagName, setNewTagName] = useState("");

  function handleDetailsFieldChange(field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => updateItem(prev, invKey, index, it => ({ ...it, [field]: parsedValue })));
  }

  function handlePositionFieldChange(field, value) {
    const parsedValue = Number(value);
    setSaveData(prev => updateItem(prev, invKey, index, it => ({
      ...it,
      itemModifiedShape: { ...it.itemModifiedShape, [field]: parsedValue },
    })));
  }

  function handleTagFieldChange(name, value) {
    setSaveData(prev => updateItem(prev, invKey, index, it => {
      const tagIndex = it._keys.indexOf(name);
      const newTag = { ...it._values[tagIndex] };
      setTagValueFromInput(newTag, value);
      const newValues = it._values.map((v, i) => i === tagIndex ? newTag : v);
      return { ...it, _values: newValues };
    }));
  }

  function handleTagDeletion(name) {
    setSaveData(prev => updateItem(prev, invKey, index, it => removeItemTag(it, name)));
  }

  function handleAddTag() {
    const name = newTagName.trim();
    if (!name) return;

    setSaveData(prev => updateItem(prev, invKey, index, it => addItemTag(it, name, "")));
    setNewTagName("");
  }

  var detailsFields = []
  for (const [field, type] of EDITABLE_FIELDS) {
    var value = item[field]
    detailsFields.push(<EditableField key={field} label={field} value={value} type={type} onValueChange={(f, v) => handleDetailsFieldChange(f, v, type)}/>)
  }

  var positionFields = []
  for (const [label, field] of POSITION_FIELDS) {
    var value = item.itemModifiedShape[field]
    positionFields.push(<EditableField key={field} label={label} value={value} type="number" onValueChange={(f, v) => handlePositionFieldChange(field, v)}/>)
  }

  var tagsFields = []
  item._keys.forEach((key) => {
    const tag = item._values[item._keys.indexOf(key)];
    const value = getTagValue(tag)

    tagsFields.push(<EditableField key={key} label={key} value={value} type="text" onValueChange={(f, v) => handleTagFieldChange(f, v)} onDeletePressed={handleTagDeletion}/>)
  })

  return (
    <InfoCard title={item.name} enableClose={true} closeFunc={handleClose} className="inventory-item-details-card">
      <div className="details-card editable-section">
        <div className="editable-section-heading">
          Details
        </div>
        <div className="editable-section-fields">
          {detailsFields}
        </div>
      </div>
      <br/>
      <div className="position-card editable-section">
        <div className="editable-section-heading">
          Position
        </div>
        <div className="editable-section-fields">
          {positionFields}
        </div>
      </div>
      <br/>
      <div className="tags-card editable-section">
        <div className="editable-section-heading">
          Tags
        </div>
        <div className="editable-section-fields">
          {tagsFields}
        </div>
        <div className="editable-section-footer">
          <ContentInput type="text" value={newTagName} placeholder="Tag name" onChangeFunc={e => setNewTagName(e.currentTarget.value)} name="add-new-tag" className="details-input"/>
          <ContentButton onClickFunc={handleAddTag} label="Add Tag" className="details-button"/>
        </div>
      </div>
    </InfoCard>
  );
}

export { InventoryItemDetailsForm };