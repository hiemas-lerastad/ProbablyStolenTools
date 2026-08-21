import "./ContentInput.css"

function ContentInput({tag: Tag ="input", type, onChangeFunc, onInputFunc, name, min, max, step, defaultValue, className = "", children, placeholder, value, checked}) {
  return (
    <Tag className={`content-input ${ className }`} type={type} onChange={onChangeFunc} onInput={onInputFunc} name={name} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} value={type === "checkbox" ? undefined : value} checked={type === "checkbox" ? checked : undefined} name={name}>
      {children}
    </Tag>
  );
}

export { ContentInput };