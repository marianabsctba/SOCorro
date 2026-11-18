import type { ModeloAlerta } from '../tipos';
import { N1_FP } from './n1/ruido';
import { N1_BP } from './n1/benignos';
import { N1_TP } from './n1/verdadeiros';

// Fila de N1: maioria de falso positivo e benigno, como na vida real.
export const ALERTAS_N1: ModeloAlerta[] = [...N1_FP, ...N1_BP, ...N1_TP];
