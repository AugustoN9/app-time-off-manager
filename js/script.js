const DADOS_INICIAIS = {
      colaboradores: [
        "Alberto Alves",
        "Beatriz Barros",
        "Carlos Chagas",
        "Daiana Dores",
        "Ernesto Elardon",
        "Flavia Fortes"
      ],
      tiposAusencia: [
        { id: "ferias", label: "Férias", cor: "#ffff00" },
        { id: "dissidio", label: "Dissídio", cor: "#dce6f1" },
        { id: "recesso", label: "Recesso", cor: "#a9d08e" },
        { id: "saude", label: "Saúde", cor: "#ff0000" }
      ],
      afastamentos: [
        { id: 1, colaborador: "Alberto Alves", tipo: "ferias", dataInicio: "2026-11-09", dataFim: "2026-11-18" },
        { id: 2, colaborador: "Beatriz Barros", tipo: "ferias", dataInicio: "2026-11-23", dataFim: "2026-12-06" },
        { id: 3, colaborador: "Carlos Chagas", tipo: "dissidio", dataInicio: "2026-11-18", dataFim: "2026-11-20" },
        { id: 4, colaborador: "Daiana Dores", tipo: "saude", dataInicio: "2026-10-29", dataFim: "2026-10-29" },
        { id: 5, colaborador: "Flavia Fortes", tipo: "ferias", dataInicio: "2026-12-01", dataFim: "2026-12-21" },
        { id: 6, colaborador: "Alberto Alves", tipo: "ferias", dataInicio: "2027-01-18", dataFim: "2027-01-29" },
        { id: 7, colaborador: "Carlos Chagas", tipo: "recesso", dataInicio: "2027-02-15", dataFim: "2027-02-19" }
      ],
      pontosFacultativos: [
        { data: "2026-10-28", nome: "Dia do Servidor Público" },
        { data: "2026-12-24", nome: "Véspera de Natal" },
        { data: "2026-12-31", nome: "Véspera de Ano Novo" },
        { data: "2027-02-15", nome: "Segunda-feira de Carnaval" },
        { data: "2027-02-17", nome: "Quarta-feira de Cinzas" }
      ]
    };

    const STORAGE_KEY = "time_off_manager_6m_v1";
    let appData = {};
    let dataReferencia = "2026-10-28";

    // Configuração contínua de ~6 meses (Outubro/2026 a Abril/2027 = 198 dias)
    const DATA_INICIO_GRID = "2026-10-15";
    const TOTAL_DIAS_GRID = 198;
    const LARGURA_DIA_PX = 34;

    function parseISODateLocal(isoStr) {
      const parts = isoStr.split("-");
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }

    function formatISODateLocal(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function diffDias(d1, d2) {
      const msPerDay = 1000 * 60 * 60 * 24;
      return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
    }

    function carregarDados() {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        try {
          appData = JSON.parse(salvo);
        } catch (e) {
          appData = JSON.parse(JSON.stringify(DADOS_INICIAIS));
        }
      } else {
        appData = JSON.parse(JSON.stringify(DADOS_INICIAIS));
        salvarDados();
      }
    }

    function salvarDados() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }

    const FERIADOS_OFICIAIS = [
      { data: "2026-01-01", nome: "Confraternização Universal", ambito: "Nacional" },
      { data: "2026-02-02", nome: "Nossa Senhora dos Navegantes", ambito: "Municipal" },
      { data: "2026-02-17", nome: "Carnaval", ambito: "Nacional" },
      { data: "2026-04-03", nome: "Sexta-feira Santa", ambito: "Nacional" },
      { data: "2026-04-21", nome: "Tiradentes", ambito: "Nacional" },
      { data: "2026-05-01", nome: "Dia do Trabalhador", ambito: "Nacional" },
      { data: "2026-06-04", nome: "Corpus Christi", ambito: "Nacional" },
      { data: "2026-09-07", nome: "Independência do Brasil", ambito: "Nacional" },
      { data: "2026-09-20", nome: "Revolução Farroupilha", ambito: "Estadual (RS)" },
      { data: "2026-10-12", nome: "Nossa Senhora Aparecida", ambito: "Nacional" },
      { data: "2026-11-02", nome: "Finados", ambito: "Nacional" },
      { data: "2026-11-15", nome: "Proclamação da República", ambito: "Nacional" },
      { data: "2026-11-20", nome: "Dia da Consciência Negra", ambito: "Nacional" },
      { data: "2026-12-25", nome: "Natal", ambito: "Nacional" },
      { data: "2027-01-01", nome: "Confraternização Universal", ambito: "Nacional" },
      { data: "2027-02-02", nome: "Nossa Senhora dos Navegantes", ambito: "Municipal" },
      { data: "2027-02-09", nome: "Carnaval", ambito: "Nacional" },
      { data: "2027-03-26", nome: "Sexta-feira Santa", ambito: "Nacional" },
      { data: "2027-04-21", nome: "Tiradentes", ambito: "Nacional" }
    ];

    function obterFeriado(isoDate) {
      return FERIADOS_OFICIAIS.find(f => f.data === isoDate) || null;
    }

    function obterPontoFacultativo(isoDate) {
      return (appData.pontosFacultativos || []).find(p => p.data === isoDate) || null;
    }

    // Cores cíclicas por Sprint (ciclos de 16 a 15)
    const CORES_SPRINTS = [
      "#86efac", // Verde menta
      "#facc15", // Amarelo ouro
      "#fb923c", // Laranja suave
      "#a78bfa", // Lavanda / Violeta
      "#38bdf8", // Azul céu
      "#f472b6", // Rosa suave
      "#4ade80"  // Verde folha
    ];

    function obterCorSprintBadge(dateObj) {
      const dia = dateObj.getDate();
      const mes = dateObj.getMonth();
      const ano = dateObj.getFullYear();

      // Dia 15 de Outubro de 2026 (Início)
      if (ano === 2026 && mes === 9 && dia === 15) return "var(--sprint-start-blue)";

      let sprintIndex = (ano - 2026) * 12 + mes - 9;
      if (dia < 16) {
        sprintIndex -= 1;
      }
      const corIndex = Math.max(0, sprintIndex) % CORES_SPRINTS.length;
      return CORES_SPRINTS[corIndex];
    }

    function renderizarLegendaTipos() {
      const container = document.getElementById("containerLegendaTipos");
      if (!container) return;
      container.innerHTML = "";
      appData.tiposAusencia.forEach(t => {
        const span = document.createElement("span");
        span.className = "legend-item";
        span.innerHTML = `<span class="color-box-sample" style="background-color: ${t.cor};"></span> ${t.label}`;
        container.appendChild(span);
      });
    }

    function renderizarGanttBoard() {
      renderizarLegendaTipos();
      const board = document.getElementById("ganttBoard");
      if (!board) return;
      board.innerHTML = "";

      const dtBase = parseISODateLocal(DATA_INICIO_GRID);
      const siglasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

      // -----------------------------------------------------------
      // 1. LINHA DE MESES (6 MESES DINÂMICOS)
      // -----------------------------------------------------------
      const rowMeses = document.createElement("div");
      rowMeses.className = "gantt-row row-months";

      const colNomeMes = document.createElement("div");
      colNomeMes.className = "col-fixed-label col-fixed-header";
      colNomeMes.textContent = "Colaborador";
      rowMeses.appendChild(colNomeMes);

      const trackMeses = document.createElement("div");
      trackMeses.className = "timeline-track";

      const mesesNomes = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const paletaMeses = ["#006699", "#004080", "#205081", "#1e3a8a", "#0f766e", "#312e81", "#1e293b"];

      let diaOffset = 0;
      let mesCursor = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate());
      let idxPaleta = 0;

      while (diaOffset < TOTAL_DIAS_GRID) {
        const mesAtual = mesCursor.getMonth();
        const anoAtual = mesCursor.getFullYear();
        let diasNoBloco = 0;

        while (diaOffset < TOTAL_DIAS_GRID && mesCursor.getMonth() === mesAtual) {
          diasNoBloco++;
          diaOffset++;
          mesCursor = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate() + diaOffset);
        }

        const blk = document.createElement("div");
        blk.className = "month-block";
        blk.style.width = `calc(${diasNoBloco} * var(--col-day-w))`;
        blk.style.backgroundColor = paletaMeses[idxPaleta % paletaMeses.length];
        blk.textContent = `${mesesNomes[mesAtual]} ${anoAtual !== 2026 ? anoAtual : ''}`.trim();
        trackMeses.appendChild(blk);
        idxPaleta++;
      }

      rowMeses.appendChild(trackMeses);
      board.appendChild(rowMeses);

      // -----------------------------------------------------------
      // 2. LINHA DE DIAS DA SEMANA
      // -----------------------------------------------------------
      const rowSemana = document.createElement("div");
      rowSemana.className = "gantt-row row-weekdays";

      const colVaziaSem = document.createElement("div");
      colVaziaSem.className = "col-fixed-label";
      rowSemana.appendChild(colVaziaSem);

      const trackSemana = document.createElement("div");
      trackSemana.className = "timeline-track";

      for (let i = 0; i < TOTAL_DIAS_GRID; i++) {
        const d = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate() + i);
        const cell = document.createElement("div");
        cell.className = "day-cell";
        if (d.getDay() === 0 || d.getDay() === 6) cell.classList.add("is-weekend-col");
        cell.textContent = siglasSemana[d.getDay()];
        trackSemana.appendChild(cell);
      }
      rowSemana.appendChild(trackSemana);
      board.appendChild(rowSemana);

      // -----------------------------------------------------------
      // 3. LINHA DOS BADGES NUMÉRICOS
      // -----------------------------------------------------------
      const rowBadges = document.createElement("div");
      rowBadges.className = "gantt-row row-badges";

      const colVaziaBadges = document.createElement("div");
      colVaziaBadges.className = "col-fixed-label";
      rowBadges.appendChild(colVaziaBadges);

      const trackBadges = document.createElement("div");
      trackBadges.className = "timeline-track";

      for (let i = 0; i < TOTAL_DIAS_GRID; i++) {
        const d = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate() + i);
        const iso = formatISODateLocal(d);
        const cell = document.createElement("div");
        cell.className = "day-cell";
        if (d.getDay() === 0 || d.getDay() === 6) cell.classList.add("is-weekend-col");

        const badge = document.createElement("div");
        badge.className = "sprint-day-badge";
        badge.style.backgroundColor = obterCorSprintBadge(d);
        badge.textContent = String(d.getDate()).padStart(2, '0');

        if (iso === dataReferencia) {
          badge.classList.add("is-today");
          const pin = document.createElement("span");
          pin.className = "today-pin-label";
          pin.textContent = "HOJE";
          badge.appendChild(pin);
        }

        cell.appendChild(badge);
        trackBadges.appendChild(cell);
      }
      rowBadges.appendChild(trackBadges);
      board.appendChild(rowBadges);

      // -----------------------------------------------------------
      // 4. LINHA DEDICADA DE FERIADOS E PONTOS FACULTATIVOS
      // -----------------------------------------------------------
      const rowMarkers = document.createElement("div");
      rowMarkers.className = "gantt-row row-markers";

      const colRotuloMarkers = document.createElement("div");
      colRotuloMarkers.className = "col-fixed-label";
      colRotuloMarkers.style.fontSize = "0.75rem";
      colRotuloMarkers.style.color = "var(--text-muted)";
      colRotuloMarkers.textContent = "Feriados / PF";
      rowMarkers.appendChild(colRotuloMarkers);

      const trackMarkers = document.createElement("div");
      trackMarkers.className = "timeline-track";

      for (let i = 0; i < TOTAL_DIAS_GRID; i++) {
        const d = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate() + i);
        const iso = formatISODateLocal(d);
        const cell = document.createElement("div");
        cell.className = "day-cell";
        if (d.getDay() === 0 || d.getDay() === 6) cell.classList.add("is-weekend-col");

        const feriado = obterFeriado(iso);
        const pf = obterPontoFacultativo(iso);

        if (feriado) {
          cell.innerHTML = `<span class="tag-fer" title="${feriado.nome} (${feriado.ambito})">FER</span>`;
        } else if (pf) {
          cell.innerHTML = `<span class="tag-pf" title="${pf.nome}">PF</span>`;
        }

        trackMarkers.appendChild(cell);
      }
      rowMarkers.appendChild(trackMarkers);
      board.appendChild(rowMarkers);

      // -----------------------------------------------------------
      // 5. LINHAS DOS COLABORADORES E BARRAS DE AFASTAMENTO
      // -----------------------------------------------------------
      appData.colaboradores.forEach(nomeColab => {
        const rowUser = document.createElement("div");
        rowUser.className = "gantt-row row-user";

        const colNome = document.createElement("div");
        colNome.className = "col-fixed-label";
        colNome.textContent = nomeColab;
        colNome.title = nomeColab;
        rowUser.appendChild(colNome);

        const trackUser = document.createElement("div");
        trackUser.className = "timeline-track";

        // Células de fundo
        for (let i = 0; i < TOTAL_DIAS_GRID; i++) {
          const d = new Date(dtBase.getFullYear(), dtBase.getMonth(), dtBase.getDate() + i);
          const iso = formatISODateLocal(d);
          const cell = document.createElement("div");
          cell.className = "day-cell";

          if (d.getDay() === 0 || d.getDay() === 6) cell.classList.add("is-weekend-col");
          if (iso === dataReferencia) cell.classList.add("is-today-track-col");

          trackUser.appendChild(cell);
        }

        // Pílulas de ausência do colaborador
        const eventosMembro = appData.afastamentos.filter(a => a.colaborador === nomeColab);
        eventosMembro.forEach(ev => {
          const dIni = parseISODateLocal(ev.dataInicio);
          const dFim = parseISODateLocal(ev.dataFim);

          const idxInicio = diffDias(dtBase, dIni);
          const idxFim = diffDias(dtBase, dFim);
          const duracaoTotal = diffDias(dIni, dFim) + 1;

          if (idxFim >= 0 && idxInicio < TOTAL_DIAS_GRID) {
            const startCol = Math.max(0, idxInicio);
            const endCol = Math.min(TOTAL_DIAS_GRID - 1, idxFim);
            const duracaoVisivel = endCol - startCol + 1;

            const pill = document.createElement("div");
            pill.className = "event-pill";

            const tipoObj = appData.tiposAusencia.find(t => t.id === ev.tipo) || { cor: "#ffff00", label: "Ausência" };
            pill.style.backgroundColor = tipoObj.cor;

            // Ancorado rigorosamente na linha do colaborador
            pill.style.left = `calc(${startCol} * var(--col-day-w) + 2px)`;
            pill.style.width = `calc(${duracaoVisivel} * var(--col-day-w) - 4px)`;
            pill.textContent = `${duracaoTotal} ${duracaoTotal > 1 ? 'dias' : 'dia'}`;
            pill.title = `${tipoObj.label}: ${ev.dataInicio} a ${ev.dataFim} (${duracaoTotal} dias) - Clique para gerir`;

            pill.onclick = () => gerenciarAfastamento(ev.id);
            trackUser.appendChild(pill);
          }
        });

        rowUser.appendChild(trackUser);
        board.appendChild(rowUser);
      });

      atualizarCardSprint();
      focarDiaAtualOuSprint();
    }

    // Auto-scroll para focar na Sprint ativa e no dia atual
    function focarDiaAtualOuSprint() {
      setTimeout(() => {
        const dtBase = parseISODateLocal(DATA_INICIO_GRID);
        const dtRef = parseISODateLocal(dataReferencia);
        const diasDiff = diffDias(dtBase, dtRef);
        const container = document.querySelector(".gantt-outer-container");

        if (container && diasDiff > 0) {
          const scrollPos = Math.max(0, (diasDiff - 3) * LARGURA_DIA_PX);
          container.scrollTo({ left: scrollPos, behavior: "smooth" });
        }
      }, 100);
    }

    // -------------------------------------------------------------
    // PROGRESSO DA SPRINT ATIVA
    // -------------------------------------------------------------
    function atualizarCardSprint() {
      const dtRef = parseISODateLocal(dataReferencia);
      const dia = dtRef.getDate();
      const mes = dtRef.getMonth();
      const ano = dtRef.getFullYear();

      let sprintInicio, sprintFim;
      if (dia >= 16) {
        sprintInicio = new Date(ano, mes, 16);
        sprintFim = new Date(ano, mes + 1, 15);
      } else {
        sprintInicio = new Date(ano, mes - 1, 16);
        sprintFim = new Date(ano, mes, 15);
      }

      const totalDiasSprint = diffDias(sprintInicio, sprintFim) + 1;
      const diaCorrido = Math.min(totalDiasSprint, Math.max(1, diffDias(sprintInicio, dtRef) + 1));
      const diasRestantes = Math.max(0, totalDiasSprint - diaCorrido);

      let uteisDecorridos = 0;
      let totalUteisSprint = 0;

      for (let i = 0; i < totalDiasSprint; i++) {
        const d = new Date(sprintInicio.getFullYear(), sprintInicio.getMonth(), sprintInicio.getDate() + i);
        const iso = formatISODateLocal(d);
        const ehFDS = d.getDay() === 0 || d.getDay() === 6;
        const ehFeriado = !!obterFeriado(iso);
        const ehPF = !!obterPontoFacultativo(iso);

        if (!ehFDS && !ehFeriado && !ehPF) {
          totalUteisSprint++;
          if (d <= dtRef) uteisDecorridos++;
        }
      }

      const pct = ((diaCorrido / totalDiasSprint) * 100).toFixed(1);
      const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      document.getElementById("labelSprintNome").textContent = `Sprint Agile (16/${mesesNomes[sprintInicio.getMonth()]} a 15/${mesesNomes[sprintFim.getMonth()]})`;
      document.getElementById("labelSprintDetalhes").textContent = `Dia corrido ${diaCorrido} de ${totalDiasSprint} • ${uteisDecorridos}/${totalUteisSprint} dias úteis • ${diasRestantes} dias restantes`;
      document.getElementById("labelSprintPorcentagem").textContent = `${pct}%`;
      document.getElementById("barProgressoSprint").style.width = `${pct}%`;

      const feriadosNoPeriodo = FERIADOS_OFICIAIS.filter(f => {
        const d = parseISODateLocal(f.data);
        return d >= sprintInicio && d <= sprintFim;
      });
      document.getElementById("badgeQtdFeriados").textContent = feriadosNoPeriodo.length;

      const pfNoPeriodo = (appData.pontosFacultativos || []).filter(p => {
        const d = parseISODateLocal(p.data);
        return d >= sprintInicio && d <= sprintFim;
      });
      document.getElementById("badgeQtdPF").textContent = pfNoPeriodo.length;
    }

    function alterarDataReferencia(novaData) {
      if (!novaData) return;
      dataReferencia = novaData;
      renderizarGanttBoard();
    }

    // -------------------------------------------------------------
    // MODAIS & CRUD COM SWEETALERT2
    // -------------------------------------------------------------
    function abrirModalAfastamento() {
      document.getElementById("editAfastamentoId").value = "";
      document.getElementById("modalAfastamentoTitulo").textContent = "Novo Afastamento";
      document.getElementById("formAfastamento").reset();

      const selColab = document.getElementById("selectColaborador");
      selColab.innerHTML = "";
      appData.colaboradores.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        selColab.appendChild(opt);
      });

      const selTipo = document.getElementById("selectTipoAusencia");
      selTipo.innerHTML = "";
      appData.tiposAusencia.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.label;
        selTipo.appendChild(opt);
      });

      new bootstrap.Modal(document.getElementById("modalAfastamento")).show();
    }

    function salvarAfastamento(e) {
      e.preventDefault();
      const idEdit = document.getElementById("editAfastamentoId").value;
      const colab = document.getElementById("selectColaborador").value;
      const tipo = document.getElementById("selectTipoAusencia").value;
      const dtIni = document.getElementById("inputDataInicio").value;
      const dtFim = document.getElementById("inputDataFim").value;

      if (dtFim < dtIni) {
        Swal.fire({ icon: 'error', title: 'Data Inválida', text: 'A data final não pode ser anterior à data inicial.' });
        return;
      }

      if (idEdit) {
        const item = appData.afastamentos.find(a => a.id === parseInt(idEdit, 10));
        if (item) {
          item.colaborador = colab;
          item.tipo = tipo;
          item.dataInicio = dtIni;
          item.dataFim = dtFim;
        }
      } else {
        const novoId = appData.afastamentos.length ? Math.max(...appData.afastamentos.map(a => a.id)) + 1 : 1;
        appData.afastamentos.push({ id: novoId, colaborador: colab, tipo, dataInicio: dtIni, dataFim: dtFim });
      }

      salvarDados();
      renderizarGanttBoard();

      bootstrap.Modal.getInstance(document.getElementById("modalAfastamento")).hide();
      Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Período guardado com sucesso!', timer: 1500, showConfirmButton: false });
    }

    function gerenciarAfastamento(id) {
      const item = appData.afastamentos.find(a => a.id === id);
      if (!item) return;

      const tipoObj = appData.tiposAusencia.find(t => t.id === item.tipo) || { label: item.tipo };

      Swal.fire({
        title: `${item.colaborador}`,
        html: `<strong>Tipo:</strong> ${tipoObj.label}<br><strong>Período:</strong> ${item.dataInicio} a ${item.dataFim}`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-pen me-1"></i>Editar',
        denyButtonText: '<i class="fa-solid fa-trash me-1"></i>Eliminar',
        cancelButtonText: 'Fechar'
      }).then((result) => {
        if (result.isConfirmed) {
          abrirModalAfastamento();
          document.getElementById("editAfastamentoId").value = item.id;
          document.getElementById("modalAfastamentoTitulo").textContent = "Editar Afastamento";
          document.getElementById("selectColaborador").value = item.colaborador;
          document.getElementById("selectTipoAusencia").value = item.tipo;
          document.getElementById("inputDataInicio").value = item.dataInicio;
          document.getElementById("inputDataFim").value = item.dataFim;
        } else if (result.isDenied) {
          appData.afastamentos = appData.afastamentos.filter(a => a.id !== id);
          salvarDados();
          renderizarGanttBoard();
          Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Período removido com sucesso.', timer: 1500, showConfirmButton: false });
        }
      });
    }

    function abrirModalColaboradores() {
      const lista = document.getElementById("listaColaboradoresModal");
      lista.innerHTML = "";
      appData.colaboradores.forEach((colab, idx) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span><strong>${colab}</strong></span>
                        <button class="btn btn-outline-danger btn-sm" onclick="removerColaborador(${idx})"><i class="fa-solid fa-trash"></i></button>`;
        lista.appendChild(li);
      });
      new bootstrap.Modal(document.getElementById("modalColaboradores")).show();
    }

    function adicionarColaborador() {
      const input = document.getElementById("novoColaboradorNome");
      const nome = input.value.trim();
      if (!nome) return;
      if (appData.colaboradores.includes(nome)) {
        Swal.fire({ icon: 'warning', text: 'Colaborador já existe.' });
        return;
      }
      appData.colaboradores.push(nome);
      input.value = "";
      salvarDados();
      renderizarGanttBoard();
      abrirModalColaboradores();
    }

    function removerColaborador(idx) {
      const nome = appData.colaboradores[idx];
      Swal.fire({
        title: `Remover ${nome}?`,
        text: "Os afastamentos deste colaborador também serão excluídos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover'
      }).then(r => {
        if (r.isConfirmed) {
          appData.colaboradores.splice(idx, 1);
          appData.afastamentos = appData.afastamentos.filter(a => a.colaborador !== nome);
          salvarDados();
          renderizarGanttBoard();
          abrirModalColaboradores();
        }
      });
    }

    function abrirModalTipos() {
      const lista = document.getElementById("listaTiposModal");
      lista.innerHTML = "";
      appData.tiposAusencia.forEach((t, idx) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<div class="d-flex align-items-center gap-2">
                          <span class="color-box-sample" style="background:${t.cor}"></span>
                          <span><strong>${t.label}</strong></span>
                        </div>
                        <button class="btn btn-outline-danger btn-sm" onclick="removerTipoAusencia(${idx})"><i class="fa-solid fa-trash"></i></button>`;
        lista.appendChild(li);
      });
      new bootstrap.Modal(document.getElementById("modalTipos")).show();
    }

    function adicionarTipoAusencia() {
      const nomeInput = document.getElementById("novoTipoNome");
      const corInput = document.getElementById("novoTipoCor");
      const nome = nomeInput.value.trim();
      if (!nome) return;

      const id = nome.toLowerCase().replace(/\s+/g, '_');
      appData.tiposAusencia.push({ id, label: nome, cor: corInput.value });
      nomeInput.value = "";
      salvarDados();
      renderizarGanttBoard();
      abrirModalTipos();
    }

    function removerTipoAusencia(idx) {
      if (appData.tiposAusencia.length <= 1) {
        Swal.fire({ icon: 'error', text: 'Deve haver pelo menos um tipo de ausência cadastrado.' });
        return;
      }
      appData.tiposAusencia.splice(idx, 1);
      salvarDados();
      renderizarGanttBoard();
      abrirModalTipos();
    }

    function abrirModalFeriados() {
      const tbody = document.getElementById("tabelaFeriadosCorpo");
      tbody.innerHTML = "";
      const diasSemanaExtenso = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

      FERIADOS_OFICIAIS.forEach(f => {
        const d = parseISODateLocal(f.data);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td><strong>${f.data.split('-').reverse().join('/')}</strong></td>
                        <td>${diasSemanaExtenso[d.getDay()]}</td>
                        <td>${f.nome}</td>
                        <td><span class="badge ${f.ambito.includes('Nacional') ? 'bg-primary' : 'bg-warning text-dark'}">${f.ambito}</span></td>`;
        tbody.appendChild(tr);
      });
      new bootstrap.Modal(document.getElementById("modalFeriados")).show();
    }

    function abrirModalPontosFacultativos() {
      const lista = document.getElementById("listaPFModal");
      lista.innerHTML = "";
      (appData.pontosFacultativos || []).forEach((pf, idx) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<div><strong>${pf.data.split('-').reverse().join('/')}</strong> - ${pf.nome}</div>
                        <button class="btn btn-outline-danger btn-sm" onclick="removerPontoFacultativo(${idx})"><i class="fa-solid fa-trash"></i></button>`;
        lista.appendChild(li);
      });
      new bootstrap.Modal(document.getElementById("modalPontosFacultativos")).show();
    }

    function adicionarPontoFacultativo() {
      const dataInput = document.getElementById("novoPFData");
      const nomeInput = document.getElementById("novoPFNome");
      if (!dataInput.value || !nomeInput.value.trim()) {
        Swal.fire({ icon: 'warning', text: 'Preencha a data e a descrição do ponto facultativo.' });
        return;
      }
      if (!appData.pontosFacultativos) appData.pontosFacultativos = [];
      appData.pontosFacultativos.push({ data: dataInput.value, nome: nomeInput.value.trim() });
      dataInput.value = "";
      nomeInput.value = "";
      salvarDados();
      renderizarGanttBoard();
      abrirModalPontosFacultativos();
    }

    function removerPontoFacultativo(idx) {
      appData.pontosFacultativos.splice(idx, 1);
      salvarDados();
      renderizarGanttBoard();
      abrirModalPontosFacultativos();
    }

    function exportarJSON() {
      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time_off_manager_${dataReferencia}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function importarJSON(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.colaboradores && imported.afastamentos) {
            appData = imported;
            salvarDados();
            renderizarGanttBoard();
            Swal.fire({ icon: 'success', title: 'Importado', text: 'Dados carregados com sucesso!' });
          } else {
            Swal.fire({ icon: 'error', text: 'Estrutura JSON incompatível.' });
          }
        } catch (err) {
          Swal.fire({ icon: 'error', text: 'Ficheiro JSON inválido.' });
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }

    function restaurarDadosPadrao() {
      Swal.fire({
        title: 'Restaurar Dados Padrão?',
        text: 'Todas as modificações manuais serão substituídas pelo modelo inicial.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, restaurar'
      }).then(r => {
        if (r.isConfirmed) {
          appData = JSON.parse(JSON.stringify(DADOS_INICIAIS));
          salvarDados();
          renderizarGanttBoard();
          Swal.fire({ icon: 'success', text: 'Dados restaurados com sucesso!' });
        }
      });
    }

    // Inicialização segura no carregamento do DOM
    window.addEventListener("DOMContentLoaded", () => {
      const inputSim = document.getElementById("inputDataSimulada");
      if (inputSim) inputSim.value = dataReferencia;
      carregarDados();
      renderizarGanttBoard();
    });