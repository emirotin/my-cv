import { useState, useEffect, useRef } from "react";

import Buttons from "./Buttons";
import LcdPlayer from "./LcdPlayer";

import lcdTextLines from "./lcdTextLines";

import css from "./lcd.module.scss";

const DISPLAY_IMG = "/images/display.png";

const Lcd = () => {
  const [state, setState] = useState({
    showButtons: false,
    isPlaying: false,
  });

  useEffect(() => {
    new Promise((resolve) => {
      // implements _once_
      let done = false;
      const doResolve = () => {
        if (done) return;
        setTimeout(resolve, 100);
        done = true;
      };

      const img = new Image();
      img.onload = doResolve;
      img.src = DISPLAY_IMG;

      // set load timeout, results in degraded UX but kinda OK?
      setTimeout(doResolve, 850);
    }).then(() => setState({ isPlaying: true }));
  }, []);

  const { showButtons, isPlaying } = state;

  return (
    <div className={css.lcdRoot}>
      <div className={css.lcdWrapOuter}>
        <div className={css.lcdWrapInner}>
          <div className={css.lcdInner}>
            <LcdPlayer
              lines={lcdTextLines}
              isPlaying={isPlaying}
              onDonePlaying={() => {
                setState({ isPlaying: false, showButtons: true });
              }}
            />
          </div>
        </div>
      </div>

      <Buttons hidden={!showButtons} />
    </div>
  );
};

export default Lcd;
