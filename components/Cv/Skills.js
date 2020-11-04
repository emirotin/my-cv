import { Badge } from "reactstrap";

import list from "./skillsList";

const flatList = list
  .map(({ type, label, skills }) =>
    skills.map((skill) => ({ skill, type, label }))
  )
  .reduce((a, b) => a.concat(b), []);

const Skills = () =>
  flatList.map(({ skill, label }, i) => (
    <Badge key={i} color={label}>
      {skill}
    </Badge>
  ));

export default Skills;
