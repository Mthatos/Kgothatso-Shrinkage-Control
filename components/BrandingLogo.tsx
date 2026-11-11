import React, { useState } from 'react';
import { APP_LOGO } from '../constants';

interface BrandingLogoProps {
  className?: string;
  imgClassName?: string;
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const OFFICIAL_LOGO_URL = APP_LOGO;

const BrandingLogo: React.FC<BrandingLogoProps> = ({
  className = '',
  imgClassName = 'h-10 md:h-12 w-auto',
  showSubtitle = false,
}) => {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {!loadError ? (
        <img
          src={OFFICIAL_LOGO_URL}
          alt="Kgothatso Shrinkage Control"
          className={`object-contain max-h-16 ${imgClassName} transition-transform duration-200`}
          loading="eager"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center font-black text-white text-lg tracking-wider">
            KSC
          </div>
          <div>
            <div className="font-extrabold text-white text-base leading-tight uppercase tracking-tight">
              Kgothatso
            </div>
            <div className="text-brand-red text-xs font-semibold tracking-wider uppercase">
              Shrinkage Control
            </div>
          </div>
        </div>
      )}
      {showSubtitle && !loadError && (
        <div className="hidden sm:block border-l border-gray-700 pl-3">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold block">
            Inventory & Stocktaking
          </span>
          <span className="text-[10px] text-gray-500 block">
            Loss Prevention Management
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandingLogo;
