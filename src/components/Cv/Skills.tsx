import type React from "react";

import { Badge } from "reactstrap";

import list from "./skillsList";

const flatList = list.flatMap(({ skills, type, label }) =>
  skills.map((skill) => ({ skill, type, label })),
);

const Skills: React.FC = () =>
  flatList.map(({ skill, label }, i) => (
    <Badge key={i} color={label}>
      {skill}
    </Badge>
  ));

export default Skills;
