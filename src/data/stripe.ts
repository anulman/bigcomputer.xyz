export const DEFAULT_KEY = process.env.STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const PACKAGE_OPTIONS = ['5bit', '1byte'] as const;
export type PackageOption = typeof PACKAGE_OPTIONS[number];

const isProduction = process.env.NODE_ENV === 'production' &&
  (process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production');

export const PACKAGE_PRODUCTS = {
  '5bit': isProduction ? 'prod_MFFsTx3O4aVXQ2' : 'prod_MFGDlPRdBivX3D',
  '1byte': isProduction ? 'prod_MFFtfTEy1dOT1h' : 'prod_MFGCyTa8kxreCM',
} as const;

type PackageConfig<Opt extends PackageOption> =
  Record<Opt, Readonly<{ label: React.ReactNode; price: number; id: typeof PACKAGE_PRODUCTS[Opt] }>>;

export const PACKAGE_CONFIGS: Readonly<PackageConfig<PackageOption>> = Object.freeze({
  '5bit': {
    label: '5-bit',
    price: 3200,
    id: isProduction ? 'prod_MFFsTx3O4aVXQ2' : 'prod_MFGDlPRdBivX3D',
  },
  '1byte': {
    label: '1-byte',
    price: 25600,
    id: isProduction ? 'prod_MFFtfTEy1dOT1h' : 'prod_MFGCyTa8kxreCM',
  },
} as const);

export const DEFAULT_PACKAGE = '5bit';
