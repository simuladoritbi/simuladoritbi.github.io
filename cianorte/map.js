
// Lucas, se você está lendo isso, saiba que cada gambiarra e POG desse código nasceu da necessidade urgente de fazer esse simulador funcionar "pra ontem". Não foi por escolha, foi pela sobrevivência! :)




const legendUrl = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=39&HEIGHT=30&legend_options=fontSize:14;fontName:Arial;fontAntiAliasing:true;dpi:80;forceLabels:on;hideEmptyRules:false&LAYER=palotina-ctm-3:pgv_rural_imovel';
const legendU2 = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=39&HEIGHT=30&legend_options=fontSize:14;fontName:Arial;fontAntiAliasing:true;dpi:80;forceLabels:on;hideEmptyRules:false&LAYER=palotina-ctm-3:pesquisa_imobiliaria_rural';
const legendU3 = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=39&HEIGHT=30&legend_options=fontSize:14;fontName:Arial;fontAntiAliasing:true;dpi:80;forceLabels:on;hideEmptyRules:false&LAYER=palotina-ctm-3:perimetro_urbano';


function isMobileDevice() {
    return document.documentElement.clientWidth <= 768;
}

var highlightedFeatureLayer = null;

const camadaOpenStreetMap = new ol.layer.Tile({
    source: new ol.source.OSM({
        attributions: [] // Remove a atribuição de copyright
    })
});

// Define as camadas do mapa
const camadaImagemRecente = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wms',
        params: {
            'LAYERS': 'imagem_recente',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    })
});

const camadaPGV = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://pedromiguez.com.br/geoserver/wms',
        params: {
            'LAYERS': '	drz:pgv_rural_imovel',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    }),
    opacity: 1  // Define opacidade inicial como 100%
});

// Define a camada amostras_pgvr
const camadaAmostras = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://pedromiguez.com.br/geoserver/wms',
        params: {
            'LAYERS': '	drz:pesquisa_imobiliaria_rural',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    }),
    visible: true  // Inicialmente, a camada está ativada
});

const perimetro = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wms',
        params: {
            'LAYERS': 'perimetro_urbano',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
        }
    }),
    visible: true  // Inicialmente, a camada está ativada
});


// Cria o mapa e define o centro e o nível de zoom
const map = new ol.Map({
    target: 'map',
    layers: [camadaOpenStreetMap, camadaImagemRecente, camadaPGV, camadaAmostras,perimetro],
    view: new ol.View({
        center: ol.proj.fromLonLat([-52.62051, -23.73390]),
        zoom: 11.3
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
document.getElementById('layerLegend3').src = legendU3;

// URL base para GetFeatureInfo
const featureInfoUrl = 'https://pedromiguez.com.br/geoserver/wms';

// Função para capturar feição ao clicar no mapa
map.on('singleclick', async function (event) {
    const viewResolution = map.getView().getResolution();
    console.log(map.getView())



    // Verifica se o clique foi na camada amostras_pgvr
    const urlAmostras = camadaAmostras.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        'EPSG:3857',
        {
            'INFO_FORMAT': 'application/json',
            'QUERY_LAYERS': 'drz:pesquisa_imobiliaria_rural'
        }
    );

    if (urlAmostras) {
        try {
            const response = await fetch(urlAmostras);
            const data = await response.json();
    
            if (data.features && data.features.length > 0) {
                const featureInfo = data.features[0].properties;
                console.log(featureInfo);
                showAmostraPanel(featureInfo);
    
                if (data.features[0].geometry) {
                    const format = new ol.format.GeoJSON();
                    const feature = format.readFeature(data.features[0], {
                        dataProjection: 'EPSG:31982',
                        featureProjection: map.getView().getProjection()
                    });
                    const extent = feature.getGeometry().getExtent();
                    console.log(extent)
                    const clickedCoordinates = event.coordinate;
                    // Fiz uma POG Enorme aqui, quando clicava na pgv e depois da amostra ele mandava no meio do oceano, depois de muito tentar arrumar do modo correto e não conseguir fiz isso
                    if (Math.abs(extent[0]) > 6207374 ) {
                        console.log("Coordenadas inválidas. Centralizando no ponto de clique.");
                        map.getView().animate({
                            center: clickedCoordinates,
                            zoom: 16,
                            duration: 1000
                        });
                    } else {
                        console.log("Coordenadas válidas para a feição.");
                        map.getView().fit(extent, {
                            duration: 1000,
                            maxZoom: 17,
                            padding: [50, 50, 50, 50]
                        });
                    }
                } else {
                    console.log("A geometria da feição não está disponível.");
                }
                // Adicione o setTimeout para abrir o painel direito apenas no mobile
                if (isMobileDevice()) {
                    setTimeout(() => openRightPanel(), 1500); // Atraso de 2 segundos no mobile
                } else {
                    openRightPanel(); // Abre imediatamente no desktop
                }

                return;
            } else {
                console.log("Nenhuma feição encontrada na camada amostras_pgvr.");
            }
        } catch (error) {
            console.error("Erro ao obter dados da feição (amostras_pgvr):", error);
        }
    }
    

    // Verifica se o clique foi na camada camadaPGV
    const urlPGV = camadaPGV.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        'EPSG:3857',
        {
            'INFO_FORMAT': 'application/json',
            'QUERY_LAYERS': 'drz:pgv_rural_imovel',
            'FEATURE_COUNT': 1
        }
    );

    if (urlPGV) {
        try {
            const response = await fetch(urlPGV);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const featureInfo = data.features[0].properties;
                const featureId = data.features[0].id;
                const idNumber = featureId.split('.')[1]; // Obtém o número após o ponto
                console.log("ID da feição (número):", idNumber);
                console.log(featureInfo);

                // Chama a função para popular a barra lateral com os dados da feição (se necessário)
                populateTableWithFeatureInfo(featureInfo, idNumber);

                // Agora, fazemos uma solicitação WFS GetFeature para obter a geometria completa
                const wfsUrl = 'https://pedromiguez.com.br/geoserver/ows';
                const wfsParams = new URLSearchParams({
                    'service': 'WFS',
                    'version': '1.0.0',
                    'request': 'GetFeature',
                    'typeName': 'drz:pgv_rural_imovel',
                    'outputFormat': 'application/json',
                    'featureID': 'pgv_rural_imovel.' + idNumber // Ajuste o prefixo conforme necessário
                });

                const fullWfsUrl = wfsUrl + '?' + wfsParams.toString();

                const wfsResponse = await fetch(fullWfsUrl);
                const wfsData = await wfsResponse.json();

                if (wfsData.features && wfsData.features.length > 0) {
                    // Obtém a feição com geometria
                    const wfsFeature = wfsData.features[0];

                    // Cria uma feição a partir da geometria
                    var format = new ol.format.GeoJSON();

                    // Registra a projeção EPSG:31982 (SIRGAS 2000 / UTM zone 22S)
                    proj4.defs('EPSG:31982', '+proj=utm +zone=22 +south +datum=SIRGAS2000 +units=m +no_defs');
                    ol.proj.proj4.register(proj4);

                    var feature = format.readFeature(wfsFeature, {
                        dataProjection: 'EPSG:31982', // Projeção da geometria original
                        featureProjection: map.getView().getProjection() // Projeção do mapa (EPSG:3857)
                    });

                    // Define o estilo com preenchimento hachurado
                    var canvas = document.createElement('canvas');
                    canvas.width = canvas.height = 8;
                    var context = canvas.getContext('2d');

                    // Desenha o padrão hachurado
                    context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(8, 8);
                    context.stroke();
                    context.beginPath();
                    context.moveTo(8, 0);
                    context.lineTo(0, 8);
                    context.stroke();

                    // Cria o padrão de preenchimento
                    var pattern = context.createPattern(canvas, 'repeat');

                    // Define o estilo para destacar a feição com contorno vermelho e preenchimento hachurado
                    var highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'red',
                            width: 3
                        }),
                        fill: new ol.style.Fill({
                            color: pattern
                        })
                    });

                    // Cria uma camada vetorial com a feição destacada
                    var vectorLayer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: [feature]
                        }),
                        style: highlightStyle
                    });

                    // Remove a feição destacada anterior, se existir
                    if (highlightedFeatureLayer) {
                        map.removeLayer(highlightedFeatureLayer);
                    }

                    // Adiciona a nova camada de destaque ao mapa
                    highlightedFeatureLayer = vectorLayer;
                    map.addLayer(vectorLayer);

                    // Atualiza a camadaPGV para excluir a feição selecionada
                    var source = camadaPGV.getSource();

                    // Ajuste 'id' para corresponder ao nome da propriedade no seu conjunto de dados
                    var cqlFilter = 'id <> ' + idNumber; // Use aspas se o ID for string: 'id <> \'' + idNumber + '\''

                    // Atualiza os parâmetros da fonte
                    source.updateParams({
                        'CQL_FILTER': cqlFilter
                    });

                    // Centraliza e dá zoom na feição selecionada
                    // Centraliza e dá zoom na feição selecionada com um fator de expansão
                    var extent = feature.getGeometry().getExtent();
                    console.log(extent);
                    map.getView().fit(extent, { 
                        duration: 1000,   // Duração da animação de zoom em milissegundos
                        maxZoom: 17,      // Define um zoom máximo (mais longe que antes)
                        padding: [50, 50, 50, 50] // Adiciona um "acolchoamento" ao redor da feição (topo, direita, inferior, esquerda)
                    });
                    // Adicione o setTimeout para abrir o painel direito apenas no mobile
                if (isMobileDevice()) {
                    setTimeout(() => openRightPanel(), 1500); // Atraso de 2 segundos no mobile
                } else {
                    openRightPanel(); // Abre imediatamente no desktop
                }

                } else {
                    console.log("Não foi possível obter a geometria da feição via WFS.");

                    // Remove o destaque e o filtro se nenhuma feição for encontrada
                    if (highlightedFeatureLayer) {
                        map.removeLayer(highlightedFeatureLayer);
                        highlightedFeatureLayer = null;
                    }
                    camadaPGV.getSource().updateParams({ 'CQL_FILTER': null });
                }
            }
        } catch (error) {
            console.error("Erro ao obter dados da feição (pgv_rural_imovel):", error);
        }
    }

});

// Controle de visibilidade da camada com checkbox
document.getElementById('amostrasCheckbox').addEventListener('change', function () {
    camadaAmostras.setVisible(this.checked);
});

// Controle de visibilidade da camada com checkbox
document.getElementById('perimetroCheckbox').addEventListener('change', function () {
    perimetro.setVisible(this.checked);
});
/*
function toggleLeftPanel() {
    const body = document.body;

    if (body.classList.contains('hidden-left-panel') && body.classList.contains('hidden-both-panels')) {
        // Ambos os painéis estão ocultos, mas reabre o painel esquerdo
        body.classList.remove('hidden-both-panels');
    }
    
    if (body.classList.contains('hidden-left-panel')) {
        // Se o painel esquerdo estiver oculto, mostre-o
        body.classList.remove('hidden-left-panel');
    } else {
        // Caso contrário, oculte-o
        body.classList.add('hidden-left-panel');
    }

    // Atualiza para ambos ocultos se necessário
    if (body.classList.contains('hidden-left-panel') && body.classList.contains('hidden-right-panel')) {
        body.classList.add('hidden-both-panels');
    }
}
*/
function toggleLeftPanel() {
    const body = document.body;

    if (body.classList.contains('hidden-left-panel')) {
        // Mostrar o painel esquerdo
        body.classList.remove('hidden-left-panel');

        // No mobile, fechar o painel direito ao abrir o esquerdo
        if (isMobileDevice()) {
            body.classList.add('hidden-right-panel');
        }
    } else {
        // Ocultar o painel esquerdo
        body.classList.add('hidden-left-panel');
    }

    // Atualizar classe para ambos ocultos se necessário
    if (body.classList.contains('hidden-left-panel') && body.classList.contains('hidden-right-panel')) {
        body.classList.add('hidden-both-panels');
    } else {
        body.classList.remove('hidden-both-panels');
    }
}
/*
function toggleRightPanel() {
    const body = document.body;

    if (body.classList.contains('hidden-right-panel') && body.classList.contains('hidden-both-panels')) {
        // Ambos os painéis estão ocultos, mas reabre o painel direito
        body.classList.remove('hidden-both-panels');
    }

    if (body.classList.contains('hidden-right-panel')) {
        // Se o painel direito estiver oculto, mostre-o
        body.classList.remove('hidden-right-panel');
    } else {
        // Caso contrário, oculte-o
        body.classList.add('hidden-right-panel');
    }

    // Atualiza para ambos ocultos se necessário
    if (body.classList.contains('hidden-left-panel') && body.classList.contains('hidden-right-panel')) {
        body.classList.add('hidden-both-panels');
    }
}
*/

function toggleRightPanel() {
    const body = document.body;

    if (body.classList.contains('hidden-right-panel')) {
        // Mostrar o painel direito
        body.classList.remove('hidden-right-panel');

        // No mobile, fechar o painel esquerdo ao abrir o direito
        if (isMobileDevice()) {
            body.classList.add('hidden-left-panel');
        }
    } else {
        // Ocultar o painel direito
        body.classList.add('hidden-right-panel');
    }

    // Atualizar classe para ambos ocultos se necessário
    if (body.classList.contains('hidden-left-panel') && body.classList.contains('hidden-right-panel')) {
        body.classList.add('hidden-both-panels');
    } else {
        body.classList.remove('hidden-both-panels');
    }
}

function openRightPanel() {
    const body = document.body;
    
    // Remove a classe que oculta o painel direito, se estiver presente
    body.classList.remove('hidden-right-panel');

    if (isMobileDevice()) {
        body.classList.add('hidden-left-panel');
    }

    // Caso ambos os painéis estivessem ocultos, remova a classe de ambos ocultos
    body.classList.remove('hidden-both-panels');
}
