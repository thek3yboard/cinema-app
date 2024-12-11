"use client"

import { useEffect } from 'react'

export function PWARegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                        console.log('Registro de Service Worker satisfactorio con scope: ', registration.scope);
                    },
                    function(err) {
                        console.log('Registro de Service Worker fallido: ', err);
                    }
                );
            });
        }
    }, [])

    return null
}