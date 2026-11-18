import type { ModeloAlerta } from '../tipos';
import { N2_TP } from './n2/ataques';
import { N2_RUIDO } from './n2/benignos';

export const ALERTAS_N2: ModeloAlerta[] = [...N2_TP, ...N2_RUIDO];
