

// Função para calcular o valor do hectare (valorHa)
function calculateValorHa(avpNota, localizacaoNota, texturaNota) {
    console.log(avpNota, localizacaoNota, texturaNota);
    return 1 / (
        (9.3854 * Math.pow(10, -6)) +
        (2.0279 * Math.pow(10, -5) / avpNota) -
        (1.8072 * Math.pow(10, -7) * localizacaoNota) +
        (4.7406 * Math.pow(10, -6) / texturaNota)
    );
}
// Função para obter o valor numérico selecionado de cada campo select
function getSelectedValue(selectId) {
    const selectElement = document.getElementById(selectId);
    return parseInt(selectElement.value, 10);
}

// Função para atualizar o valor do hectare quando qualquer campo de seleção for alterado
function updateValorHa() {
    const avpNota = getSelectedValue("acesso");
    const localizacaoNota = getSelectedValue("localizacao");
    const texturaNota = getSelectedValue("textura");

    // Recalcula o valor do hectare
    const valorHa = calculateValorHa(avpNota, localizacaoNota, texturaNota);

    // Define o valor no campo valorHa
    document.getElementById("valorHa").value = valorHa.toFixed(2).replace('.',',');
}

// Adiciona event listeners aos campos de seleção
document.getElementById("localizacao").addEventListener("change", updateValorHa);
document.getElementById("acesso").addEventListener("change", updateValorHa);
document.getElementById("textura").addEventListener("change", updateValorHa);

document.getElementById("addBenfeitoriaButton").addEventListener("click", function() {
    document.getElementById("benfeitoriaTipoModal").style.display = "block";
});

document.getElementById("closeTipoModalButton").addEventListener("click", function() {
    document.getElementById("benfeitoriaTipoModal").style.display = "none";
});


document.getElementById("editableIndex").addEventListener("input", function() {
    const value = parseFloat(this.value);
    
    // Verifica se o valor está fora dos limites permitidos
    if (value > 10 || value < -10) {
        document.getElementById("warningMessage").style.display = "inline";
    } else {
        document.getElementById("warningMessage").style.display = "none";
    }
});

function abrirPaginaAmostra() {
    const id = document.getElementById('amostraId').innerText;
    if (id) {
        const url = `amostras/Imovel_${id}.pdf#toolbar=0`; // #toolbar=0 esconde a barra de ferramentas do PDF no navegador
        window.open(url, '_blank');
    } else {
        alert("ID da amostra não encontrado.");
    }
}