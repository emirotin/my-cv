import config from "../../config";

const MailMe = () => (
  <span>
    <i className="fa fa-envelope" />
    &nbsp;
    <a href={`mailto:${config.EMAIL}`}>
      <span itemProp="email">{config.EMAIL}</span>
    </a>
  </span>
);

export default MailMe;
