# Configuração do Google Gemini

## 📝 Como Obter a Chave da API do Gemini

1. **Acesse o Google AI Studio:**
   - Vá para: https://aistudio.google.com/app/apikey
   - Faça login com sua conta Google

2. **Crie uma nova chave de API:**
   - Clique em "Create API Key"
   - Selecione um projeto Google Cloud (ou crie um novo)
   - Copie a chave gerada (formato: `AIza...`)

3. **Configure no arquivo `.env`:**
   ```env
   GEMINI_API_KEY=AIzaSuaChaveAqui
   PORT=3001
   ```

## ✅ Verificação

Após configurar o `.env`, você pode testar a conexão:

```bash
# Testar modelos disponíveis
npm run test-gemini

# Ou iniciar o servidor
npm start
# ou
npm run dev
```

O script `test-gemini` vai:
1. Listar todos os modelos disponíveis na sua conta
2. Testar a geração de uma descrição de produto
3. Mostrar qual modelo foi usado com sucesso

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já está adicionado ao `.gitignore`
- Mantenha sua chave do Gemini segura e privada

## 🐛 Troubleshooting

Se ainda não estiver funcionando:

1. Verifique se o arquivo `.env` está no diretório `backend/`
2. Verifique se a chave está correta (sem espaços extras)
3. Verifique se o servidor foi reiniciado após criar/editar o `.env`
4. Verifique se o `dotenv` está instalado: `npm list dotenv`
5. Verifique se a chave da API está ativa no Google AI Studio

## 📚 Documentação

- Google AI Studio: https://aistudio.google.com/
- Documentação da API Gemini: https://ai.google.dev/docs
- Modelos suportados (tentados em ordem):
  - `gemini-2.5-flash` (mais recente e rápido)
  - `gemini-2.0-flash` (versão estável)
  - `gemini-2.5-pro` (versão Pro mais recente)
  - `gemini-2.0-flash-001` (versão específica)
  - Modelos lite e legados como fallback

## 🔍 Troubleshooting Avançado

Se você continuar tendo problemas, o código tenta automaticamente vários modelos e versões da API. O sistema tentará:
1. Versão `v1` da API (estável)
2. Versão `v1beta` da API (beta)
3. Diferentes modelos na ordem de preferência

Para ver quais modelos estão disponíveis na sua conta, você pode usar a função `listAvailableModels()` no código ou verificar diretamente no Google AI Studio.

