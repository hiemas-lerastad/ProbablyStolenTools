import { useContext, useState, useEffect } from "react";

import { IconButton } from "./IconButton.jsx"

function InfoCard({children, enableClose, closeFunc, title, className, iconName = "close"}) {
  return (
    <div className={`info-card ${ className } ${ !children ? "info-card-empty" : "" }`}>
      <div className="info-card-header">
        <div className="info-card-name">{title}</div>
        { enableClose &&
          <IconButton onClickFunc={closeFunc} iconName={iconName} className="info-card-close" />
        }
      </div>
      <div className="info-card-inner">
        {children}
      </div>
    </div>
  );
}

export { InfoCard };