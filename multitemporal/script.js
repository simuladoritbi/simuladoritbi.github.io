// Função para buscar os dados de nível com cor
function fetchNivelData(url, nivelMap) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                var id = feature.id.split('.')[1]; // Extrai o ID numérico da feature
                var descricao = feature.properties.descricao || 'Descrição não disponível';
                var color = feature.properties.color || '#000000'; // Adiciona a cor padrão se não houver

                nivelMap[id] = { descricao, color }; // Armazena a descrição e a cor no mapa de nível
            });
            console.log("Mapa de nível preenchido:", nivelMap);
        })
        .catch(error => console.error('Erro ao buscar dados de nível:', error));
}

// URLs para buscar os dados dos níveis
var nivel1Url = 'https://pedromiguez.com.br/geoserver/drz/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_1&outputFormat=application%2Fjson';
var nivel2Url = 'https://pedromiguez.com.br/geoserver/drz/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_2&outputFormat=application%2Fjson';
var nivel3Url = 'https://pedromiguez.com.br/geoserver/drz/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=modelagem_estilo%3Anivel_3&outputFormat=application%2Fjson';
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

// Camadas de uso e as respectivas datas
var usoLayers = [
    { layerName: 'uso_ocupacao_solo_10_12_2022', date: 'Safra 22/23 Verão', orthoLayer: 'imagem_aerea_10_12_2022' },
    { layerName: 'uso_ocupacao_solo_15_07_2023', date: 'Safra 23 Inverno', orthoLayer: 'imagem_aerea_15_07_2023' },
    { layerName: 'uso_ocupacao_solo_17_12_2023', date: 'Safra 23/24 Verão', orthoLayer: 'imagem_aerea_17_12_2023' },
];

// Camada de uso do solo inicial

var orthoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wms',
        params: {
            'LAYERS': usoLayers[0].orthoLayer, // Inicializando com a primeira ortofoto
            'TILED': true,
            'FORMAT': 'image/png'
        },
        serverType: 'geoserver'
    })
});


var usoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wms',
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
        orthoLayer,  // Adicionando a camada ortofoto
        usoLayer     // Adicionando a camada de uso do solo
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-52.61, -23.734]),
        zoom: 11.25
    })
});



// Lista de propriedades que queremos obter
var propertyNames = [
    'area_ha',
    'tipo_n1_uso_ocupacao_solo_id',
    'tipo_n2_uso_ocupacao_solo_id',
    'tipo_n3_uso_ocupacao_solo_id'
];

// Construção da URL com os parâmetros necessários
var wfsUrl = 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wfs?' +
    'service=WFS&version=1.0.0&request=GetFeature' +
    '&typeName=uso_ocupacao_solo_10_12_2022' +
    '&outputFormat=application/json' +
    '&propertyName=' + propertyNames.join(',');

// Função para carregar os dados
fetch(wfsUrl)
    .then(response => response.json())
    .then(data => {
        processData(data);
    });



function createTables(levelData) {
        // Mapeamento para os novos nomes
        const nivelLabels = {
            nivel1: 'Uso do Solo - Nível 1',
            nivel2: 'Uso do Solo - Nível 2',
            nivel3: 'Uso do Solo - Nível 3'
        };
    
        Object.keys(levelData).forEach(nivel => {
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
    
            // Criação do ícone de exportação para CSV usando FontAwesome
            var exportCSVIcon = document.createElement('i');
            exportCSVIcon.classList.add('fas', 'fa-file-csv', 'export-button');
            exportCSVIcon.setAttribute('title', 'Exportar CSV');
            exportCSVIcon.addEventListener('click', function() {
                exportTableToCSV(`${nivelLabels[nivel]}.csv`, table); // Exportar para CSV
            });
    
            // Criação do ícone de exportação para Excel usando FontAwesome
            var exportExcelIcon = document.createElement('i');
            exportExcelIcon.classList.add('fas', 'fa-file-excel', 'export-button');
            exportExcelIcon.setAttribute('title', 'Exportar Excel');
            exportExcelIcon.addEventListener('click', function() {
                exportTableToExcel(`${nivelLabels[nivel]}.xlsx`, table); // Exportar para Excel
            });
    
            // Adiciona o título da tabela e os ícones de exportação
            var cell = row.insertCell(0);
            cell.innerHTML = `<b>${nivelLabels[nivel]}</b>`;
            cell.appendChild(exportCSVIcon); // Anexa o ícone de exportação CSV ao título da tabela
            cell.appendChild(exportExcelIcon); // Anexa o ícone de exportação Excel ao título da tabela
            row.insertCell(1).innerHTML = `<b>Área (ha)</b>`;
            var body = table.createTBody();
    
            // Obtenha as labels e ordene usando localeCompare para suportar acentos
            var labels = Object.keys(levelData[nivel]).sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
    
            // Criação das linhas da tabela com os dados em ordem alfabética
            labels.forEach(label => {
                var row = body.insertRow();
                row.insertCell(0).innerHTML = label;
                row.insertCell(1).innerHTML = levelData[nivel][label].area.toFixed(2);
            });
    
            document.querySelector('.right-panel').appendChild(table);
        });
}
    




function filterMap(nivel, selectedLabel) {
    var propertyName;
    var idMap;

    if (nivel === 'nivel1') {
        propertyName = 'tipo_n1_uso_ocupacao_solo_id';
        idMap = nivel1Map;
    } else if (nivel === 'nivel2') {
        propertyName = 'tipo_n2_uso_ocupacao_solo_id';
        idMap = nivel2Map;
    } else if (nivel === 'nivel3') {
        propertyName = 'tipo_n3_uso_ocupacao_solo_id';
        idMap = nivel3Map;
    }

    // Encontrar o ID correspondente ao nome selecionado
    var selectedId = Object.keys(idMap).find(key => idMap[key].descricao === selectedLabel);

    if (selectedId) {
        currentCQLFilter = `${propertyName} = ${selectedId}`; // Atualiza o filtro global

        // Atualiza o layer WMS com o filtro
        var layer = usoLayer; // Acesse diretamente o usoLayer
        layer.getSource().updateParams({
            'CQL_FILTER': currentCQLFilter
        });

        // Atualiza os dados WFS com o filtro
        updateFilteredWFSData(currentCQLFilter);
    } else {
        console.error(`Nenhum ID encontrado para o label: ${selectedLabel}`);
    }
}




function updateFilteredWFSData(cqlFilter) {
    var wfsUrl = 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wfs?' +
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
    document.querySelector('.chartsContainer').innerHTML = '';

    // Remove todas as tabelas
    document.querySelector('.right-panel').innerHTML = '';
}
// Event listener para o slider
document.getElementById('layerSlider').addEventListener('input', function() {
    var sliderIndex = this.value;
    updateLayer(sliderIndex); // Atualiza o mapa, gráficos e tabelas
});
// Função para atualizar o layer com base no slider


// Função para atualizar os dados WFS e recriar os gráficos/tabelas
function updateWFSData(layerName, cqlFilter = currentCQLFilter) {
    var wfsUrl = 'https://plataforma.nacidade.com.br/geoserver/cianorte-ctm-3/wfs?' +
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

// Adicionando o overlay para o popup
var popup = new ol.Overlay({
    element: document.createElement('div'), // Cria o elemento diretamente
    autoPan: true, // Move o mapa para mostrar o popup completo
    autoPanAnimation: {
        duration: 250,
    },
});
map.addOverlay(popup);

// Função para criar o conteúdo do popup
function createPopupContent(coordinate, properties) {
    // Usando os mapas nivel1Map, nivel2Map, nivel3Map para descrever os níveis
    var nivel1 = nivel1Map[properties.tipo_n1_uso_ocupacao_solo_id] || { descricao: 'Desconhecido', color: '#000000' };
    var nivel2 = nivel2Map[properties.tipo_n2_uso_ocupacao_solo_id] || { descricao: 'Desconhecido', color: '#000000' };
    var nivel3 = nivel3Map[properties.tipo_n3_uso_ocupacao_solo_id] || { descricao: 'Desconhecido', color: '#000000' };
    
    var contentHtml = '<div style="background-color: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">';
    contentHtml += '<h3>Informações da Feição</h3>';

    // Exibindo os níveis com os mapeamentos e cores
    contentHtml += `<p><strong>Nível 1:</strong> <span">${nivel1.descricao}</span></p>`;
    contentHtml += `<p><strong>Nível 2:</strong> <span">${nivel2.descricao}</span></p>`;
    contentHtml += `<p><strong>Nível 3:</strong> <span">${nivel3.descricao}</span></p>`;

    // Exibindo a observação se não for nula
    if (properties.observacao) {
        contentHtml += `<p><strong>Observação:</strong> ${properties.observacao}</p>`;
    }

    contentHtml += '</div>';
    return contentHtml;
}

// Evento de click no mapa para capturar e mostrar informações da feição
map.on('singleclick', function(evt) {
    var viewResolution = map.getView().getResolution();
    var url = usoLayer.getSource().getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857', // Projeção do mapa
        { 'INFO_FORMAT': 'application/json' }
    );

    if (url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    var feature = data.features[0];
                    var properties = feature.properties;

                    // Cria o conteúdo do popup com as propriedades da feição
                    var popupContent = createPopupContent(evt.coordinate, properties);

                    // Define o conteúdo e exibe o popup
                    var popupElement = popup.getElement();
                    popupElement.innerHTML = popupContent;
                    popup.setPosition(evt.coordinate);
                } else {
                    popup.setPosition(undefined); // Remove o popup se não houver feições
                }
            })
            .catch(error => console.error('Erro ao buscar informações da feição:', error));
    }
});
// Função para limpar o filtro
function clearFilter() {
    // Limpa o filtro global
    currentCQLFilter = '';
    
    // Atualiza a camada WMS para remover o filtro
    usoLayer.getSource().updateParams({
        'CQL_FILTER': currentCQLFilter // Remove o filtro
    });

    // Atualiza os gráficos e tabelas sem o filtro aplicado
    updateWFSData(usoLayer.getSource().getParams().LAYERS, currentCQLFilter);
}

// Adiciona o listener para o botão de limpar filtro
document.getElementById('clearFilterButton').addEventListener('click', function() {
    clearFilter(); // Chama a função de limpar o filtro
});

function exportTableToCSV(filename, table) {
    var csv = [];
    var rows = table.querySelectorAll('tr');
    
    // Loop sobre cada linha da tabela
    rows.forEach(function(row) {
        var cols = row.querySelectorAll('td, th');
        var rowData = [];
        
        // Extrai o conteúdo de cada célula
        cols.forEach(function(col) {
            rowData.push(col.innerText);
        });
        
        csv.push(rowData.join(';')); // Concatena os dados da linha com separador de vírgula
    });

    // Cria um Blob com o conteúdo CSV
    var csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    
    // Cria um link temporário para download
    var downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    
    // Adiciona o link ao DOM e clica para iniciar o download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function exportTableToExcel(filename, table) {
    var wb = XLSX.utils.book_new(); // Cria um novo livro de trabalho
    var ws_data = [];

    // Obter todas as linhas da tabela
    var rows = table.querySelectorAll('tr');

    // Extrair os dados de cada linha
    rows.forEach(function(row) {
        var rowData = [];
        var cols = row.querySelectorAll('td, th');

        cols.forEach(function(col) {
            rowData.push(col.innerText); // Pegar o texto de cada célula
        });

        ws_data.push(rowData); // Adicionar a linha ao ws_data
    });

    // Cria a planilha a partir dos dados
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Adiciona a planilha ao livro de trabalho
    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    // Gerar o arquivo .xlsx e iniciar o download
    XLSX.writeFile(wb, filename);
}
// Variável para controlar o estado do swipe
var swipeActive = false;

// Função para ativar/desativar o swipe
function toggleSwipeControl() {
    if (!swipeActive) {
        // Ativar o controle de swipe
        enableSwipeControl();
    } else {
        // Desativar o controle de swipe
        disableSwipeControl();
    }
    swipeActive = !swipeActive; // Alternar o estado
}

// Função para ativar o controle de swipe
function enableSwipeControl() {
    // Definindo o swipe control
    var swipe = new ol.control.Swipe({
        layers: [usoLayer], // A camada que será deslizada
        rightLayer: orthoLayer, // A camada que aparecerá abaixo
        orientation: 'vertical', // Swipe vertical
    });

    // Adiciona o controle de swipe ao mapa
    map.addControl(swipe);

    // Alterar o texto do botão
    document.getElementById('sliderButton').innerText = 'Disable Slider';
}

// Função para desativar o controle de swipe
function disableSwipeControl() {
    // Remover o controle de swipe
    map.getControls().forEach(function(control) {
        if (control instanceof ol.control.Swipe) {
            map.removeControl(control);
        }
    });

    // Alterar o texto do botão
    document.getElementById('sliderButton').innerText = 'Enable Slider';
}
function updateLayer(index) {
    var selectedLayer = usoLayers[index];
    
    if (usoLayer.getSource().getParams().LAYERS !== selectedLayer.layerName) {
        usoLayer.getSource().updateParams({
            'LAYERS': selectedLayer.layerName,
            'CQL_FILTER': currentCQLFilter
        });
        usoLayer.getSource().refresh();
    }
    
    if (orthoLayer.getSource().getParams().LAYERS !== selectedLayer.orthoLayer) {
        orthoLayer.getSource().updateParams({
            'LAYERS': selectedLayer.orthoLayer
        });
        orthoLayer.getSource().refresh();
    }

    document.getElementById('sliderLabel').innerText = selectedLayer.date;
    updateWFSData(selectedLayer.layerName, currentCQLFilter);
}


// Atualizando a criação de gráficos para utilizar cores
function createCharts(levelData) {
    Object.keys(levelData).forEach(nivel => {
        var ctx = document.createElement('canvas');
        document.querySelector('.chartsContainer').appendChild(ctx);

        var labels = Object.keys(levelData[nivel]);
        var dataValues = labels.map(label => levelData[nivel][label].area);
        var backgroundColors = labels.map(label => levelData[nivel][label].color || '#000000'); // Cor associada

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: backgroundColors // Usar cores das feições
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Uso do Solo - Nível ${nivel.slice(-1)}`, // Título formatado
                        padding: {
                            top: 10,
                            bottom: 30
                        },
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        position: 'bottom', // Coloca a legenda abaixo do gráfico
                        labels: {
                            padding: 20
                        }
                    }
                },
                onClick: function(evt, item) {
                    if (item.length > 0) {
                        var index = item[0].index;
                        var selectedLabel = labels[index];
                        console.log("cliclou:", nivel, selectedLabel);
                        filterMap(nivel, selectedLabel);
                    }
                }
            }
        });
    });
}


// Adaptando processData para associar cor às feições
function processData(data) {
    var levelData = {
        nivel1: {},
        nivel2: {},
        nivel3: {}
    };

    data.features.forEach(feature => {
        var properties = feature.properties;
        var area = properties.area_ha;

        var nivel1Id = properties.tipo_n1_uso_ocupacao_solo_id;
        var nivel2Id = properties.tipo_n2_uso_ocupacao_solo_id;
        var nivel3Id = properties.tipo_n3_uso_ocupacao_solo_id;

        var nivel1Name = nivel1Map[nivel1Id]?.descricao || 'Desconhecido';
        var nivel1Color = nivel1Map[nivel1Id]?.color || '#000000';

        var nivel2Name = nivel2Map[nivel2Id]?.descricao || 'Desconhecido';
        var nivel2Color = nivel2Map[nivel2Id]?.color || '#000000';

        var nivel3Name = nivel3Map[nivel3Id]?.descricao || 'Desconhecido';
        var nivel3Color = nivel3Map[nivel3Id]?.color || '#000000';

        // Agrupamento para o nível 1
        if (!levelData.nivel1[nivel1Name]) {
            levelData.nivel1[nivel1Name] = { area: 0, color: nivel1Color };
        }
        levelData.nivel1[nivel1Name].area += area;

        // Agrupamento para o nível 2
        if (!levelData.nivel2[nivel2Name]) {
            levelData.nivel2[nivel2Name] = { area: 0, color: nivel2Color };
        }
        levelData.nivel2[nivel2Name].area += area;

        // Agrupamento para o nível 3
        if (!levelData.nivel3[nivel3Name]) {
            levelData.nivel3[nivel3Name] = { area: 0, color: nivel3Color };
        }
        levelData.nivel3[nivel3Name].area += area;
    });

    createCharts(levelData);
    createTables(levelData);
}
;