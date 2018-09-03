export default ({ username, width = 300, height = 150 }) => {
  const id = `ghcard-${username}-1`;
  const url = `https://lab.lepture.com/github-cards/cards/default.html?user=${username}&amp;identity=${id}&amp;target=blank`;

  return (
    <iframe
      id={id}
      frameBorder="0"
      scrolling="0"
      allowtransparency="true"
      src={url}
      width={width}
      height={height}
    />
  );
};
