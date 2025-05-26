🔍 Explicação Detalhada do Sistema de Busca Inteligente

📝 Visão Geral
O código substituiu a busca simples por similaridade de strings por um sistema muito mais sofisticado que analisa palavras individuais, reconhece sinônimos e pontua resultados por relevância.

🧩 Quebra do Código Passo a Passo

1. Preparação das Palavras de Busca
const palavrasBusca = input.split(' ').filter(p => p.length > 2);

● O que faz: Pega o texto digitado pelo usuário e quebra em palavras individuais

● Filtro: Remove palavras muito pequenas (menos de 3 letras) como "de", "da", "em"

● Exemplo: "como cancelar conta" → ["como", "cancelar", "conta"]

2. Mapeamento de Sinônimos
const sinonimos = {
'cancelar': ['cancelar', 'cancelamento', 'desligar', 'desligamento', 'encerrar', 'encerramento'],
'pagamento': ['pagamento', 'pagar', 'cobrança', 'fatura', 'boleto'],
'login': ['login', 'entrar', 'acesso', 'senha', 'usuário'],
'alterar': ['alterar', 'mudar', 'modificar', 'trocar', 'editar'],
};

● Propósito: Define grupos de palavras com significados similares
● Como funciona: Se o usuário digita "desligamento", o sistema também vai buscar
por "cancelar", "encerrar", etc.
● Expansível: Você pode adicionar mais categorias conforme necessário

3. Loop Principal - Análise de Cada Artigo
for (const chave of chaves) {
const item = knowledgeBase[chave];
const textoCompleto = `${chave} ${item.resumo}`.toLowerCase();
let pontuacao = 0;

● O que faz: Percorre cada artigo da base de conhecimento

● textoCompleto: Junta o título do artigo + resumo em texto minúsculo para busca

● pontuacao: Sistema de pontos que determina o quão relevante é o artigo

4. Sistema de Pontuação Triplo
🎯 Busca Direta (2 pontos)
for (const palavra of palavrasBusca) {
if (textoCompleto.includes(palavra)) {
pontuacao += 2;
}

● Maior pontuação: Quando encontra a palavra exata no texto
● Exemplo: Usuário digita "pagamento" e encontra "pagamento" no artigo = +2 pontos

🤝 Busca por Sinônimos (1.5 pontos)
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

● Como funciona:
1. Verifica se a palavra digitada está em alguma lista de sinônimos
2. Se sim, procura pelos outros sinônimos da mesma categoria no texto
3. Se encontrar, adiciona 1.5 pontos

● Exemplo: Usuário digita "desligamento" → sistema busca "cancelar", "encerrar" →
encontra "cancelar" no artigo = +1.5 pontos

🔤 Similaridade Parcial (0.7+ pontos)
const palavrasTexto = textoCompleto.split(' ');
for (const palavraTexto of palavrasTexto) {
const sim = stringSimilarity.compareTwoStrings(palavra, palavraTexto);
if (sim > 0.7) {
pontuacao += sim;
}
}

● Função: Encontra palavras muito parecidas (70%+ similaridade)

● Uso: Para erros de digitação ou variações da palavra

● Exemplo:"pagamento" vs "pagamento" = 0.9 de similaridade = +0.9 pontos
