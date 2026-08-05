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

Output Requirements (STRICT):
- Line 1 MUST be the catchy, click-worthy blog post title, prefixed exactly with "# ".
- Line 2 MUST be a comma-separated list of exactly 3 to 5 relevant tags, prefixed exactly with "Tags: " (e.g., Tags: adventure, culture, beach).
- Line 3 onwards MUST be the engaging blog post body, fully formatted using standard Markdown (use bolding, bullet points, italics, and headers where appropriate).
- Do not include any meta-commentary like "Here is your blog post" or "Enjoy reading". Just output the title, tags, and content exactly as requested.
`;
};

export const generateBlogPost = async (
  settings: AISettings,
  params: BlogGenerationParams
): Promise<{ title: string; content: string; tags: string[] }> => {
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

    // Parse title, tags and content
    const lines = generatedText.split('\n').map(l => l.trim());
    let title = 'New Blog Post';
    let tags: string[] = [];
    let contentLines: string[] = [];
    
    let lineIdx = 0;
    
    // 1. Find Title
    while (lineIdx < lines.length) {
      if (lines[lineIdx].startsWith('#')) {
        title = lines[lineIdx].replace(/^#+\s*/, '');
        lineIdx++;
        break;
      }
      // If we find tags or content first, assume title is missing and just start taking content
      if (lines[lineIdx].toLowerCase().startsWith('tags:')) {
        break;
      }
      if (lines[lineIdx] !== '') {
        title = lines[lineIdx];
        lineIdx++;
        break;
      }
      lineIdx++;
    }

    // 2. Find Tags
    while (lineIdx < lines.length) {
      if (lines[lineIdx].toLowerCase().startsWith('tags:')) {
        const tagStr = lines[lineIdx].replace(/^tags:\s*/i, '');
        tags = tagStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
        lineIdx++;
        break;
      }
      // If we hit a non-empty line that isn't tags, assume no tags and it's content
      if (lines[lineIdx] !== '') {
        break;
      }
      lineIdx++;
    }

    // 3. The rest is content
    while (lineIdx < lines.length) {
      contentLines.push(lines[lineIdx]);
      lineIdx++;
    }

    const content = contentLines.join('\n').trim();

    return { title, content, tags };
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
