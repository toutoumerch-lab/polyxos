import { useSiteLogo } from '../hooks/useSiteLogo';

interface LogoProps {
  /** Show the "Polyxos" wordmark next to the default badge. Default: true. */
  showWordmark?: boolean;
  /** Tailwind size classes for the default "P" badge. Default: 'w-9 h-9'. */
  badgeClassName?: string;
  /** Tailwind text-size class for the wordmark. Default: 'text-xl'. */
  wordmarkClassName?: string;
  /** Tailwind height class used when a custom uploaded logo is shown. Default: 'h-9'. */
  imgHeightClassName?: string;
  className?: string;
}

/**
 * The Polyxos brand logo. If the admin has uploaded a custom logo it renders
 * that image; otherwise it falls back to the default gradient "P" badge plus
 * the "Polyxos" wordmark. Shared across the navbar, footer and admin dashboard.
 */
export default function Logo({
  showWordmark = true,
  badgeClassName = 'w-9 h-9',
  wordmarkClassName = 'text-xl',
  imgHeightClassName = 'h-9',
  className = '',
}: LogoProps) {
  const { logo } = useSiteLogo();

  if (logo) {
    return (
      <span className={`flex items-center ${className}`}>
        <img
          src={logo}
          alt="Polyxos"
          className={`${imgHeightClassName} w-auto max-w-[200px] object-contain`}
        />
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-3 group ${className}`}>
      <span className={`relative ${badgeClassName}`}>
        <span className="absolute inset-0 rounded-lg gradient-bg opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold font-display text-lg leading-none">
          P
        </span>
        <span className="absolute -inset-1 rounded-xl gradient-bg opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300" />
      </span>
      {showWordmark && (
        <span className={`font-display ${wordmarkClassName} font-bold tracking-wide text-fg`}>
          Poly<span className="gradient-text">xos</span>
        </span>
      )}
    </span>
  );
}
