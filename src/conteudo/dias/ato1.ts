// Ato 1: N1 no SOC Alfa, Curitiba (dias 1 a 30).
import type { Dia } from '../tipos';
import { DIAS_01_07 } from './ato1/dias01a07';
import { DIAS_08_14 } from './ato1/dias08a14';
import { DIAS_15_21 } from './ato1/dias15a21';
import { DIAS_22_30 } from './ato1/dias22a30';
import { misturarOpcoes } from './ato1/comum';

export const ATO1: Dia[] = misturarOpcoes([...DIAS_01_07, ...DIAS_08_14, ...DIAS_15_21, ...DIAS_22_30]);
