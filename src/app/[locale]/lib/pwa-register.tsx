"use client"

import { useEffect } from 'react'

export function PWARegister() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    updateViaCache: 'none'
                });
                await registration.update();
            } catch {
                // PWA support is optional and must not affect the application.
            }
        };

        if (document.readyState === 'complete') {
            void registerServiceWorker();
            return;
        }

        window.addEventListener('load', registerServiceWorker, { once: true });
        return () => window.removeEventListener('load', registerServiceWorker);
    }, [])

    return null
}
