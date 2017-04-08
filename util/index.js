import differenceInYears from 'date-fns/difference_in_years'

import config from '../config'

const { BIRTH_DATE } = config

export const getAge = () => differenceInYears(new Date(), BIRTH_DATE)