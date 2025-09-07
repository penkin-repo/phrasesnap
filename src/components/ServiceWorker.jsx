export const RegisterSW = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Автоматически определяем base path
            const basePath = import.meta.env.BASE_URL;
            const swPath = `${basePath}sw.js`;

            navigator.serviceWorker.register(swPath, {
                scope: basePath
            })
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(error => {
                    console.log('SW registration failed: ', error);
                });
        }
    }, []);

    return null;
};