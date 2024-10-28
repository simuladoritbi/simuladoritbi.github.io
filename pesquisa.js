// Lucas, se você está lendo isso, saiba que cada gambiarra e POG desse código nasceu da necessidade urgente de fazer esse simulador funcionar "pra ontem". Não foi por escolha, foi pela sobrevivência! :)
function formatNumber(value) {
    return value.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function showAmostraPanel(featureInfo) {
    // Ocultar o simulador e mostrar o painel de amostra
    document.getElementById('simulador').style.display = 'none';
    document.getElementById('amostra').style.display = 'block';

    // Preencher os campos da amostra com os dados da feição (featureInfo)
    document.getElementById("amostraId").textContent = featureInfo.fid || "Não disponível";
    document.getElementById("amostraArea").textContent =  featureInfo.area_ha || "Não disponível";
    document.getElementById("amostraValorHa").textContent = formatNumber(featureInfo.valor_oferta_ha) || "Não disponível";
    document.getElementById("amostraValorTotal").textContent = formatNumber(featureInfo.valor_oferta)|| "Não disponível";
    document.getElementById("amostraTipoPesquisa").textContent = featureInfo.tipo_pesquisa || "Não disponível";
    document.getElementById("amostraObservacao").value = featureInfo.observacao || "";
}

// Função para voltar ao painel do simulador
function voltarAoSimulador() {
    // Ocultar o painel de amostra e mostrar o simulador
    document.getElementById('amostra').style.display = 'none';
    document.getElementById('simulador').style.display = 'block';
}

// Evento para o botão "Voltar ao Simulador"
document.getElementById('voltarSimuladorButton').addEventListener('click', voltarAoSimulador);
