function toggleStyles() {
    const isMobile = document.documentElement.clientWidth <= 768;

    // Adiciona uma query string com timestamp para evitar cache
    const timestamp = new Date().getTime();
    // Declara a variável viewportMeta para evitar erros
    let viewportMeta = document.getElementById('viewportMeta');
    // Busca os links para `styles.css` e `styles-mobile.css`
    let mainStyles = document.getElementById('mainStyles');
    let mobileStyles = document.getElementById('mobileStyles');

    // Se é tela de dispositivo móvel, remove `styles.css` e adiciona `styles-mobile.css`
    if (isMobile) {
        
        if (mainStyles) mainStyles.remove();
        if (!mobileStyles) {
            mobileStyles = document.createElement('link');
            mobileStyles.rel = 'stylesheet';
            mobileStyles.href = `styles-mobile.css?ver=${timestamp}`;
            mobileStyles.id = 'mobileStyles';
            document.head.appendChild(mobileStyles);
            const body = document.body;
            body.classList.add('hidden-both-panels');
            body.classList.add('hidden-right-panel');
            body.classList.add('hidden-left-panel');
        }
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            viewportMeta.id = 'viewportMeta';
            document.head.appendChild(viewportMeta);
        }
    } 
    // Se não é móvel, remove `styles-mobile.css` e adiciona `styles.css`
    else {
        if (mobileStyles) mobileStyles.remove();
        if (!mainStyles) {
            mainStyles = document.createElement('link');
            mainStyles.rel = 'stylesheet';
            mainStyles.href = `styles.css?ver=${timestamp}`;
            mainStyles.id = 'mainStyles';
            document.head.appendChild(mainStyles);
        }
        // Remove a meta tag de viewport para permitir o zoom no desktop
        if (viewportMeta) viewportMeta.remove();
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', toggleStyles);

// Monitora redimensionamento para alternar estilos dinamicamente
window.addEventListener('resize', toggleStyles);
