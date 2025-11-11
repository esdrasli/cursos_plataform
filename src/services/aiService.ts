// Serviço para integração com IA
// Por padrão, usa uma API mock. Para usar OpenAI ou outra API, configure a variável de ambiente VITE_AI_API_KEY

interface AIGenerateRequest {
  prompt: string;
  courseTitle?: string;
  courseDescription?: string;
  context?: string;
}

interface AIGenerateResponse {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image?: string;
  };
  sections?: Array<{
    type: string;
    content: string;
  }>;
  layout?: {
    heroLayout?: 'centered' | 'split' | 'minimal';
    heroBackground?: 'gradient' | 'solid' | 'image';
    colorScheme?: 'primary' | 'bold' | 'elegant' | 'vibrant';
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography?: 'bold' | 'elegant' | 'modern';
    spacing?: 'compact' | 'comfortable' | 'spacious';
    ctaStyle?: 'small' | 'medium' | 'large';
    ctaPosition?: 'left' | 'center' | 'right';
  };
}

// Função para gerar conteúdo de landing page usando IA
export const generateLandingPageContent = async (
  request: AIGenerateRequest
): Promise<AIGenerateResponse> => {
  try {
    // Sempre usar o backend (que tem acesso a APIs gratuitas)
    return await generateWithBackend(request);
  } catch (error) {
    console.error('Erro ao gerar conteúdo com IA:', error);
    // Fallback para mock em caso de erro
    return await generateMockContent(request);
  }
};

// Geração via backend (recomendado - usa API gratuita)
async function generateWithBackend(
  request: AIGenerateRequest
): Promise<AIGenerateResponse> {
  // Importar dinamicamente para evitar dependência circular
  const { creatorAPI } = await import('./api');
  
  return await creatorAPI.generateAIContent({
    prompt: request.prompt,
    courseTitle: request.courseTitle,
    courseDescription: request.courseDescription,
  });
}

// Geração com OpenAI
async function generateWithOpenAI(
  request: AIGenerateRequest,
  apiKey: string
): Promise<AIGenerateResponse> {
  const systemPrompt = `Você é um especialista em copywriting e marketing digital. 
Crie conteúdo persuasivo para landing pages de cursos online em português brasileiro.
O conteúdo deve ser convincente, usar gatilhos mentais e ser otimizado para conversão.`;

  const userPrompt = `Crie uma landing page de vendas para o curso: "${request.courseTitle || 'Curso Online'}"
${request.courseDescription ? `Descrição do curso: ${request.courseDescription}` : ''}

${request.prompt}

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "hero": {
    "title": "Título principal persuasivo (máximo 60 caracteres)",
    "subtitle": "Subtítulo convincente que destaca benefícios (máximo 150 caracteres)",
    "cta": "Texto do botão de ação (máximo 30 caracteres)",
    "image": "URL de imagem relacionada ou deixe vazio"
  },
  "sections": [
    {
      "type": "benefits",
      "content": "Lista de benefícios principais do curso"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // Tentar extrair JSON da resposta
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Resposta não contém JSON válido');
  } catch (parseError) {
    console.error('Erro ao parsear resposta:', content);
    throw new Error('Erro ao processar resposta da IA');
  }
}

// Geração com API customizada
async function generateWithCustomAPI(
  request: AIGenerateRequest,
  apiKey: string,
  apiUrl: string
): Promise<AIGenerateResponse> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: request.prompt,
      courseTitle: request.courseTitle,
      courseDescription: request.courseDescription,
      context: request.context,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.statusText}`);
  }

  return await response.json();
}

// Geração mock para desenvolvimento (sem API key)
async function generateMockContent(
  request: AIGenerateRequest
): Promise<AIGenerateResponse> {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500));

  const courseTitle = request.courseTitle || 'Curso Online';
  const courseDesc = request.courseDescription || '';

  // Gerar conteúdo baseado no prompt e informações do curso
  const titles = [
    `Domine ${courseTitle} e Transforme sua Carreira`,
    `${courseTitle}: Do Zero ao Profissional em Tempo Recorde`,
    `Aprenda ${courseTitle} com o Método Mais Eficaz do Mercado`,
    `Torne-se Especialista em ${courseTitle} em Apenas Algumas Semanas`,
  ];

  const subtitles = [
    `Descubra o método comprovado que já transformou a vida de milhares de alunos. Aprenda na prática e conquiste resultados reais.`,
    `Não perca mais tempo com conteúdo desatualizado. Este é o curso mais completo e atualizado do mercado.`,
    `Junte-se a centenas de profissionais que já mudaram de vida com este curso. Garantia de 7 dias ou seu dinheiro de volta.`,
    `Acesso vitalício, suporte exclusivo e certificado reconhecido. Tudo que você precisa para começar hoje mesmo.`,
  ];

  const ctas = [
    'Quero Garantir Minha Vaga',
    'Começar Agora',
    'Garantir Acesso',
    'Quero Me Inscrever',
  ];

  return {
    hero: {
      title: titles[Math.floor(Math.random() * titles.length)],
      subtitle: subtitles[Math.floor(Math.random() * subtitles.length)],
      cta: ctas[Math.floor(Math.random() * ctas.length)],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
    },
    sections: [
      {
        type: 'benefits',
        content: 'Acesso vitalício • Certificado reconhecido • Suporte exclusivo • Atualizações gratuitas',
      },
    ],
  };
}

