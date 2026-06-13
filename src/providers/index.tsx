import React from 'react';
import { ThemeCustomizerProvider } from '@/contexts/theme-customizer';
import { SystemNotificationsProvider } from '@/contexts/system-notifications';
import { ThemeProvider } from '@/providers/theme';
import { DirectionProvider } from '@mantine/core';
import { assetUrl } from '@/lib/basePath';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <DirectionProvider>
      <SystemNotificationsProvider announcementsUrl={assetUrl('/system-announcements.json')}>
        <ThemeCustomizerProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ThemeCustomizerProvider>
      </SystemNotificationsProvider>
    </DirectionProvider>
  );
};
