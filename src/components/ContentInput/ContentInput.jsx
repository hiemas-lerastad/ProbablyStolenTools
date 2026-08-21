import "./ContentInput.css"

function ContentInput({tag: Tag ="input", type, onChangeFunc, onInputFunc, onFocusFunc, onBlurFunc, name, min, max, step, defaultValue, className = "", children, placeholder, value = "", checked}) {
  return (
    <Tag className={`content-input ${ className }`} type={type} onChange={onChangeFunc} onInput={onInputFunc} onFocus={onFocusFunc} onBlur={onBlurFunc} name={name} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} value={value} checked={type === "checkbox" ? checked : false} name={name}>
      {children}
    </Tag>
  );
}

export { ContentInput };