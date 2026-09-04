import { useContext, useState, useEffect } from "react";

import { IconButton } from "../components.js"

import './InfoPanel.css'

function InfoPanel({children, enableClose, closeFunc, title, className = "", iconName, collapsable, collapsedState = false, collapsedIconName = "plus", buttons}) {
  const [collapsed, setCollapsed] = useState(collapsable ? collapsedState : false);

  if (!iconName && collapsable) {
    iconName = "minus"
  } else if (!iconName) {
    iconName = "close"
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed)
  }

  return (
    <div className={`info-panel ${ className } ${ !children || collapsed ? "info-panel-empty" : "" }`}>
      <div className="info-panel-header">
        <div className="info-panel-name">{title}</div>
        <div className="info-panel-buttons">
          {buttons}
          { enableClose || collapsable &&
            <IconButton onClickFunc={collapsable ? toggleCollapsed : closeFunc} iconName={collapsed ? collapsedIconName : iconName} className="info-panel-close" />
          }
        </div>
      </div>
      { !collapsed &&
        <div className="info-panel-inner">
            {children}
        </div>
      }
    </div>
  );
}

export { InfoPanel };