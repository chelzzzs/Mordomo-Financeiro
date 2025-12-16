let rendaMensal = 0;
let despesas = [];
let chart;

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();

  document
    .getElementById("btn-salvar-renda")
    .addEventListener("click", salvarRenda);
  document
    .getElementById("btn-adicionar")
    .addEventListener("click", adicionarDespesa);
  document
    .getElementById("lista-despesas")
    .addEventListener("click", excluirDespesaClick);

  inicializarGrafico();

  atualizarLista();
  atualizarMedidor();
  atualizarGrafico();

  setTimeout(atualizarStatusMordomo, 2000);
});

function salvarRenda() {
  const valorRenda = parseFloat(document.getElementById("renda").value);

  if (!valorRenda || valorRenda <= 0) {
    alert("Por favor, insira um valor válido para a renda, Chefe.");
    return;
  }

  rendaMensal = valorRenda;
  salvarDados();
  atualizarDashboard();
  alert("Renda registrada com sucesso, Chefe!");
}

function adicionarDespesa() {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;

  if (!descricao) {
    alert("Por favor, insira uma descrição para a despesa, Chefe.");
    return;
  }

  if (!valor || valor <= 0) {
    alert("Por favor, insira um valor válido para a despesa, Chefe.");
    return;
  }

  const despesa = {
    id: Date.now().toString(),
    descricao,
    valor,
    categoria,
  };

  despesas.push(despesa);
  salvarDados();
  atualizarDashboard();

  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";

  alert("Despesa adicionada com sucesso, Chefe!");
}

function excluirDespesaClick(e) {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    const despesa = despesas.find((d) => d.id === id);

    if (confirm(`Deseja realmente excluir "${despesa.descricao}", Chefe?`)) {
      despesas = despesas.filter((d) => d.id !== id);
      salvarDados();
      atualizarDashboard();
    }
  }
}

function salvarDados() {
  localStorage.setItem("rendaMensal", rendaMensal);
  localStorage.setItem("despesas", JSON.stringify(despesas));
}

function carregarDados() {
  rendaMensal = parseFloat(localStorage.getItem("rendaMensal")) || 0;
  despesas = JSON.parse(localStorage.getItem("despesas")) || [];

  if (rendaMensal > 0) {
    document.getElementById("renda").value = rendaMensal;
  }
}

function atualizarDashboard() {
  atualizarLista();
  atualizarMedidor();
  atualizarGrafico();
  atualizarStatusMordomo();
}

function atualizarStatusMordomo() {
  const total = despesas.reduce((acc, d) => acc + d.valor, 0);
  const percentual = rendaMensal > 0 ? (total / rendaMensal) * 100 : 0;

  let status;
  if (rendaMensal === 0) {
    status = "neutro";
  } else if (percentual <= 60) {
    status = "bom";
  } else if (percentual <= 95) {
    status = "medio";
  } else {
    status = "ruim";
  }

  atualizarMordomo(status);
}

function atualizarMordomo(status) {
  const img = document.getElementById("mordomo-img");
  const msg = document.getElementById("mordomo-msg");

  const imgAtual = img.src.split("/").pop();

  img.classList.remove("animate");
  void img.offsetWidth;

  switch (status) {
    case "bom":
      if (imgAtual !== "mordomo_feliz.png.png") {
        img.src = "images/mordomo_feliz.png.png";
        img.classList.add("animate");
      }
      msg.textContent = "Você está indo muito bem nos seus gastos, chefe!";
      break;
    case "medio":
      if (imgAtual !== "mordomo_neutro.png.png") {
        img.src = "images/mordomo_neutro.png.png";
        img.classList.add("animate");
      }

      break;
    case "ruim":
      if (imgAtual !== "mordomo_neutro.png.png") {
        img.src = "images/mordomo_neutro.png.png";
        img.classList.add("animate");
      }

      break;
    default:
      if (imgAtual !== "mordomo_neutro.png.png") {
        img.src = "images/mordomo_neutro.png.png";
        img.classList.add("animate");
      }
  }
}

function atualizarLista() {
  const ul = document.getElementById("lista-despesas");
  ul.innerHTML = "";

  if (despesas.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "Nenhuma despesa registrada ainda, Chefe.";
    ul.appendChild(li);
    return;
  }

  despesas.forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${d.descricao}</strong> - ${
      d.categoria
    } - R$ ${d.valor.toFixed(2)}</span>
      <button class="btn-delete" data-id="${d.id}">&times;</button>
    `;
    ul.appendChild(li);
  });
}

function atualizarMedidor() {
  const total = despesas.reduce((acc, d) => acc + d.valor, 0);
  const percentual = rendaMensal > 0 ? (total / rendaMensal) * 100 : 0;
  const barra = document.getElementById("barra");
  const mensagem = document.getElementById("mensagem");

  barra.style.width = `${Math.min(percentual, 100)}%`;

  if (rendaMensal === 0) {
    barra.style.background = "#ccc";
    mensagem.textContent = "Aguardo o registro de sua renda, Chefe.";
    mensagem.style.color = "#999";
  } else if (percentual <= 60) {
    barra.style.background = "var(--verde)";
    mensagem.textContent = "Excelente controle, Chefe! Continue assim.";
    mensagem.style.color = "var(--verde)";
  } else if (percentual <= 95) {
    barra.style.background = "var(--laranja)";
    mensagem.textContent = "Atenção moderada, Chefe. Cuidado com os gastos.";
    mensagem.style.color = "var(--laranja)";
  } else {
    barra.style.background = "var(--vermelho)";
    mensagem.textContent = "Situação crítica, Chefe! Revise suas finanças.";
    mensagem.style.color = "var(--vermelho)";
  }
}

function inicializarGrafico() {
  const ctx = document.getElementById("grafico").getContext("2d");
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [
        "🏠 Moradia",
        "🛒 Alimentação",
        "🚗 Transporte",
        "🎮 Lazer",
        "🏷️ Outros",
      ],
      datasets: [
        {
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            "#4cc9f0",
            "#5b5be3",
            "#f39c12",
            "#9b59b6",
            "#95a5a6",
          ],
          borderWidth: 3,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#333",
            font: {
              size: 13,
              family: "Poppins",
            },
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed;
              return `${label}: R$ ${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function atualizarGrafico() {
  const totais = {
    Moradia: 0,
    Alimentação: 0,
    Transporte: 0,
    Lazer: 0,
    Outros: 0,
  };

  despesas.forEach((d) => {
    totais[d.categoria] += d.valor;
  });

  const valores = Object.values(totais);
  const temDados = valores.some((v) => v > 0);

  if (!temDados) {
    chart.data.datasets[0].data = [1, 0, 0, 0, 0];
    chart.data.datasets[0].backgroundColor = [
      "#e0e0e0",
      "#e0e0e0",
      "#e0e0e0",
      "#e0e0e0",
      "#e0e0e0",
    ];
  } else {
    chart.data.datasets[0].data = valores;
    chart.data.datasets[0].backgroundColor = [
      "#4cc9f0",
      "#5b5be3",
      "#f39c12",
      "#9b59b6",
      "#95a5a6",
    ];
  }

  chart.update();
}
