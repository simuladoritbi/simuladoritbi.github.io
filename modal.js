
// Lucas, se você está lendo isso, saiba que cada gambiarra e POG desse código nasceu da necessidade urgente de fazer esse simulador funcionar "pra ontem". Não foi por escolha, foi pela sobrevivência! :)

let isTableModified = false;
let i_urbano = 1;
let i_pasto = 1;
let i_cultura = 1;
let id_imovel = 0;


function populateSimuladorPanel(featureInfo) { 
    // Configuração dos campos existentes
    document.getElementById("areaTerreno").value = 
    (featureInfo.imovel_rural_area_ha_registrada && featureInfo.imovel_rural_area_ha_registrada.toFixed(4).replace('.', ',')) || 
    (featureInfo.imovel_rural_area_ha_imagem && featureInfo.imovel_rural_area_ha_imagem.toFixed(4).replace('.', ',')) || 
    "Não disponível";
    document.getElementById("valorHa").value = featureInfo.valor_terreno_ha.toFixed(2).replace('.', ',') || "Não disponível";
    document.getElementById("localizacao").value = featureInfo.localizacao_nota || "0";
    document.getElementById("acesso").value = featureInfo.avp_nota || "0";
    document.getElementById("textura").value = featureInfo.solo_nota || "0";
    
    // Definição dos índices
    const i_urbano = featureInfo.i_urbano || 1;
    const i_pasto = featureInfo.i_pasto || 1;
    const i_cultura = featureInfo.i_cultura || 1;

    // Configuração dos CheckBoxes e atualização dos percentuais
    //document.getElementById("check_urbano").checked = (i_urbano !== 1);
    //document.getElementById("check_pasto").checked = (i_pasto !== 1);
    //document.getElementById("check_cultura").checked = (i_cultura !== 1);

    // Atualização dos displays de porcentagem com base nos valores dos índices
    //updatePercentageDisplay("percent_urbano", i_urbano);
    //updatePercentageDisplay("percent_pasto", i_pasto);
    //updatePercentageDisplay("percent_cultura", i_cultura);
}


// Função para limpar todas as linhas da tabela de benfeitorias
function clearTable() {
    const tableBody = document.getElementById("benfeitoriasTable").getElementsByTagName("tbody")[0];
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    updateTotalRow();
}

// Substitua a função formatNumber por esta versão corrigida:
function formatNumber(value) {
    return value.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// Função para atualizar o somatório do Valor Total
function updateTotalRow() {
    const tableBody = document.getElementById("benfeitoriasTable").getElementsByTagName("tbody")[0];
    let totalValue = 0;

    // Calcula o somatório de todos os valores totais
    Array.from(tableBody.rows).forEach(row => {
        const valorTotalCell = row.cells[4];
        if (valorTotalCell) {
            totalValue += parseFloat(valorTotalCell.textContent.replace(/\./g, '').replace(',', '.')) || 0;
        }
    });

    // Remove a linha de total se já existir
    let existingTotalRow = document.getElementById("totalRow");
    if (existingTotalRow) {
        tableBody.removeChild(existingTotalRow);
    }

    // Cria uma nova linha para o somatório total
    const totalRow = tableBody.insertRow();
    totalRow.id = "totalRow";

    // Define a célula de total para ocupar todas as colunas e exibir o somatório
    const cell = totalRow.insertCell(0);
    cell.colSpan = 5;
    cell.style.fontWeight = "bold";
    cell.textContent = `Valor Total das Benfeitorias: R$ ${formatNumber(totalValue)}`;
}


// Função para adicionar uma nova linha na tabela de benfeitorias
function addBenfeitoriaToTable(categoria, quantidade, unidade, valorUnitario) {
    const tableBody = document.getElementById("benfeitoriasTable").getElementsByTagName("tbody")[0];
    const row = tableBody.insertRow();

    row.insertCell(0).textContent = categoria;
    row.insertCell(1).textContent = formatNumber(quantidade);
    row.insertCell(2).textContent = unidade;
    row.insertCell(3).textContent = formatNumber(valorUnitario);

    const valorTotal = (quantidade * valorUnitario);
    const valorTotalCell = row.insertCell(4);
    valorTotalCell.innerHTML = `
        ${formatNumber(valorTotal)}
        <i class="fa-solid fa-trash-can delete-icon" style="margin-left: 10px; cursor: pointer;"></i>
    `;

    // Evento para exclusão da linha e marcação de modificação
    valorTotalCell.querySelector(".delete-icon").addEventListener("click", function() {
        tableBody.removeChild(row);
        isTableModified = true;
        updateTotalRow();
    });

    updateTotalRow();
}

// Função para preencher a tabela com informações do imóvel
function populateTableWithFeatureInfo(featureInfo,id) {
    if (isTableModified) {
        const confirmClear = confirm("Você já fez alterações na tabela. Deseja realmente carregar os dados do novo imóvel?");
        if (!confirmClear) {
            return;
        }
    }
    id_imovel = id || 0;
    clearTable();
    isTableModified = false;
    populateSimuladorPanel(featureInfo);

    const valorUnitarioAvicultura = 643.65;
    const valorUnitarioSuinocultura = 643.65;
    const valorUnitarioPiscicultura = 30800;

    if (featureInfo.area_avicultura) {
        addBenfeitoriaToTable("Aviários", featureInfo.area_avicultura, "m²", valorUnitarioAvicultura);
    }

    if (featureInfo.area_suinocultura) {
        addBenfeitoriaToTable("Granja de Suínos", featureInfo.area_suinocultura, "m²", valorUnitarioSuinocultura);
    }

    if (featureInfo.un_psicultura) {
        addBenfeitoriaToTable("Piscicultura", featureInfo.un_psicultura, "un", valorUnitarioPiscicultura);
    }
    limparTabela();
    adicionarSimulacao();
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("benfeitoriaTipoModal");
    const modalContent = modal.querySelector(".modal-content");
    const modalHeader = modalContent.querySelector(".modal-header");
    const closeTipoModalButton = document.getElementById("closeTipoModalButton");

    closeTipoModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    let isDragging = false;
    let initialMouseX, initialMouseY;
    let initialModalX, initialModalY;

    modalHeader.addEventListener("mousedown", (e) => {
        isDragging = true;
        const rect = modalContent.getBoundingClientRect();
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        initialModalX = rect.left;
        initialModalY = rect.top;
        modalHeader.style.cursor = "grabbing";
        e.preventDefault();
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        modalHeader.style.cursor = "move";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const deltaX = e.clientX - initialMouseX;
            const deltaY = e.clientY - initialMouseY;
            const left = initialModalX + deltaX;
            const top = initialModalY + deltaY;

            modalContent.style.left = `${left}px`;
            modalContent.style.top = `${top}px`;
            modalContent.style.transform = "none";
        }
    });

    document.getElementById("addBenfeitoriaButton").addEventListener("click", () => {
        modal.style.display = "block";
    });

    window.addEventListener("click", (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});

document.getElementById("tipoBenfeitoriaSelect").addEventListener("change", function() {
    const selectedValue = this.value;
    document.querySelectorAll(".benfeitoria-content").forEach(div => {
        div.style.display = "none";
    });

    if (selectedValue === "aviarios") {
        document.getElementById("aviariosContent").style.display = "block";
    } else if (selectedValue === "suinos") {
        document.getElementById("suinosContent").style.display = "block";
    } else if (selectedValue === "piscicultura") {
        document.getElementById("pisciculturaContent").style.display = "block";
    } else if (selectedValue === "outros") {
        document.getElementById("outrosContent").style.display = "block";
    }
});


// Eventos para os botões "Adicionar" para cada tipo de benfeitoria
document.getElementById("addAviariosButton").addEventListener("click", function() {
    const area = parseFloat(document.getElementById("areaAviarios").value) || 0;
    const valorM2 = parseFloat(document.getElementById("valorM2Aviarios").value) || 643.65;
    isTableModified = true;
    addBenfeitoriaToTable("Aviários", area, "m²", valorM2);
    document.getElementById("benfeitoriaTipoModal").style.display = "none";
});

document.getElementById("addSuinosButton").addEventListener("click", function() {
    const area = parseFloat(document.getElementById("areaSuinos").value) || 0;
    const valorM2 = parseFloat(document.getElementById("valorM2Suinos").value) || 643.65;
    isTableModified = true;
    addBenfeitoriaToTable("Granja de Suínos", area, "m²", valorM2);
    document.getElementById("benfeitoriaTipoModal").style.display = "none";
});

document.getElementById("addPisciculturaButton").addEventListener("click", function() {
    const quantidade = parseFloat(document.getElementById("quantidadePiscicultura").value) || 0;
    const valorUnitario = parseFloat(document.getElementById("valorUnitarioPiscicultura").value) || 30800;
    isTableModified = true;
    addBenfeitoriaToTable("Piscicultura", quantidade, "un", valorUnitario);
    document.getElementById("benfeitoriaTipoModal").style.display = "none";
});

document.getElementById("addOutrosButton").addEventListener("click", function() {
    const categoria = document.getElementById("categoriaOutros").value || "Outros"; // Pega o valor do campo Categoria
    const quantidade = parseFloat(document.getElementById("quantidadeOutros").value) || 0;
    const unidade = document.getElementById("unidadeOutros").value || "un";
    const valorUnitario = parseFloat(document.getElementById("valorUnitarioOutros").value) || 0;
    isTableModified = true;
    addBenfeitoriaToTable(categoria, quantidade, unidade, valorUnitario);
    document.getElementById("benfeitoriaTipoModal").style.display = "none";
});

// Elementos dos CheckBoxes
const checkUrbano = document.getElementById("check_urbano");
const checkPasto = document.getElementById("check_pasto");
const checkCultura = document.getElementById("check_cultura");

// Função para atualizar a exibição da porcentagem
function updatePercentageDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (value === 1) {
        element.style.display = "none"; // Esconde quando não selecionado
    } else {
        const percentage = (value - 1) * 100; // Converte para porcentagem
        element.textContent = (percentage > 0 ? "+" : "") + percentage.toFixed(2) + "%";
        element.className = "percent-indicator " + (percentage > 0 ? "positive" : "negative");
        element.style.display = "block"; // Mostra quando selecionado
    }
}

// Event Listener para "Próxima a Perímetro Urbano"
document.getElementById("check_urbano").addEventListener('change', function() {
    i_urbano = this.checked ? 1.15 : 1;
    updatePercentageDisplay("percent_urbano", i_urbano);
});

// Event Listener para "Utilizada Para Pastagem"
document.getElementById("check_pasto").addEventListener('change', function() {
    i_pasto = this.checked ? 0.9634 : 1;
    updatePercentageDisplay("percent_pasto", i_pasto);
});

// Event Listener para "Utilizada para Culturas"
document.getElementById("check_cultura").addEventListener('change', function() {
    i_cultura = this.checked ? 1.051 : 1;
    updatePercentageDisplay("percent_cultura", i_cultura);
});

document.getElementById('exportarResultadoButton').addEventListener('click', function () {
    // Pega o ID da amostra
    const amostraId = id_imovel;
    
    // Pegar os dados da tabela de simulações
    const table = document.getElementById('simulacoesTable');
    let tableData = [];

    // Iterar sobre as linhas da tabela e capturar os dados
    for (let i = 1; i < table.rows.length; i++) { // Começar da linha 1 para pular o header
        let row = table.rows[i];
        let rowData = [];
        for (let j = 0; j < row.cells.length; j++) {
            rowData.push(row.cells[j].textContent);
        }
        tableData.push(rowData);
    }

    // Capturar o valor da área do terreno
    const areaTerreno = document.getElementById('areaTerreno').value;

    // Converter os dados da tabela em uma string JSON
    const tableDataJSON = JSON.stringify(tableData);
    
    // Codificar os dados para passar via URL, incluindo a área
    const url = `gerar_relatorio.html?id=${amostraId}&data=${encodeURIComponent(tableDataJSON)}&area=${encodeURIComponent(areaTerreno)}`;

    // Abrir a nova página passando os parâmetros na URL
    window.open(url, '_blank');
});

