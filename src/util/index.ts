import { differenceInYears } from "date-fns/differenceInYears";
import { parse as parseDate } from "date-fns/parse";

import config from "../config";

const { BIRTH_DATE, CAREER_START_DATE, PROGRAMMING_START_DATE } = config;

const yearsSince = (date: string) =>
  differenceInYears(new Date(), parseDate(date, "yyyyy-MM-dd", new Date()));

export const getAge = () => yearsSince(BIRTH_DATE);
export const getTotalExp = () => yearsSince(CAREER_START_DATE);
export const getProgrammingExp = () => yearsSince(PROGRAMMING_START_DATE);
