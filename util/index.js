import differenceInYears from "date-fns/difference_in_years";

import config from "../config";

const { BIRTH_DATE, CAREER_START_DATE, PROGRAMMING_START_DATE } = config;

export const getAge = () => differenceInYears(new Date(), BIRTH_DATE);
export const getTotalExp = () =>
  differenceInYears(new Date(), CAREER_START_DATE);
export const getProgrammingExp = () =>
  differenceInYears(new Date(), PROGRAMMING_START_DATE);
