import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kisanmitra_android_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Check standalone mode (PWA installed and running outside of browser tab)
  const checkStandaloneStatus = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidStandalone = document.referrer.includes('android-app://');
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: minimal-ui)').matches;

    return isDisplayModeStandalone || isIOSStandalone || isAndroidStandalone || isFullscreen;
  }, []);

  useEffect(() => {
    // 1. Check standalone status
    const standalone = checkStandaloneStatus();
    setIsInstalled(standalone);

    // 2. Detect User Agent and Platform
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isAndroidDevice = /android/.test(userAgent);
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 840;
    const isMobileDevice = isAndroidDevice || isIOSDevice || /mobile|tablet/.test(userAgent) || isMobileViewport;

    setIsAndroid(isAndroidDevice);
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);

    // 3. Service Worker detection and readiness
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg) {
            setIsServiceWorkerReady(true);
          }
        })
        .catch(() => {
          setIsServiceWorkerReady(false);
        });

      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerReady(true);
      }
    }

    // 4. Listen for BeforeInstallPromptEvent (Chromium / Android native install trigger)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Listen for AppInstalledEvent
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // 6. Listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [checkStandaloneStatus]);

  // Trigger the native browser install prompt
  const promptInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    return false;
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem('kisanmitra_android_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const resetBannerDismiss = () => {
    setIsBannerDismissed(false);
    try {
      sessionStorage.removeItem('kisanmitra_android_banner_dismissed');
    } catch {
      // ignore
    }
  };

  // Conditions for Android Banner:
  // Must detect Android (or mobile emulation) and ABSENCE of standalone mode (!isInstalled)
  const shouldShowAndroidBanner = !isInstalled && (isAndroid || isMobile) && !isBannerDismissed;

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isStandalone: isInstalled,
    isAndroid,
    isIOS,
    isMobile,
    isServiceWorkerReady,
    shouldShowAndroidBanner,
    isBannerDismissed,
    dismissBanner,
    resetBannerDismiss,
    promptInstall,
    hasDeferredPrompt: !!deferredPrompt,
  };
}
