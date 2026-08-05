import { AISettings } from './aiSettingsService';
import { apiPost } from './apiClient';

export interface BlogGenerationParams {
  povOrigin: string;
  povAge: string;
  povGroup: string;
  povGender: string;
  povExclusivity: string;
  selectedTours: string[];
  voiceTranscript: string;
  mediaBase64?: string; // Optional image for models that support it
  language: 'en' | 'es';
}

const buildPrompt = (params: BlogGenerationParams) => {
  const languageTarget = params.language === 'en' ? 'English' : 'Spanish';
  
  return `You are a professional travel blogger writing an engaging, SEO-optimized blog post for a tour company in the Dominican Republic.
  
Write the blog post in ${languageTarget}.

Target Audience / Point of View (POV):
- Origin: ${params.povOrigin || 'General'}
- Age Group: ${params.povAge || 'All ages'}
- Group Type: ${params.povGroup || 'Any'}
- Gender: ${params.povGender || 'Mixed'}
- Style/Budget: ${params.povExclusivity || 'Standard'}

Tours Featured: ${params.selectedTours.length > 0 ? params.selectedTours.join(', ') : 'General Punta Cana Adventures'}

Additional Context (from voice transcript or notes):
"${params.voiceTranscript || 'Focus on the amazing experience, beautiful nature, and great service.'}"

${params.mediaBase64 ? 'An image is also provided. If your model supports vision, please incorporate details from the image into the story.' : ''}

Output Requirements:
- A catchy, click-worthy title (First line, starting with #).
- Engaging introduction.
- Highlights of the tours, tailored to the specific POV and audience.
- A strong call to action at the end to book with us.
- Use formatting (bolding, bullet points) where appropriate.
- Do not include any meta-commentary like "Here is your blog post". Just output the content.
`;
};

export const generateBlogPost = async (
  settings: AISettings,
  params: BlogGenerationParams
): Promise<{ title: string; content: string }> => {
  const provider = settings.activeProvider;
  const prompt = buildPrompt(params);

  try {
    let generatedText = '';

    if (provider === 'gemini') {
      generatedText = await generateWithGemini(settings.gemini, prompt, params.mediaBase64);
    } else if (provider === 'cloudflare') {
      generatedText = await generateWithCloudflare(settings.cloudflare, prompt);
    } else if (provider === 'openrouter') {
      generatedText = await generateWithOpenRouter(settings.openrouter, prompt, params.mediaBase64);
    } else {
      throw new Error('Unknown AI provider');
    }

    // Parse title and content
    const lines = generatedText.split('\n');
    let title = 'New Blog Post';
    let content = generatedText;

    if (lines[0].startsWith('#')) {
      title = lines[0].replace(/^#+\s*/, '').trim();
      content = lines.slice(1).join('\n').trim();
    }

    return { title, content };
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
};

const generateWithGemini = async (config: any, prompt: string, mediaBase64?: string): Promise<string> => {
  if (!config.apiKey) throw new Error('Gemini API Key missing');
  
  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  if (mediaBase64 && config.selectedModel.includes('pro')) {
    // Basic base64 handling - assuming image/jpeg for simplicity in this integration
    const base64Data = mediaBase64.split(',')[1] || mediaBase64;
    contents[0].parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.selectedModel}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const generateWithCloudflare = async (config: any, prompt: string): Promise<string> => {
  if (!config.accountId || !config.apiKey) throw new Error('Cloudflare Account ID or API Token missing');
  
  const payload = {
    messages: [
      { role: 'system', content: 'You are a professional travel blogger.' },
      { role: 'user', content: prompt }
    ]
  };

  const data = await apiPost<any>('cf-ai', {
    accountId: config.accountId,
    token: config.apiKey,
    model: config.selectedModel,
    payload
  });

  return data.result?.response || '';
};

const generateWithOpenRouter = async (config: any, prompt: string, mediaBase64?: string): Promise<string> => {
  if (!config.apiKey) throw new Error('OpenRouter API Key missing');

  const content: any = [
    { type: 'text', text: prompt }
  ];

  if (mediaBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: mediaBase64 }
    });
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.selectedModel,
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.statusText}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
};
