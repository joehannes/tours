import { apiGet, apiPut } from './apiClient';

export interface SocialApiSettings {
  facebookAppId: string;
  facebookAppSecret: string;
  facebookUserToken: string; // The short-lived token from the user
  facebookLongLivedToken: string; // The exchanged long-lived token
  selectedFacebookPageId: string;
  selectedInstagramAccountId: string;
}

const defaultSocialApiSettings: SocialApiSettings = {
  facebookAppId: '',
  facebookAppSecret: '',
  facebookUserToken: '',
  facebookLongLivedToken: '',
  selectedFacebookPageId: '',
  selectedInstagramAccountId: '',
};

const normalizeSettings = (input: unknown): SocialApiSettings => {
  const data = (input as Record<string, unknown>)?.record ?? input;
  if (!data || typeof data !== 'object') return defaultSocialApiSettings;
  
  return {
    ...defaultSocialApiSettings,
    ...(data as Partial<SocialApiSettings>),
  };
};

export const getSocialApiSettings = async (): Promise<SocialApiSettings> => {
  try {
    const data = await apiGet<unknown>('social-api-settings');
    return normalizeSettings(data);
  } catch (error) {
    console.warn('Failed to fetch social API settings:', error);
    return defaultSocialApiSettings;
  }
};

export const saveSocialApiSettings = async (settings: SocialApiSettings): Promise<SocialApiSettings> => {
  try {
    await apiPut<unknown>('social-api-settings', settings);
    return settings;
  } catch (error) {
    console.error('Error saving social API settings:', error);
    throw error;
  }
};
