import Promise from "bluebird";
import { Component } from "react";

import Buttons from "./Buttons";
import LcdPlayer from "./LcdPlayer";

import lcdTextLines from "./lcdTextLines";

import css from "./lcd.module.scss";

const DISPLAY_IMG = "/images/display.png";

export default class Lcd extends Component {
  state = {
    showButtons: false,
  };

  imgPromise = null;
  isMounted = false;

  componentWillUnmount() {
    this.isMounted = false;
  }

  componentDidMount() {
    this.isMounted = true;
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
    })
      .then(() => this.lcdPlayer.play())
      .then(() => {
        this.isMounted && this.setState({ showButtons: true });
      });
  }

  render() {
    const { showButtons } = this.state;

    return (
      <div className={css.lcdRoot}>
        <div className={css.lcdWrapOuter}>
          <div className={css.lcdWrapInner}>
            <div className={css.lcdInner}>
              <LcdPlayer
                lines={lcdTextLines}
                ref={(lcdPlayer) => (this.lcdPlayer = lcdPlayer)}
              />
            </div>
          </div>
        </div>

        <Buttons hidden={!showButtons} />
      </div>
    );
  }
}
