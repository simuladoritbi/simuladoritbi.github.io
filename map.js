// Defina a URL do servidor WMS para a legenda

// Lucas, se você está lendo isso, saiba que cada gambiarra e POG desse código nasceu da necessidade urgente de fazer esse simulador funcionar "pra ontem". Não foi por escolha, foi pela sobrevivência! :)

const legendUrl = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=39&HEIGHT=30&legend_options=fontSize:14;fontName:Arial;fontAntiAliasing:true;dpi:80;forceLabels:on;hideEmptyRules:false&LAYER=palotina-ctm-3:pgv_rural_imovel';
const legendU2 = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=39&HEIGHT=30&legend_options=fontSize:14;fontName:Arial;fontAntiAliasing:true;dpi:80;forceLabels:on;hideEmptyRules:false&LAYER=palotina-ctm-3:pesquisa_imobiliaria_rural';

// Define as camadas do mapa
const camadaImagemRecente = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms',
        params: {
            'LAYERS': 'imagem_recente',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    })
});

const camadaPGV = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms',
        params: {
            'LAYERS': 'pgv_rural_imovel',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    }),
    opacity: 1  // Define opacidade inicial como 100%
});

// Define a camada amostras_pgvr
const camadaAmostras = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms',
        params: {
            'LAYERS': 'pesquisa_imobiliaria_rural',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    }),
    visible: true  // Inicialmente, a camada está desativada
});


// Cria o mapa e define o centro e o nível de zoom
const map = new ol.Map({
    target: 'map',
    layers: [camadaImagemRecente, camadaPGV,camadaAmostras],
    view: new ol.View({
        center: ol.proj.fromLonLat([-53.84, -24.29]), 
        zoom: 12
    })
});


// Controle para ajustar a opacidade da camada superior
document.getElementById('opacitySlider').addEventListener('input', (event) => {
    const opacity = parseFloat(event.target.value);
    camadaPGV.setOpacity(opacity);
});

// Exibir a legenda na barra lateral esquerda
document.getElementById('layerLegend').src = legendUrl;
document.getElementById('layerLegend2').src = legendU2;

// URL base para GetFeatureInfo
const featureInfoUrl = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms';

// Função para capturar feição ao clicar no mapa
map.on('singleclick', async function (event) {
    const viewResolution = map.getView().getResolution();

    // Verifica se o clique foi na camada valores_reg_final
    const urlPGV = camadaPGV.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        'EPSG:3857',
        {
            'INFO_FORMAT': 'application/json',
            'QUERY_LAYERS': 'pgv_rural_imovel'
        }
    );

    // Verifica se o clique foi na camada amostras_pgvr
    const urlAmostras = camadaAmostras.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        'EPSG:3857',
        {
            'INFO_FORMAT': 'application/json',
            'QUERY_LAYERS': 'pesquisa_imobiliaria_rural'
        }
    );

    // Se clicou em valores_reg_final, executa a função populateTableWithFeatureInfo
    if (urlPGV) {
        try {
            const response = await fetch(urlPGV);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const featureInfo = data.features[0].properties;
                const featureId = data.features[0].id;
                const idNumber = featureId.split('.')[1];  // Pega o número após o ponto
                // Agora você tem o número do ID armazenado em idNumber
                console.log("ID da feição (número):", idNumber);
                // Chama a função para popular a barra lateral com os dados da feição
                console.log(featureInfo);
                populateTableWithFeatureInfo(featureInfo,idNumber);
            } else {
                console.log("Nenhuma feição encontrada na camada valores_reg_final.");
            }
        } catch (error) {
            console.error("Erro ao obter dados da feição (valores_reg_final):", error);
        }
    }

    // Se clicou em amostras_pgvr, executa outra ação (ex: mostrar uma mensagem)
    if (urlAmostras) {
        try {
            const response = await fetch(urlAmostras);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const featureInfo = data.features[0].properties;

                // Chama a função ou executa uma ação para amostras_pgvr
                console.log(featureInfo);
                showAmostraPanel(featureInfo);
            } else {
                console.log("Nenhuma feição encontrada na camada amostras_pgvr.");
            }
        } catch (error) {
            console.error("Erro ao obter dados da feição (amostras_pgvr):", error);
        }
    }
});

// Controle de visibilidade da camada com checkbox
document.getElementById('amostrasCheckbox').addEventListener('change', function () {
    camadaAmostras.setVisible(this.checked);
});