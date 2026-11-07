import React, { useState } from 'react';

// Letakkan file logo di: public/logo-msi.png (atau ganti ekstensi di LOGO_SRC)
const LOGO_SRC = '/logo-msi.png';

interface LogoProps {
  /** kelas ukuran, mis. "w-9 h-9" */
  className?: string;
  /** kelas untuk kotak fallback "MSI" bila gambar belum ada */
  fallbackClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-9 h-9',
  fallbackClassName = 'rounded-lg bg-[#0f1b2d] text-white text-[13px] font-bold',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className} ${fallbackClassName} shrink-0 grid place-items-center`}>MSI</div>;
  }
  return (
    <img
      src={LOGO_SRC}
      alt="Logo MSI Group"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 object-contain`}
    />
  );
};
