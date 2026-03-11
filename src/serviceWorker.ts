/**
 * Service Worker 註冊與自動更新邏輯
 * 旨在解決開發環境衝突與生產環境緩存不更新問題
 */

export function registerServiceWorker() {
    if (typeof window === 'undefined') return;

    // 如果是 localhost，主動註銷所有 Service Worker 避免 Vite HMR 衝突
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]'
    ) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    registration.unregister().then(() => {
                        console.log(' [SW] Localhost detected: Unregistered existing Service Worker to avoid conflicts.');
                    });
                }
            });
        }
        return;
    }

    // 生產環境註冊
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = './sw.js'; // 修正為相對路徑以支援 GitHub Pages 子目錄

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log(' [SW] Registered successfully:', registration.scope);

                    // 監聽更新
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // 新版本已安裝且正在等待，提示使用者或自動更新
                                    console.log(' [SW] New content is available; please refresh.');
                                    // 這裡可以選擇自動重新整理，或者跳出 Toast
                                    if (confirm('發現新版本的遊戲內容，是否立即更新？')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error(' [SW] Registration failed:', error);
                });
        });

        // 確保 controller 變動時重新整理（當 skipWaiting 執行後）
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}
