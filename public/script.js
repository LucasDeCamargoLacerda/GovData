/* ============================================================
   GovData — Dashboard
   Busca dados da API (Express + MySQL) e preenche a tela.

   Ajuste os endpoints abaixo conforme você for criando as
   rotas no seu backend. Os nomes usados aqui seguem o que já
   foi planejado no projeto — troque se você nomear diferente.
   ============================================================ */

const API_BASE_URL = 'http://localhost:3000';

const ENDPOINTS = {
  cidadaos: `${API_BASE_URL}/cidadaos`,
  solicitacoes: `${API_BASE_URL}/solicitacoes`,
  statusSolicitacoes: `${API_BASE_URL}/relatorios/status-solicitacoes`,
  pedidosServicos: `${API_BASE_URL}/relatorios/pedidos-servicos`,
  demandaCidade: `${API_BASE_URL}/relatorios/demanda-cidade`,
  tempoMedioAtendimento: `${API_BASE_URL}/relatorios/tempo-medio-atendimentos`,
};

/* ---------- Utilidades ---------- */

// Faz um fetch simples e devolve o JSON, ou null se der erro.
// Cada seção do dashboard trata o "null" mostrando um estado vazio,
// em vez de travar a página inteira se uma rota ainda não existir.
async function fetchJSON(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    console.warn(`Falha ao buscar ${url}:`, erro.message);
    return null;
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '—';
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR');
}

function classeStatus(status) {
  const normalizado = (status || '').toLowerCase();
  if (normalizado.includes('pend')) return 'status-badge--pendente';
  if (normalizado.includes('andamento')) return 'status-badge--andamento';
  if (normalizado.includes('conclu')) return 'status-badge--concluido';
  return 'status-badge--pendente';
}

/* ---------- Indicador de status da API ---------- */

function marcarStatusAPI(online) {
  const ponto = document.getElementById('apiStatusDot');
  const texto = document.getElementById('apiStatusText');
  ponto.classList.remove('is-online', 'is-offline');
  ponto.classList.add(online ? 'is-online' : 'is-offline');
  texto.textContent = online ? 'API conectada' : 'API indisponível';
}

/* ---------- KPIs ---------- */

async function carregarKPIs() {
  const [cidadaos, solicitacoes, statusSolic, tempoMedio] = await Promise.all([
    fetchJSON(ENDPOINTS.cidadaos),
    fetchJSON(ENDPOINTS.solicitacoes),
    fetchJSON(ENDPOINTS.statusSolicitacoes),
    fetchJSON(ENDPOINTS.tempoMedioAtendimento),
  ]);

  document.getElementById('kpiCidadaos').textContent =
    Array.isArray(cidadaos) ? cidadaos.length : '—';

  document.getElementById('kpiSolicitacoes').textContent =
    Array.isArray(solicitacoes) ? solicitacoes.length : '—';

  // statusSolic vem como [{status: 'Pendente', total: 12}, {status: 'Concluído', total: 40}, ...]
  const kpiPendentes = document.getElementById('kpiPendentes');
  if (Array.isArray(statusSolic)) {
    const itemPendente = statusSolic.find(s => (s.status || '').toLowerCase().includes('pend'));
    kpiPendentes.textContent = itemPendente ? itemPendente.total : 0;
  } else {
    kpiPendentes.textContent = '—';
  }

  // A rota /relatorios/tempo-medio-atendimentos devolve [{ tempo_medio: 4.2 }]
  // Atenção: o mysql2 costuma devolver campos DECIMAL como STRING (ex: "4.20"),
  // não como number — por isso convertemos com Number() antes de checar.
  const kpiTempo = document.getElementById('kpiTempoMedio');
  const bruto = Array.isArray(tempoMedio) ? tempoMedio[0]?.tempo_medio : null;
  const valorTempo = bruto === null || bruto === undefined ? NaN : Number(bruto);
  if (!Number.isNaN(valorTempo)) {
    kpiTempo.innerHTML = `${valorTempo}<span class="kpi-unit">dias</span>`;
  } else {
    kpiTempo.innerHTML = `—<span class="kpi-unit">dias</span>`;
  }

  // Se pelo menos uma chamada funcionou, consideramos a API "online"
  const algumaRespondeu = [cidadaos, solicitacoes, statusSolic, tempoMedio].some(v => v !== null);
  marcarStatusAPI(algumaRespondeu);
}

/* ---------- Serviços mais utilizados ---------- */

async function carregarServicosMaisUsados() {
  const lista = document.getElementById('servicosRanking');
  // Por enquanto usa /relatorios/pedidos-servicos, que agrupa por CATEGORIA.
  // Quando você criar uma rota agrupando por servico_id (JOIN servicos + solicitacoes),
  // troque ENDPOINTS.pedidosServicos por ela pra ver o serviço específico, não a categoria.
  const dados = await fetchJSON(ENDPOINTS.pedidosServicos);

  if (!Array.isArray(dados) || dados.length === 0) {
    lista.innerHTML = '<li class="ranking-empty">Sem dados disponíveis ainda</li>';
    return;
  }

  // Espera-se cada item como { categoria: 'Documentação', total: 128 }
  lista.innerHTML = [...dados]
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map(item => `
      <li>
        <span class="ranking-name">${item.categoria}</span>
        <span class="ranking-count">${item.total}</span>
      </li>
    `)
    .join('');
}

/* ---------- Demanda por órgão ---------- */

async function carregarDemandaPorOrgao() {
  const lista = document.getElementById('orgaosDemanda');
  // Por enquanto usa /relatorios/demanda-cidade (agrupa por cidade do cidadão).
  // Quando você criar a versão por órgão (JOIN solicitacoes + servicos + orgaos,
  // GROUP BY orgao), troque ENDPOINTS.demandaCidade por ela.
  const dados = await fetchJSON(ENDPOINTS.demandaCidade);

  if (!Array.isArray(dados) || dados.length === 0) {
    lista.innerHTML = '<li class="ranking-empty">Sem dados disponíveis ainda</li>';
    return;
  }

  // Espera-se cada item como { cidade: 'Brasília', total: 340 }
  const maiorValor = Math.max(...dados.map(d => d.total));

  lista.innerHTML = [...dados]
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map(item => {
      const porcentagem = maiorValor > 0 ? Math.round((item.total / maiorValor) * 100) : 0;
      return `
        <li>
          <div class="bar-row">
            <span class="bar-label">${item.cidade}</span>
            <span class="bar-value">${item.total}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${porcentagem}%"></div>
          </div>
        </li>
      `;
    })
    .join('');
}

/* ---------- Tabela de solicitações recentes ---------- */

async function carregarSolicitacoesRecentes() {
  const corpoTabela = document.getElementById('solicitacoesTableBody');
  const contagem = document.getElementById('tableCount');
  const dados = await fetchJSON(ENDPOINTS.solicitacoes);

  if (!Array.isArray(dados) || dados.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="4" class="table-empty">Sem solicitações cadastradas ainda</td></tr>';
    contagem.textContent = '';
    return;
  }

  // Ordena pelas mais recentes e mostra as 8 primeiras
  const recentes = [...dados]
    .sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao))
    .slice(0, 8);

  contagem.textContent = `${dados.length} no total`;

  corpoTabela.innerHTML = recentes
    .map(item => `
      <tr>
        <td>${item.cidadao_nome ?? `Cidadão #${item.cidadao_id}`}</td>
        <td>${item.servico_nome ?? `Serviço #${item.servico_id}`}</td>
        <td>${formatarData(item.data_solicitacao)}</td>
        <td><span class="status-badge ${classeStatus(item.status)}">${item.status}</span></td>
      </tr>
    `)
    .join('');
}

/* ---------- Orquestração ---------- */

async function carregarDashboard() {
  const botao = document.getElementById('refreshBtn');
  botao.classList.add('is-loading');

  await Promise.all([
    carregarKPIs(),
    carregarServicosMaisUsados(),
    carregarDemandaPorOrgao(),
    carregarSolicitacoesRecentes(),
  ]);

  botao.classList.remove('is-loading');
}

document.getElementById('refreshBtn').addEventListener('click', carregarDashboard);

// Navegação lateral (por enquanto só visual — cada view pode
// ganhar sua própria função de carregamento conforme o projeto crescer)
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (evento) => {
    evento.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('is-active'));
    item.classList.add('is-active');
  });
});

carregarDashboard();