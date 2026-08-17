import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// material-ui
import { Box, IconButton, Drawer, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import { IconMenu2, IconX } from '@tabler/icons-react';

// types
interface MobileMenuItemProps {
  /** Translation id of the visible menu label. */
  titleId: string;
  path?: string;
  isExternal?: boolean;
}

const MobileMenu = () => {
  const theme = useTheme();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems: MobileMenuItemProps[] = [
    {
      titleId: 'nav.home',
      path: '/',
      isExternal: false
    },
    {
      titleId: 'nav.permissionlessInterfaces',
      path: 'https://pi.cp0x.com',
      isExternal: false
    },
    {
      titleId: 'nav.referrals',
      path: 'https://cp0x.com',
      isExternal: true
    }
  ];

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <IconButton
        color="inherit"
        onClick={handleToggleDrawer}
        edge="start"
        size="large"
        aria-label={intl.formatMessage({ id: 'nav.menu.open.aria' })}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconMenu2 aria-hidden="true" />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleToggleDrawer}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'mobile-menu-title',
          sx: {
            width: '280px',
            background: theme.palette.background.default
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography id="mobile-menu-title" component="h2" variant="h6">
            {intl.formatMessage({ id: 'nav.menu.title' })}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleToggleDrawer}
            edge="end"
            size="small"
            aria-label={intl.formatMessage({ id: 'nav.menu.close.aria' })}
          >
            <IconX aria-hidden="true" />
          </IconButton>
        </Box>

        <List component="nav" aria-label={intl.formatMessage({ id: 'nav.main.aria' })} sx={{ px: 2, pt: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.titleId}>
              {item.isExternal ? (
                <ListItemButton component="a" href={item.path} target="_blank" rel="noopener noreferrer" onClick={handleToggleDrawer}>
                  <ListItemText primary={intl.formatMessage({ id: item.titleId })} />
                </ListItemButton>
              ) : (
                <ListItemButton
                  component={RouterLink}
                  to={item.path || '#'}
                  aria-current={item.path === pathname ? 'page' : undefined}
                  onClick={handleToggleDrawer}
                >
                  <ListItemText primary={intl.formatMessage({ id: item.titleId })} />
                </ListItemButton>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default MobileMenu;
