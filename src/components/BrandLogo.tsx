import { businessConfig } from '@/config/business';

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  const [brand, ...serviceName] = businessConfig.tradingName.split(' ');
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/brand/tpr-mark.svg"
        alt=""
        className="h-10 w-10 shrink-0"
        width="40"
        height="40"
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="whitespace-nowrap text-[15px] tracking-[-0.02em]">
          <span className="font-extrabold text-white">{brand}</span>{' '}
          <span className="font-semibold text-accent-light">{serviceName.join(' ')}</span>
        </span>
        <span className="mt-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.17em] text-text-muted">
          {businessConfig.tagline}
        </span>
      </span>
    </span>
  );
}
