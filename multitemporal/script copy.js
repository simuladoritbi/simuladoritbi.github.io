// Mapeamento de IDs para Nomes
function fetchNivelData(url, nivelMap) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                var id = feature.id.split('.')[1]; // Extrai o ID numérico da feature
                var descricao = feature.properties.descricao || 'Descrição não disponível';
                nivelMap[id] = descricao; // Adiciona a descrição no mapa de nível
            });
        })
        .catch(error => console.error('Erro ao buscar dados de nível:', error));
}
// URLs para buscar os dados dos níveis
var nivel1Url = 'http://192.168.0.112:8080/geoserver/modelagem_estilo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_1&outputFormat=application%2Fjson';
var nivel2Url = 'http://192.168.0.112:8080/geoserver/modelagem_estilo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_2&outputFormat=application%2Fjson';
var nivel3Url = 'http://192.168.0.112:8080/geoserver/modelagem_estilo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_3&outputFormat=application%2Fjson';
var currentCQLFilter = ''; // Variável global para armazenar o filtro CQL atual

// Inicializando os mapas de nível
var nivel1Map = {};
var nivel2Map = {};
var nivel3Map = {};

// Buscando dados de cada nível
Promise.all([
    fetchNivelData(nivel1Url, nivel1Map),
    fetchNivelData(nivel2Url, nivel2Map),
    fetchNivelData(nivel3Url, nivel3Map)
]).then(() => {
    console.log('Dados dos níveis carregados com sucesso:', {
        nivel1: nivel1Map,
        nivel2: nivel2Map,
        nivel3: nivel3Map
    });
    // Agora que os dados foram carregados, prossiga com o resto do código
    //carregarDadosDeUsoDoSolo(); // Função que processa os dados do mapa WFS
});
/*

// Inicialização do mapa
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM() // Camada base OSM
        }),
        new ol.layer.Tile({ // Mudamos de ImageLayer para TileLayer
            source: new ol.source.TileWMS({
                url: 'http://192.168.0.112:8080/geoserver/wms',
                params: {
                    'LAYERS': 'modelagem_estilo:uso_ocupacao_v0',
                    'TILED': true, // Ativando tiles
                    'FORMAT': 'image/png' // Garantindo que o formato seja PNG
                },
                serverType: 'geoserver'
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-52.61, -23.734]),
        zoom: 11.25
    })
});
*/
// Camadas de uso e as respectivas datas
var usoLayers = [
    { layerName: 'modelagem_estilo:uso_ocupacao_v0', date: '0' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v1', date: '1' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v2', date: '2' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v3', date: '3' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v4', date: '4' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v5', date: '5' },
    { layerName: 'modelagem_estilo:uso_ocupacao_v6', date: '6' }
];

// Camada de uso do solo inicial
var usoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://192.168.0.112:8080/geoserver/wms',
        params: {
            'LAYERS': usoLayers[0].layerName,
            'TILED': true,
            'FORMAT': 'image/png'
        },
        serverType: 'geoserver'
    })
});

// Inicialização do mapa
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM() // Camada base OSM
        }),
        usoLayer // A camada de uso do solo inicial
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-52.61, -23.734]),
        zoom: 11.25
    })
});
/*
// Função para atualizar o layer com base no slider
function updateLayer(index) {
    var selectedLayer = usoLayers[index];
    usoLayer.getSource().updateParams({
        'LAYERS': selectedLayer.layerName
    });
    document.getElementById('sliderLabel').innerText = `Uso: ${selectedLayer.date}`;
}

// Event listener para o slider
document.getElementById('layerSlider').addEventListener('input', function() {
    var sliderIndex = this.value;
    updateLayer(sliderIndex);
});
*/
function updateLayer(index) {
    var selectedLayer = usoLayers[index];
    
    // Atualiza o layer WMS do mapa, reaplicando o filtro atual
    usoLayer.getSource().updateParams({
        'LAYERS': selectedLayer.layerName,
        'CQL_FILTER': currentCQLFilter // Reaplica o filtro atual, se houver
    });

    // Atualiza o label do slider
    document.getElementById('sliderLabel').innerText = `Uso: ${selectedLayer.date}`;

    // Atualiza os dados WFS e recria os gráficos e tabelas com o filtro atual
    updateWFSData(selectedLayer.layerName, currentCQLFilter);
}




// Lista de propriedades que queremos obter
var propertyNames = [
    'area_ha',
    'fk_tipo_uso_nivel_1_id',
    'fk_tipo_uso_nivel_2_id',
    'fk_tipo_uso_nivel_3_id'
];

// Construção da URL com os parâmetros necessários
var wfsUrl = 'http://192.168.0.112:8080/geoserver/wfs?' +
    'service=WFS&version=1.0.0&request=GetFeature' +
    '&typeName=modelagem_estilo:uso_ocupacao_v0' +
    '&outputFormat=application/json' +
    '&propertyName=' + propertyNames.join(',');

// Função para carregar os dados
fetch(wfsUrl)
    .then(response => response.json())
    .then(data => {
        processData(data);
    });

function processData(data) {
    var levelData = {
        nivel1: {},
        nivel2: {},
        nivel3: {}
    };

    data.features.forEach(feature => {
        var properties = feature.properties;
        var area = properties.area_ha;

        var nivel1Id = properties.fk_tipo_uso_nivel_1_id;
        var nivel2Id = properties.fk_tipo_uso_nivel_2_id;
        var nivel3Id = properties.fk_tipo_uso_nivel_3_id;

        var nivel1Name = nivel1Map[nivel1Id] || 'Desconhecido';
        var nivel2Name = nivel2Map[nivel2Id] || 'Desconhecido';
        var nivel3Name = nivel3Map[nivel3Id] || 'Desconhecido';

        // Agrupamento para o nível 1
        if (!levelData.nivel1[nivel1Name]) {
            levelData.nivel1[nivel1Name] = 0;
        }
        levelData.nivel1[nivel1Name] += area;

        // Agrupamento para o nível 2
        if (!levelData.nivel2[nivel2Name]) {
            levelData.nivel2[nivel2Name] = 0;
        }
        levelData.nivel2[nivel2Name] += area;

        // Agrupamento para o nível 3
        if (!levelData.nivel3[nivel3Name]) {
            levelData.nivel3[nivel3Name] = 0;
        }
        levelData.nivel3[nivel3Name] += area;
    });

    createCharts(levelData);
    createTables(levelData);
}

function createCharts(levelData) {
    Object.keys(levelData).forEach(nivel => {
        var ctx = document.createElement('canvas');
        document.querySelector('.left-panel').appendChild(ctx);

        var labels = Object.keys(levelData[nivel]);
        var dataValues = labels.map(label => levelData[nivel][label]);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: generateColors(labels.length)
                }]
            },
            options: {
                onClick: function(evt, item) {
                    if (item.length > 0) {
                        var index = item[0].index;
                        var selectedLabel = labels[index];
                        filterMap(nivel, selectedLabel);
                    }
                },
                title: {
                    display: true,
                    text: `Distribuição de Área - ${nivel}`
                }
            }
        });
    });
}

function generateColors(num) {
    var colors = [];
    for (var i = 0; i < num; i++) {
        colors.push('hsl(' + (i * 360 / num) + ', 70%, 50%)');
    }
    return colors;
}

function createTables(levelData) {
    Object.keys(levelData).forEach(nivel => {
        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        row.insertCell(0).innerHTML = `<b>${nivel}</b>`;
        row.insertCell(1).innerHTML = `<b>Área (ha)</b>`;
        var body = table.createTBody();

        var labels = Object.keys(levelData[nivel]);
        labels.forEach(label => {
            var row = body.insertRow();
            row.insertCell(0).innerHTML = label;
            row.insertCell(1).innerHTML = levelData[nivel][label].toFixed(2);
        });

        document.querySelector('.right-panel').appendChild(table);
    });
}
/*
function filterMap(nivel, selectedLabel) {
    var propertyName;
    var idMap;

    if (nivel === 'nivel1') {
        propertyName = 'fk_tipo_uso_nivel_1_id';
        idMap = nivel1Map;
    } else if (nivel === 'nivel2') {
        propertyName = 'fk_tipo_uso_nivel_2_id';
        idMap = nivel2Map;
    } else if (nivel === 'nivel3') {
        propertyName = 'fk_tipo_uso_nivel_3_id';
        idMap = nivel3Map;
    }

    // Encontrar o ID correspondente ao nome selecionado
    var selectedId = Object.keys(idMap).find(key => idMap[key] === selectedLabel);

    if (selectedId) {
        var cqlFilter = `${propertyName} = ${selectedId}`;
        var layer = map.getLayers().item(1); // Supondo que a camada WMS está na posição 1
        layer.getSource().updateParams({
            'CQL_FILTER': cqlFilter
        });
    }
}
*/
function filterMap(nivel, selectedLabel) {
    var propertyName;
    var idMap;

    if (nivel === 'nivel1') {
        propertyName = 'fk_tipo_uso_nivel_1_id';
        idMap = nivel1Map;
    } else if (nivel === 'nivel2') {
        propertyName = 'fk_tipo_uso_nivel_2_id';
        idMap = nivel2Map;
    } else if (nivel === 'nivel3') {
        propertyName = 'fk_tipo_uso_nivel_3_id';
        idMap = nivel3Map;
    }

    // Encontrar o ID correspondente ao nome selecionado
    var selectedId = Object.keys(idMap).find(key => idMap[key] === selectedLabel);

    if (selectedId) {
        currentCQLFilter = `${propertyName} = ${selectedId}`; // Atualiza o filtro global

        // Atualiza o layer WMS com o filtro
        var layer = map.getLayers().item(1); // Supondo que a camada WMS está na posição 1
        layer.getSource().updateParams({
            'CQL_FILTER': currentCQLFilter
        });

        // Atualiza os dados WFS com o filtro
        updateFilteredWFSData(currentCQLFilter);
    }
}



function updateFilteredWFSData(cqlFilter) {
    var wfsUrl = 'http://192.168.0.112:8080/geoserver/wfs?' +
        'service=WFS&version=1.0.0&request=GetFeature' +
        '&typeName=' + usoLayer.getSource().getParams().LAYERS + // Camada atual do WFS
        '&outputFormat=application/json' +
        '&propertyName=' + propertyNames.join(',') +
        '&CQL_FILTER=' + encodeURIComponent(cqlFilter); // Aplica o filtro CQL ao WFS

    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            // Limpar gráficos e tabelas anteriores
            clearChartsAndTables();

            // Processar novos dados e recriar gráficos/tabelas
            processData(data);
        })
        .catch(error => console.error('Erro ao buscar dados WFS filtrados:', error));
}



// Função para limpar os gráficos e tabelas
function clearChartsAndTables() {
    // Remove todos os elementos gráficos
    document.querySelector('.left-panel').innerHTML = '';

    // Remove todas as tabelas
    document.querySelector('.right-panel').innerHTML = '';
}
// Event listener para o slider
document.getElementById('layerSlider').addEventListener('input', function() {
    var sliderIndex = this.value;
    updateLayer(sliderIndex); // Atualiza o mapa, gráficos e tabelas
});
// Função para atualizar o layer com base no slider
function updateLayer(index) {
    var selectedLayer = usoLayers[index];
    
    // Atualiza o layer WMS do mapa
    usoLayer.getSource().updateParams({
        'LAYERS': selectedLayer.layerName
    });

    // Atualiza o label do slider
    document.getElementById('sliderLabel').innerText = `Uso: ${selectedLayer.date}`;

    // Atualiza os dados WFS e recria os gráficos e tabelas
    updateWFSData(selectedLayer.layerName);
}

// Função para atualizar os dados WFS e recriar os gráficos/tabelas
function updateWFSData(layerName, cqlFilter = currentCQLFilter) {
    var wfsUrl = 'http://192.168.0.112:8080/geoserver/wfs?' +
        'service=WFS&version=1.0.0&request=GetFeature' +
        '&typeName=' + layerName + // Modificar a camada conforme o slider
        '&outputFormat=application/json' +
        '&propertyName=' + propertyNames.join(',');

    // Aplica o filtro atual, se houver
    if (cqlFilter) {
        wfsUrl += '&CQL_FILTER=' + encodeURIComponent(cqlFilter);
    }

    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            // Limpar gráficos e tabelas anteriores
            clearChartsAndTables();

            // Processar novos dados e recriar gráficos/tabelas
            processData(data);
        });
}
