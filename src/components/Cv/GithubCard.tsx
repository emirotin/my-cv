import type React from "react";

import css from "./cv.module.scss";

const GithubCard: React.FC<{
  username: string;
  width?: number;
  height?: number;
}> = ({ username, width = 300, height = 155 }) => {
  const id = `ghcard-${username}-1`;
  const url = `https://lab.lepture.com/github-cards/cards/default.html?user=${username}&amp;identity=${id}&amp;target=blank`;

  return (
    <iframe
      id={id}
      allowTransparency
      src={url}
      width={width}
      height={height}
      className={css.githubCard}
    />
  );
};

export default GithubCard;
