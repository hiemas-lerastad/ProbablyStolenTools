import { useState, useEffect } from "react";

import { ContentInput, IconButton } from "../../components.js"

import "./EditableField.css"

function EditableField({label, value, type, onValueChange, onDeletePressed, className, wrapperClassName = "editable-field"}) {
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setLocalValue(value);
  }, [value, focused]);

  function handleValueChange(e) {
    const next = type === "checkbox" ? e.currentTarget.checked : e.currentTarget.value;
    setLocalValue(next);
    if (onValueChange) {
      onValueChange(label, next)
    }
  }

  function handleBlur() {
    setFocused(false);
    setLocalValue(value);
  }

  function handleDeletePressed(e) {
    if (onDeletePressed) {
      onDeletePressed(label)
    }
  }

  return (
    <label className={wrapperClassName}>
      <span>{label}</span>
      <ContentInput type={type} value={localValue} checked={localValue} onChangeFunc={handleValueChange} onFocusFunc={() => setFocused(true)} onBlurFunc={handleBlur} className={className}/>
      {onDeletePressed &&
        <IconButton onClickFunc={handleDeletePressed} iconName="close" tag="button" />
      }
    </label>
  );
}

export { EditableField };
