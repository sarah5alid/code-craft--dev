export const isNotNil = (v) => v !== null && v !== undefined;

export const isAValue = (v) => isNotNil(v) && v !== "";
export const isNil = (v) => v === null || v === undefined;
