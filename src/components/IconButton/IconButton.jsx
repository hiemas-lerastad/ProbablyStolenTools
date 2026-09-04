import closeImg from "../../assets/Cross.png"
import infoImg from "../../assets/Info.png"
import plusImg from "../../assets/Plus.png"
import homeImg from "../../assets/Home.png"
import minusImg from "../../assets/Minus.png"

import "./IconButton.css"

const icons = {
  "close": closeImg,
  "info": infoImg,
  "plus": plusImg,
  "home": homeImg,
  "minus": minusImg,
}

function IconButton({onClickFunc, iconName, className = "", tag: Tag ="button", href}) {
  const image = icons[iconName] || "";

  return (
    <Tag className={`icon-button ${ className }`} onClick={onClickFunc} href={href}>
      <img src={image} />
    </Tag>
  );
}

export { IconButton };