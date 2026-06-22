'use client';
import React, { useEffect } from 'react';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { Uniwind } from 'uniwind';

export function GluestackUIProvider({
  ...props
}: {
  children?: React.ReactNode;
}) {
  useEffect(() => {
    Uniwind.setTheme('light');
  }, []);

  return (
    <OverlayProvider>
      <ToastProvider>{props.children}</ToastProvider>
    </OverlayProvider>
  );
}
