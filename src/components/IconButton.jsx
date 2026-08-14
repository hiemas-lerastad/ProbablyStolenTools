import closeImg from "../assets/Cross.png"
import infoImg from "../assets/Info.png"
import plusImg from "../assets/Plus.png"
import homeImg from "../assets/Home.png"

const icons = {
  "close": closeImg,
  "info": infoImg,
  "plus": plusImg,
  "home": homeImg
}

function IconButton({onClickFunc, iconName, className}) {
  const image = icons[iconName] || "";

  return (
    <button className={`icon-button ${ className }`} onClick={onClickFunc}>
      <img src={image} />
    </button>
  );
}

export { IconButton };