export const PACKAGE_OPTIONS = ['5bit', '1byte'] as const;
export type PackageOption = typeof PACKAGE_OPTIONS[number];
