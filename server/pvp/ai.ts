/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("PLACEHOLDER") || apiKey.trim() === "") {
      console.warn("⚠️ GEMINI_API_KEY de desenvolvimento ou placeholder detectado. Usando respostas simuladas de personalidade para os bots.");
      return null;
    }
    try {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Falha ao inicializar o cliente GoogleGenAI:", err);
      return null;
    }
  }
  return aiInstance;
}

export interface BotCommentParams {
  botName: string;
  botBelt: string;
  botSpeed: number;
  botAggressiveness: number;
  botIntelligence: number;
  currentRound: number;
  questionText: string;
  correctOption: string;
  correctOptionText: string;
  challengerName: string;
  challengerAnswer: string;
  challengerCorrect: boolean;
  defenderAnswer: string;
  defenderCorrect: boolean;
}

export async function generateBotComment(params: BotCommentParams): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return getFallbackComment(params);
  }

  try {
    const prompt = `Você é um bot de inteligência artificial jogando um jogo de quiz/arena tática sobre Jiu-Jitsu chamado "${params.botName}" (${params.botBelt}, velocidade: ${params.botSpeed}%, agressividade: ${params.botAggressiveness}%, inteligência: ${params.botIntelligence}%).

Acabou de ocorrer o assalto (rodada) de número ${params.currentRound}.
A pergunta foi: "${params.questionText}"
A resposta correta era: "${params.correctOption} - ${params.correctOptionText}"

O jogador real "${params.challengerName}" respondeu "${params.challengerAnswer || "nada (esgotou o tempo)"}" e ${params.challengerCorrect ? "ACERTOU" : "ERROU"}.
Você, o bot "${params.botName}", respondeu "${params.defenderAnswer || "nada (esgotou o tempo)"}" e ${params.defenderCorrect ? "ACERTOU" : "ERROU"}.

Escreva um comentário curto e criativo (MÁXIMO 150 caracteres, de preferência 1 ou 2 frases curtas), em Português do Brasil, que represente a sua reação imediata.
Seu tom deve respeitar as seguintes características do seu personagem:
- Faixa Branca: confuso, ansioso, cansado fisicamente ("estou sem gás"), assustado mas empolgado.
- Faixa Azul: folgado, marrento, se acha o campeão absoluto, fala gírias como "berimbolo", "guarda", "vou te finalizar", zoa se o jogador errou.
- Faixa Roxa: técnico, relaxado, meditativo, foca no "flow" do combate, respeitoso mas brincalhão.
- Faixa Marrom: sério, firme, fala sobre amassar, pressão de passador, focado em ajustes de cotovelo, sem paciência.
- Faixa Preta: místico, sábio, profundo, calmo, cita ensinamentos de autodefesa com autoridade ("Oss").

Não inclua explicações ou metadados na resposta. Escreva estritamente a fala do personagem (por exemplo: "Zoei! Você vacilou na guarda e eu passei rindo. Oss!").`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        maxOutputTokens: 100,
      }
    });

    if (response && response.text) {
      return response.text.trim().replace(/^"|"$/g, ""); // remove outer quotes
    }
  } catch (err) {
    console.error("Erro ao invocar a API do Gemini para comentários de bot:", err);
  }

  return getFallbackComment(params);
}

function getFallbackComment(p: BotCommentParams): string {
  const isWhite = p.botBelt.toUpperCase().includes("BRANCA") || p.botBelt.toUpperCase().includes("WHITE");
  const isBlue = p.botBelt.toUpperCase().includes("AZUL") || p.botBelt.toUpperCase().includes("BLUE");
  const isPurple = p.botBelt.toUpperCase().includes("ROXA") || p.botBelt.toUpperCase().includes("PURPLE");
  const isBrown = p.botBelt.toUpperCase().includes("MARROM") || p.botBelt.toUpperCase().includes("BROWN");
  const isBlack = p.botBelt.toUpperCase().includes("PRETA") || p.botBelt.toUpperCase().includes("BLACK");

  // Bot correct, Challenger correct
  if (p.defenderCorrect && p.challengerCorrect) {
    if (isWhite) return "Nossa, nós dois acertamos! Mas eu já estou completamente sem gás...";
    if (isBlue) return "Acertou essa por sorte! Mas meu berimbolo continua superior.";
    if (isPurple) return "Mito de guarda! Belo raciocínio, a luta está fluindo bem.";
    if (isBrown) return "Bons ajustes na postura. Continuo impondo minha pressão.";
    return "A técnica correta protege a integridade de ambos os guerreiros. Oss.";
  }

  // Bot correct, Challenger wrong
  if (p.defenderCorrect && !p.challengerCorrect) {
    if (isWhite) return "Consegui acertar! Acho que a força bruta ainda funciona, né?";
    if (isBlue) return "Vacilou feio! Guardinha de papel, passei e finalizei fácil.";
    if (isPurple) return "Você quebrou sua própria postura ali. Respire e recalcule.";
    if (isBrown) return "Deixou espaço, eu amassei. Quadril colado no tatame.";
    return "O erro do oponente é o convite para a eficiência da alavanca. Oss.";
  }

  // Bot wrong, Challenger correct
  if (!p.defenderCorrect && p.challengerCorrect) {
    if (isWhite) return "Ai meu Deus, eu errei! Achei que podia dar chave de pé na guarda fechada...";
    if (isBlue) return "Ah, o juiz me roubou nessa! Aquilo ali era vantagem com certeza.";
    if (isPurple) return "Excelente transição. Você me pegou em um belo triângulo conceitual.";
    if (isBrown) return "Boa passagem. Conseguiu quebrar meu peso, falha no meu cotovelo.";
    return "Errar no tatame é o caminho do verdadeiro aprendizado. Oss.";
  }

  // Both wrong
  if (isWhite) return "Nenhum de nós dois sabe o que está fazendo, né? Vamos continuar na força!";
  if (isBlue) return "Esquece essa pergunta, o que vale é a porrada estalar!";
  if (isPurple) return "Nossos eixos de gravidade falharam nessa. Vamos para o próximo flow.";
  if (isBrown) return "Duplo nocaute de inteligência. Precisamos fechar mais os cotovelos.";
  return "Se ambos erram, a humildade deve guiar o próximo passo. Oss.";
}
