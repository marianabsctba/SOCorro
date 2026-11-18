import type { ModeloAlerta } from '../tipos';
import { N3_TP } from './n3/ataques';
import { N3_RUIDO } from './n3/benignos';

export const ALERTAS_N3: ModeloAlerta[] = [...N3_TP, ...N3_RUIDO];
