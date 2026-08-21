import { useState, useEffect } from "react";

import { ContentInput } from "../ContentInput/ContentInput.jsx"
import { IconButton } from "../IconButton/IconButton.jsx"

import "./EditableField.css"

function EditableField({label, value, type, onValueChange, onDeletePressed, className, wrapperClassName = "editable-field"}) {
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  // While focused, trust whatever the user is actively typing rather than
  // the canonical value coming back from saveData - re-parsing a partial
  // value like "1." can round-trip to "1", and overwriting the live input
  // with that mid-keystroke makes it impossible to finish typing a decimal.
  // Only resync once the field loses focus or the value changes externally.
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
