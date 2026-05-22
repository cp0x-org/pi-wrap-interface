import { Link as RouterLink } from 'react-router-dom';
import { ReactComponent as Cp0xLogo } from '@/assets/images/cp0x-logo.svg';
import unwrapLogo from '@/assets/images/unwrap-logo.png';
import Link from '@mui/material/Link';

import { DASHBOARD_PATH } from 'config';

export default function LogoSection() {
  return (
    <Link
      component={RouterLink}
      to={DASHBOARD_PATH}
      aria-label="theme-logo"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        textDecoration: 'none'
      }}
    >
      <Cp0xLogo style={{ width: 50, height: 30 }} />
      <img src={unwrapLogo} alt="unwrap" style={{ width: 50, height: 'auto', display: 'block' }} />
    </Link>
  );
}
