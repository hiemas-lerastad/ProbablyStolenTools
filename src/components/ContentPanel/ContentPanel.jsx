import React, { useState, useContext, useEffect } from 'react';

import diagonalImg from "../../assets/Diagonal.png"

import "./ContentPanel.css"

function ContentPanel({nav, title, header, children, className=""}) {
  return (
    <div className={`content-panel ${ className }`}>
      <div className="content-panel-nav">
        {nav}
      </div>
      <div className="content-panel-inner">
        <div className="content-panel-title-row">
          <img src={diagonalImg}  className="content-panel-title-diagonal"/>
          <h1 className="content-panel-title">
            {title}
          </h1>
          <img src={diagonalImg}  className="content-panel-title-diagonal content-panel-title-diagonal-right"/>
        </div>
        <div className="content-panel-header">
          {header}
          <div className="content-panel-header-separator">
            <img src={diagonalImg}  className="content-panel-title-diagonal"/>
            <div className="content-panel-header-separator-body"></div>
            <img src={diagonalImg}  className="content-panel-title-diagonal content-panel-title-diagonal-right"/>
          </div>
        </div>
        <div className="content-panel-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export { ContentPanel };