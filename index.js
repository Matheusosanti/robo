require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const stringSimilarity = require("string-similarity");

// 🔗 Carrega a base de conhecimento
let knowledgeBase;
try {
  knowledgeBase = JSON.parse(fs.readFileSync("memoria.json", "utf-8"));
  console.log("✅ Base de conhecimento carregada com sucesso.");
} catch (error) {
  console.error("❌ Erro ao carregar memoria.json:", error);
  knowledgeBase = {}; // Evita erro se não carregar
}

// 🚀 Inicializa o bot do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// 🔒 ID do canal permitido
const allowedChannelId = process.env.CHANNEL_ID;

// ✔️ Bot está online
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// 🔸 Função para responder a mensagem, mesmo que longa (limite 2000 caracteres do Discord)
async function responderMensagem(message, texto) {
  const partes = texto.match(/[\s\S]{1,2000}/g);
  for (const parte of partes) {
    await message.reply({
      content: parte,
      allowedMentions: { repliedUser: false },
    });
  }
}

// 🧠 Quando uma mensagem é criada
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isDM = !message.guild;
  if (!isDM && message.channelId !== allowedChannelId) return;

  const input = message.content.toLowerCase();
  const chaves = Object.keys(knowledgeBase);

  if (chaves.length === 0) {
    await responderMensagem(
      message,
      "❌ A base de conhecimento está vazia. Por favor, adicione informações no memoria.json.",
    );
    return;
  }

  // 🧠 BUSCA INTELIGENTE: Busca por palavras-chave no título e resumo
  const palavrasBusca = input.split(" ").filter((p) => p.length > 2); // Remove palavras muito pequenas
  const resultadosRelevantes = [];

  // 🔍 Mapeia sinônimos comuns
  const sinonimos = {
    cancelar: [
      "cancelamento",
      "desligar",
      "desligamento",
      "encerrar",
      "encerramento",
    ],
    pagamento: [
      "pagamento",
      "pagar",
      "cobrança",
      "fatura",
      "boleto",
      "assinatura",
      "plano",
      "renovação",
      "vencimento",
    ],
    login: [
      "login",
      "entrar",
      "acesso",
      "senha",
      "usuário",
      "conta",
      "credencial",
      "autenticação",
      "registro",
      "cadastro",
      "recuperar",
    ],
    alterar: [
      "alterar",
      "mudar",
      "modificar",
      "trocar",
      "editar",
      "ajustar",
      "atualizar",
      "revisar",
      "corrigir",
      "configurar",
    ],
    escala: [
      "escala",
      "horário",
      "jornada",
      "turno",
      "trabalho",
      "folga",
      "ciclagem",
      "5x1",
      "12x36",
      "plantão",
    ],
    ponto: [
      "ponto",
      "registro",
      "marcação",
      "frequência",
      "controle",
      "apontamento",
      "batida",
    ],
    feriado: [
      "feriado",
      "recesso",
      "folga",
      "descanso",
      "calendário",
      "data",
      "feriados",
    ],
    colaborador: [
      "colaborador",
      "funcionário",
      "empregado",
      "equipe",
      "time",
      "staff",
      "profissional",
    ],
    integracao: ["conexão", "API"],
    relatorio: [
      "relatório",
      "exportar",
      "imprimir",
      "folha",
      "banco de horas",
      "horas extras",
      "comprovante",
      "documento",
      "AFD",
      "AFDT",
      "ACJEF",
    ],
    ferias: [
      "férias",
      "descanso",
      "coletivas",
      "período",
      "gozo",
      "concessão",
      "agendamento",
    ],
    dispositivo: [
      "dispositivo",
      "celular",
      "tablet",
      "computador",
      "equipamento",
      "aparelho",
    ],
    ocorrencia: [
      "ocorrência",
      "incidente",
      "registro",
      "abono",
      "justificativa",
      "falta",
      "licença",
      "atestado",
      "observação",
    ],
    gestor: [
      "gestor",
      "gerente",
      "supervisor",
      "responsável",
      "administrador",
      "líder",
      "chefe",
    ],
    financeiro: [
      "financeiro",
      "pagamento",
      "boleto",
      "fatura",
      "cobrança",
      "assinatura",
      "plano",
      "valor",
    ],
  };

  for (const chave of chaves) {
    const item = knowledgeBase[chave];
    const textoCompleto = `${chave} ${item.resumo}`.toLowerCase();
    let pontuacao = 0;

    // Busca cada palavra digitada
    for (const palavra of palavrasBusca) {
      // Busca direta
      if (textoCompleto.includes(palavra)) {
        pontuacao += 2;
      }

      // Busca por sinônimos
      for (const [categoria, lista] of Object.entries(sinonimos)) {
        if (lista.includes(palavra)) {
          for (const sinonimo of lista) {
            if (textoCompleto.includes(sinonimo) && sinonimo !== palavra) {
              pontuacao += 1.5;
              break;
            }
          }
        }
      }

      // Similaridade parcial (palavras parecidas)
      const palavrasTexto = textoCompleto.split(" ");
      for (const palavraTexto of palavrasTexto) {
        const sim = stringSimilarity.compareTwoStrings(palavra, palavraTexto);
        if (sim > 0.7) {
          pontuacao += sim;
        }
      }
    }

    if (pontuacao > 0) {
      resultadosRelevantes.push({
        chave,
        item,
        pontuacao,
      });
    }
  }

  // Ordena por pontuação e pega os 5 melhores
  resultadosRelevantes.sort((a, b) => b.pontuacao - a.pontuacao);
  resultadosRelevantes.splice(5);

  console.log(`\n🔍 Buscando por: "${input}"`);
  console.log("📊 Resultados encontrados:");
  resultadosRelevantes.forEach((r, i) => {
    console.log(
      `${i + 1}. "${r.chave}" - Pontuação: ${r.pontuacao.toFixed(1)}`,
    );
  });

  if (resultadosRelevantes.length > 0) {
    let resposta = `🔍 Veja os artigos que encontrei sobre **"${input}"**:\n\n`;

    for (const resultado of resultadosRelevantes) {
      // 🔗 CORREÇÃO: Formatação correta para links clicáveis no Discord
      resposta += `• **${resultado.chave}**: ${resultado.item.resumo}\n${resultado.item.link}\n\n`;
    }

    await responderMensagem(message, resposta);
  } else {
    await responderMensagem(
      message,
      "❌ Não encontrei artigos relacionados ao seu termo na base de conhecimento.",
    );
  }
});

// 🔑 Login no bot
client.login(process.env.DISCORD_TOKEN);
