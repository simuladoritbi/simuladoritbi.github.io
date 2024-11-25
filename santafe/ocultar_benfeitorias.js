// Obter referências aos elementos
const benfeitoriasCheckbox = document.getElementById("benfeitoriasCheckbox");
const benfeitoriasContent = document.getElementById("benfeitoriasContent");
const benfeitoriasTable = document.getElementById("benfeitoriasTable");

// Função para atualizar a exibição com base no estado do checkbox
function updateBenfeitoriasDisplay() {
    if (benfeitoriasCheckbox.checked) {
        benfeitoriasContent.style.display = "block";
    } else {
        benfeitoriasContent.style.display = "none";
    }
}

// Event listener para o checkbox
benfeitoriasCheckbox.addEventListener("change", function() {
    updateBenfeitoriasDisplay();
});

// Chamar a função ao carregar a página
updateBenfeitoriasDisplay();

// Função para atualizar o contador de benfeitorias
function updateBenfeitoriasCount() {
    const benfeitoriasCountSpan = document.getElementById("benfeitoriasCount");
    const benfeitoriasTable = document.getElementById("benfeitoriasTable");
    if (!benfeitoriasTable || !benfeitoriasCountSpan) {
        console.error("Elementos benfeitoriasTable ou benfeitoriasCountSpan não encontrados.");
        return;
    }
    const tbody = benfeitoriasTable.getElementsByTagName("tbody")[0];
    console.log(tbody.rows.length)
    let numBenfeitorias = 0;
    if (tbody) {
        numBenfeitorias = tbody.rows.length -1 ;
        if (numBenfeitorias > 0){
            benfeitoriasCountSpan.textContent = `(benfeitorias encontradas)`;
        }
        else{
            benfeitoriasCountSpan.textContent = ``;
        }
    
    }
}


// Função para atualizar a exibição com base no estado do checkbox
function updateBenfeitoriasDisplay() {
    if (benfeitoriasCheckbox.checked) {
        benfeitoriasContent.style.display = "block";
    } else {
        benfeitoriasContent.style.display = "none";
    }
}

// Event listener para o checkbox
benfeitoriasCheckbox.addEventListener("change", function() {
    updateBenfeitoriasDisplay();
});

// Chamar a função ao carregar a página
updateBenfeitoriasDisplay();
