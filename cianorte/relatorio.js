let debounceTimer;

// Função de debounce para limitar a frequência de chamadas ao editar o PDF
function debounceEditPdf() {
    // Limpa o timer anterior, caso exista
    clearTimeout(debounceTimer);

    // Inicia um novo timer para chamar `editPdf` após 500ms de inatividade
    debounceTimer = setTimeout(() => {
        editPdf();
    }, 1500); // 500ms de delay após parar de digitar
}

function preencherFormulario(data) {
    if (data && data.features && data.features.length > 0) {
        const imovel = data.features[0].properties; // Pega as propriedades do primeiro resultado
       
        // Preenche os campos do formulário
        document.getElementById('matricula').value = imovel.registro_matricula || '';
        document.getElementById('incra').value = imovel.codigo_incra || '';
        document.getElementById('car').value = imovel.numero_car || '';
        
        // Continue preenchendo os campos que forem necessários
    } else {
        console.error('Nenhuma propriedade encontrada ou dados inválidos.');
    }
}

function updateFilteredWFSData(cqlFilter) {
    var wfsUrl = 'https://plataforma.nacidade.com.br/geoserver/palotina-ctm-3/wfs?' +
        'service=WFS&version=1.0.0&request=GetFeature' +
        '&typeName=' + 'imovel_rural'+ // Camada atual do WFS
        '&outputFormat=application/json' +
        '&CQL_FILTER=' + encodeURIComponent(cqlFilter); // Aplica o filtro CQL ao WFS

    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            preencherFormulario(data); 
            console.log(wfsUrl)
        })
        .catch(error => console.error('Erro ao buscar dados WFS filtrados:', error));
}

function applyWFSFilterById(id) {
    const cqlFilter = `id = '${id}'`;  // Criar o filtro CQL para o campo 'id'
    updateFilteredWFSData(cqlFilter);  // Chamar a função passando o filtro
}

// Quando a página carregar, aplicar o filtro com o amostraId
document.addEventListener('DOMContentLoaded', function() {
    applyWFSFilterById(amostraId);  // Executar a função com o ID da amostra
});


// Remover ou comentar a linha do botão, pois não é mais necessário
// document.getElementById('convertToPDF').addEventListener('click', convertToPDFAndDisplay);

// Função para pegar os parâmetros da URL
function getQueryParams() {
    const params = {};
    window.location.search.substr(1).split("&").forEach(function (item) {
        let pair = item.split("=");
        params[pair[0]] = decodeURIComponent(pair[1]);
    });
    return params;
}

// Função genérica para capturar o valor de um campo pelo ID
function getInputValue(fieldId) {
    const inputElement = document.getElementById(fieldId);
    return inputElement ? inputElement.value : ''; // Verifica se o elemento existe e retorna o valor
}


// Pegar os parâmetros da URL
const queryParams = getQueryParams();
const amostraId = queryParams.id;
const tableData = JSON.parse(queryParams.data);  // Parsear o JSON da tabela
const areaTerreno = queryParams.area.replace('%2C', ','); 

// Exibir o ID da amostra e a área na nova página
document.getElementById('amostraId').textContent = amostraId;
console.log(queryParams)
document.getElementById('areaha').value = areaTerreno;



// Função para carregar o PDF no iframe
function loadPdf(pdfUrl) {
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = pdfUrl;
}

// Função para editar o PDF
async function editPdf() {
    // Buscar o PDF como Uint8Array
    const url = 'documento.pdf'; // Defina o caminho para o seu PDF
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    // Carregar o PDF usando PDF-LIB
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

    // Obter a primeira página do PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    // Obter a altura da página (importante para calcular a coordenada Y)
    const pageHeight = firstPage.getHeight();

    // Pegar o ano atual dinamicamente
    const currentYear = new Date().getFullYear();
    // Incorporar a fonte Times New Roman Bold
    const timesRomanFont = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRomanBold);

    // Adicionar o ano atual no PDF
    firstPage.drawText(currentYear.toString(), {
        x: 205,
        y: pageHeight - 91,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('cadastro'), {
        x: 239,
        y: pageHeight - 138,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('cadastroAnterior'), {
        x: 531,
        y: pageHeight - 133,
        size: 6.2,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('TipoImovel'), {
        x: 388,
        y: pageHeight - 138,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('distrito'), {
        x: 170,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('setor'), {
        x: 210,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('quadraInscricao'), {
        x: 310,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('loteInscricao'), {
        x: 400,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('loteInscricao'), {
        x: 400,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('unidade'), {
        x: 468,
        y: pageHeight - 152,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('quadraFiscal'), {
        x: 304,
        y: pageHeight - 168,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    
    firstPage.drawText(getInputValue('loteFiscal'), {
        x: 383,
        y: pageHeight - 168,
        size: 10.7,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('inscricaoImobiliaria'), {
        x: 414,
        y: pageHeight - 182,
        size: 6.2,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });



    const selectedTableData = getSelectedTableRowData();
    console.log(selectedTableData)
    let valoresArray = selectedTableData.split(', ');

    // Remover "R$" e possíveis espaços adicionais do primeiro valor
    let VTN = valoresArray[0].trim();
    let VV = valoresArray[2].trim();
    let Itbi = valoresArray[3].trim();
    
    // Criar a string concatenada com os valores e os textos fixos
    let resultado = `Valor Venal Territorial: ${VTN}  Valor Venal Imóvel: ${VV}   ITBI: ${Itbi}`;
    
    firstPage.drawText(resultado, {
        x: 80,
        y: pageHeight - 309,
        size: 7.1,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    const timesRomanFontsn = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
    //ok eu sei que isso aqui é uma gambiarra do caralho, mas é o que tem pra hoje
    firstPage.drawText(getInputValue('logradouro'), {
        x: 111,
        y: pageHeight - 195,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('complemento'), {
        x: 115,
        y: pageHeight - 205,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('bairro'), {
        x: 95,
        y: pageHeight - 215,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('loteamento'), {
        x: 110,
        y: pageHeight - 224,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('matricula'), {
        x: 105,
        y: pageHeight - 254,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('cartorio'), {
        x: 103,
        y: pageHeight - 264,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('livro'), {
        x: 93,
        y: pageHeight - 274,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('folha'), {
        x: 93,
        y: pageHeight - 284,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('caucionado'), {
        x: 270,
        y: pageHeight - 254,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });    
    firstPage.drawText(getInputValue('anoAliquotaProgressiva'), {
        x: 309,
        y: pageHeight - 263,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });    
    firstPage.drawText(getInputValue('dataInclusao'), {
        x: 283,
        y: pageHeight - 273,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });    
    firstPage.drawText(getInputValue('dataAlteracao'), {
        x: 287,
        y: pageHeight - 283,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });    
    firstPage.drawText(getInputValue('tipoLote'), {
        x: 271,
        y: pageHeight - 293,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    }); 
    firstPage.drawText(getInputValue('areaha'), {
        x: 450,
        y: pageHeight - 254,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('proprietario'), {
        x: 113,
        y: pageHeight - 347,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('compromissarioPrincipal'), {
        x: 180,
        y: pageHeight - 337,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('cpfCnpj'), {
        x: 110,
        y: pageHeight - 357,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('rg'), {
        x: 251,
        y: pageHeight - 356,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('tipoPessoa'), {
        x: 443,
        y: pageHeight - 356.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('endereco'), {
        x: 104,
        y: pageHeight - 366.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('bairropro'), {
        x: 417,
        y: pageHeight - 376,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('cep'), {
        x: 412,
        y: pageHeight - 386,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('cidade'), {
        x: 97,
        y: pageHeight - 386.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('complementoProprietario'), {
        x: 126,
        y: pageHeight - 376,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('contato'), {
        x: 101,
        y: pageHeight - 396,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('telResidencial'), {
        x: 138,
        y: pageHeight - 405.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('telCelular'), {
        x: 291,
        y: pageHeight - 405.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('telComercial'), {
        x: 456,
        y: pageHeight - 405.5,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    firstPage.drawText(getInputValue('email'), {
        x: 418,
        y: pageHeight - 396,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    let isencao = `${getInputValue('codigoIsencao')}        ${getInputValue('isencao')}`;
    
    firstPage.drawText(isencao, {
        x: 78,
        y: pageHeight - 519,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    let obs = `1         ${getInputValue('observacao')}`;
    
    firstPage.drawText(obs, {
        x: 78,
        y: pageHeight - 559,
        size: 7.1,
        font: timesRomanFontsn,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });

    firstPage.drawText(getInputValue('notasRodape'), {
        x: 100,
        y: pageHeight - 599,
        size: 14,
        font: timesRomanFont,
        color: PDFLib.rgb(0, 0, 0),  // Cor preta
    });
    // Salvar o PDF editado como Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Converter os bytes do PDF em um Blob
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Criar uma URL para o Blob e carregá-lo no iframe
    const pdfUrl = URL.createObjectURL(blob);
    loadPdf(pdfUrl);  // Carregar o PDF editado no iframe
    return pdfBytes; // Retorna os bytes do PDF, caso precise em outra função
}

document.addEventListener('DOMContentLoaded', function() {
    gerarTabelaDinamicamente(); // Gera a tabela uma única vez

    const primeiroRadio = document.querySelector('input[name="exportar"]:checked');
    if (primeiroRadio) {
        marcarLinhaSelecionada(primeiroRadio); // Marca a primeira linha por padrão
    }
});

function gerarTabelaDinamicamente() {
    const tableBody = document.getElementById('simulacoesTable').getElementsByTagName('tbody')[0];
    
    // Limpar o corpo da tabela para evitar duplicação
    tableBody.innerHTML = ''; 

    tableData.forEach((rowData, index) => {
        const row = document.createElement('tr');

        // Criar a célula com o checkbox (radio button)
        const radioCell = document.createElement('td');
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'exportar'; // Todos têm o mesmo nome para garantir que só um pode ser selecionado
        radioInput.value = `linha${index + 1}`;

        // Se for a primeira linha, marcar o radio button como checked por padrão
        if (index === 0) {
            radioInput.checked = true;
        }

        radioCell.appendChild(radioInput);
        row.appendChild(radioCell);

        // Adicionar as outras células da linha
        rowData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        });

        // Inserir a linha na tabela
        tableBody.appendChild(row);
    });

    // Após gerar a tabela, aplicar os eventos
    adicionarEventosRadioButtons();
    editPdf()
}

function marcarLinhaSelecionada(radioInput) {
    // Remover a classe 'linha-selecionada' de todas as linhas
    const linhas = document.querySelectorAll('#simulacoesTable tbody tr');
    linhas.forEach(linha => {
        linha.classList.remove('linha-selecionada');
    });

    // Adicionar a classe 'linha-selecionada' na linha correspondente ao radioInput clicado
    const linhaSelecionada = radioInput.closest('tr');
    linhaSelecionada.classList.add('linha-selecionada');
}

function adicionarEventosRadioButtons() {
    const radios = document.querySelectorAll('input[name="exportar"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            marcarLinhaSelecionada(this);
        });
    });
}

function getSelectedTableRowData() {
    const selectedRadio = document.querySelector('input[name="exportar"]:checked');
    if (selectedRadio) {
        const selectedRow = selectedRadio.closest('tr');
        const cells = selectedRow.getElementsByTagName('td');
        let rowData = [];
        for (let i = 1; i < cells.length; i++) { // Pula o primeiro elemento que é o radio button
            rowData.push(cells[i].textContent.trim());
        }
        return rowData.join(', '); // Retorna os dados da linha como uma string
    }
    return '';
}
// Função para adicionar event listeners a todos os campos com debounce
function addEventListenersToFields() {
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        // Adiciona o debounce apenas para os campos de input e textarea
        field.addEventListener('input', debounceEditPdf);  // Para inputs e textareas
        field.addEventListener('change', editPdf);  // Para selects ou outros campos que têm "change" em vez de "input"
    });
}

// Chamar a função para adicionar os event listeners quando a página carregar
window.onload = addEventListenersToFields;
document.getElementById('exportButton').addEventListener('click', exportarPDF);

async function exportarPDF() {
    // Gera o PDF atualizado
    const pdfBytes = await editPdf();  // Chama a função para garantir o PDF atualizado

    // Converter os bytes do PDF em um Blob
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Criar uma URL para o Blob
    const pdfUrl = URL.createObjectURL(blob);

    // Abrir o PDF em uma nova aba e acionar a impressão
    const newWindow = window.open(pdfUrl);
    if (newWindow) {
        newWindow.addEventListener('load', function () {
            newWindow.print();
        });
    } else {
        console.error('Erro ao abrir a nova janela para impressão.');
    }
}
