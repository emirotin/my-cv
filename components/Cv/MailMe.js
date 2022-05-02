import config from "../../config";

const MailMe = () => (
  <a href={`mailto:${config.EMAIL}`}>
    <i className="fa fa-envelope" />
    &nbsp;
    <span itemProp="email">{config.EMAIL}</span>
  </a>
);

export default MailMe;
