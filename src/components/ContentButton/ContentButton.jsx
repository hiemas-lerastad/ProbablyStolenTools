import "./ContentButton.css"

function ContentButton({onClickFunc, label, className, tag: Tag ="button", href, disabled, type}) {
  return (
    <Tag className={`content-button ${ className }`} type={type} onClick={onClickFunc} href={href} disabled={disabled}>
      {label}
    </Tag>
  );
}

export { ContentButton };