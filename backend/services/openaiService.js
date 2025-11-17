const axios = require('axios');

// Gerar descrição de produto usando Google Gemini
async function generateProductDescription(nomeProduto) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  // Lista de modelos para tentar (em ordem de preferência)
  // Atualizado com os modelos disponíveis na API (versão 2.0 e 2.5)
  const models = [
    'gemini-2.5-flash',           // Modelo mais recente e rápido
    'gemini-2.0-flash',           // Versão 2.0 flash
    'gemini-2.5-pro',             // Versão Pro mais recente
    'gemini-2.0-flash-001',       // Versão específica 2.0
    'gemini-2.5-flash-lite',      // Versão lite mais recente
    'gemini-2.0-flash-lite',      // Versão lite 2.0
    'gemini-2.0-flash-lite-001',  // Versão lite específica
    // Modelos legados (caso ainda estejam disponíveis em algumas contas)
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  // Tentar primeiro com v1 (versão estável)
  const apiVersions = ['v1', 'v1beta'];

  let lastError = null;

  for (const apiVersion of apiVersions) {
    for (const model of models) {
      try {
        const prompt = `Gere UMA ÚNICA descrição curta e profissional para o produto "${nomeProduto}". A descrição deve ter no máximo 150 caracteres, ser direta, destacar as principais características e ser atrativa para vendas. Retorne APENAS a descrição, sem explicações, sem opções múltiplas, sem formatação markdown.`;

        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await axios.post(
          url,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 100,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Verificar se a resposta tem a estrutura esperada
        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
          console.warn(`Resposta inválida do modelo ${model} (${apiVersion})`);
          continue;
        }

        const candidate = response.data.candidates[0];
        if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.warn(`Estrutura de resposta inválida do modelo ${model} (${apiVersion})`);
          continue;
        }

        let description = candidate.content.parts[0]?.text?.trim();
        if (description) {
          // Limpar formatação markdown e pegar apenas a primeira linha útil
          description = description
            .replace(/\*\*/g, '') // Remove negrito markdown
            .replace(/\*/g, '')   // Remove itálico markdown
            .replace(/^#+\s*/gm, '') // Remove headers markdown
            .replace(/^[-*]\s*/gm, '') // Remove listas markdown
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.match(/^(Opção|Opção \d+|\*\*Opção)/i))
            .join(' ')
            .trim();
          
          // Limitar a 150 caracteres
          if (description.length > 150) {
            description = description.substring(0, 147) + '...';
          }
          
          console.log(`✅ Modelo usado: ${model} (${apiVersion})`);
          return description;
        }
        
        // Se chegou aqui, a resposta não tem texto
        console.warn(`Resposta sem texto do modelo ${model} (${apiVersion})`);
        continue;
      } catch (error) {
        lastError = error;
        // Se o erro não for "model not found", pode ser outro problema
        const errorMessage = error.response?.data?.error?.message || error.message;
        if (!errorMessage.includes('not found') && !errorMessage.includes('not supported')) {
          // É um erro diferente, não continuar tentando outros modelos
          console.error(`Erro ao gerar descrição com Gemini (${model} - ${apiVersion}):`, errorMessage);
          throw new Error(`Erro ao gerar descrição do produto: ${errorMessage}`);
        }
        // Continuar para o próximo modelo
        continue;
      }
    }
  }

  // Se chegou aqui, nenhum modelo funcionou
  console.error('Erro ao gerar descrição com Gemini:', lastError?.response?.data || lastError?.message);
  throw new Error('Nenhum modelo do Gemini disponível. Verifique sua chave de API e os modelos disponíveis.');
}

// Função auxiliar para listar modelos disponíveis (útil para debug)
async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.models || [];
  } catch (error) {
    console.error('Erro ao listar modelos:', error.response?.data || error.message);
    return [];
  }
}

module.exports = {
  generateProductDescription,
  listAvailableModels,
};

