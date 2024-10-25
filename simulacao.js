document.getElementById("addSimulacaoButton").addEventListener("click", adicionarSimulacao);

function formatar(value) {
    return value.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// Função para atualizar a cor e o texto do índice personalizado
function updateCustomIndex() {
    const editableIndex = document.getElementById("editableIndex");
    const value = parseFloat(editableIndex.value) || 0; // Garantir que o valor seja um número
    const percentCustom = document.getElementById("percent_custom");

    // Atualiza o texto do índice personalizado ao lado do input
    percentCustom.textContent = value.toFixed(1) + "%";

    // Verifica se o valor está fora dos limites permitidos
    if (value > 10 || value < -10) {
        document.getElementById("warningMessage").style.display = "inline";
    } else {
        document.getElementById("warningMessage").style.display = "none";
    }

    // Aplica as classes de cor com base no valor|
    if (value >= 0) {
        editableIndex.classList.add("positive");
        editableIndex.classList.remove("negative");
        percentCustom.classList.add("positive");
        percentCustom.classList.remove("negative");
    } else {
        editableIndex.classList.add("negative");
        editableIndex.classList.remove("positive");
        percentCustom.classList.add("negative");
        percentCustom.classList.remove("positive");
    }
}

// Adiciona o listener para mudanças no input
document.getElementById("editableIndex").addEventListener("input", updateCustomIndex);

// Chama a função ao carregar a página para garantir que a cor seja aplicada com base no valor inicial
window.onload = function() {
    updateCustomIndex();
};

function adicionarSimulacao() {
    const area = parseFloat(document.getElementById("areaTerreno").value.replace('.', '').replace(',', '.')) || 0;
    const valorHa = parseFloat(document.getElementById("valorHa").value.replace('.', '').replace(',', '.')) || 0;
    const aliquota = parseFloat(document.getElementById("aliquota").value.replace(',', '.')) / 100 || 0.04;

    const i_urbano = document.getElementById("check_urbano").checked ? 1.15 : 1;
    const i_pasto = document.getElementById("check_pasto").checked ? 0.9634 : 1;
    const i_cultura = document.getElementById("check_cultura").checked ? 1.051 : 1;

    // Novo índice personalizável
    const i_custom = parseFloat(document.getElementById("editableIndex").value) / 100 || 0;

    const transmissao = parseFloat(document.getElementById("transmitida").value.replace(',', '.')) / 100 || 0.04;

    // Calcula o índice total
    const indice = (i_urbano + i_pasto + i_cultura + i_custom) - 2;

    // Obter o valor total das benfeitorias somente se o checkbox estiver marcado
    let valorBenfeitoria = 0;
    if (benfeitoriasCheckbox.checked) {
        const benfeitoriasTableBody = benfeitoriasTable.getElementsByTagName("tbody")[0];
        for (let row of benfeitoriasTableBody.rows) {
            if (row.cells[4]) {
                const valorTotal = parseFloat(row.cells[4].innerText.replace(/[R$\.\s]/g, '').replace(',', '.')) || 0;
                valorBenfeitoria += valorTotal;
            }
        }
    }

    // Calcula o resultado final com base na fórmula
    const terreno = (area * valorHa * indice * transmissao);
    const venal = (terreno + (valorBenfeitoria*transmissao));
    const resultado = venal * aliquota;

    // Cria uma nova linha para a tabela de simulações
    const simulacoesTable = document.getElementById("simulacoesTable").getElementsByTagName("tbody")[0];
    const newRow = simulacoesTable.insertRow();
    newRow.insertCell(0).textContent = "R$ " + formatar(terreno);
    newRow.insertCell(1).textContent = "R$ " + formatar(valorBenfeitoria);
    newRow.insertCell(2).textContent = "R$ " + formatar(venal);

    // Cria a célula para o valor do ITBI e o ícone de lixeira junto
    const itbiCell = newRow.insertCell(3);
    itbiCell.innerHTML = `
        R$ ${formatar(resultado)}
        <i class="fa-solid fa-trash-can delete-icon" style="margin-left: 10px; cursor: pointer;"></i>
    `;

    // Adiciona evento de clique para remover a linha
    itbiCell.querySelector(".delete-icon").addEventListener("click", function() {
        simulacoesTable.removeChild(newRow);
    });
}

function limparTabela() {
    const simulacoesTableBody = document.getElementById("simulacoesTable").getElementsByTagName("tbody")[0];
    simulacoesTableBody.innerHTML = ""; // Limpa todas as linhas da tabela
}
