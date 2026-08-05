import React, { useState, useEffect } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube, FaTwitter, FaLinkedin, FaTrash, FaPlus, FaLink } from 'react-icons/fa';
import {
  getSocialMediaData,
  saveSocialMediaData,
  SocialMediaAccount,
  SocialMediaVideo
} from '../../services/socialMediaService';
import { getSocialApiSettings, saveSocialApiSettings, SocialApiSettings } from '../../services/socialApiSettingsService';
import { FaSave, FaCheck, FaFacebookSquare } from 'react-icons/fa';

interface SocialMediaAdminProps {
  onSave?: () => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <FaInstagram />,
  tiktok: <FaTiktok />,
  facebook: <FaFacebook />,
  youtube: <FaYoutube />,
  twitter: <FaTwitter />,
  linkedin: <FaLinkedin />
};

const platformColors: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-500',
  tiktok: 'from-black to-slate-800',
  facebook: 'from-blue-600 to-blue-800',
  youtube: 'from-red-600 to-red-800',
  twitter: 'from-blue-400 to-blue-600',
  linkedin: 'from-blue-700 to-blue-900'
};

const SocialMediaAdmin: React.FC<SocialMediaAdminProps> = ({ onSave }) => {
  const [data, setData] = useState({ accounts: [] as SocialMediaAccount[], videos: [] as SocialMediaVideo[] });
  const [newAccount, setNewAccount] = useState({
    platform: 'instagram' as const,
    username: '',
    url: ''
  });
  const [newVideo, setNewVideo] = useState({
    platform: 'instagram' as const,
    title: '',
    url: '',
    description: ''
  });

  const [apiSettings, setApiSettings] = useState<SocialApiSettings | null>(null);
  const [savingApi, setSavingApi] = useState(false);
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  const handleSaveApiSettings = async () => {
    if (!apiSettings) return;
    setSavingApi(true);
    setApiSaveSuccess(false);
    try {
      await saveSocialApiSettings(apiSettings);
      setApiSaveSuccess(true);
      setTimeout(() => setApiSaveSuccess(false), 3000);
      onSave?.();
    } catch (error) {
      console.error('Failed to save API settings', error);
    } finally {
      setSavingApi(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const socialData = await getSocialMediaData();
      setData(socialData);
      
      const apiSettingsData = await getSocialApiSettings();
      setApiSettings(apiSettingsData);
    };
    loadData();
  }, []);

  const handleAddAccount = async () => {
    if (newAccount.username && newAccount.url) {
      const updatedData = { ...data };
      const existingIndex = updatedData.accounts.findIndex(a => a.platform === newAccount.platform);
      
      const account: SocialMediaAccount = {
        ...newAccount,
        enabled: true
      };

      if (existingIndex >= 0) {
        updatedData.accounts[existingIndex] = account;
      } else {
        updatedData.accounts.push(account);
      }

      await saveSocialMediaData(updatedData);
      setData(updatedData);
      setNewAccount({ platform: 'instagram', username: '', url: '' });
      onSave?.();
    }
  };

  const handleRemoveAccount = async (platform: string) => {
    const updatedData = {
      ...data,
      accounts: data.accounts.filter(a => a.platform !== platform)
    };
    await saveSocialMediaData(updatedData);
    setData(updatedData);
    onSave?.();
  };

  const handleAddVideo = async () => {
    if (newVideo.title && newVideo.url) {
      const updatedData = { ...data };
      updatedData.videos.push({
        id: Date.now().toString(),
        ...newVideo,
        createdAt: new Date().toISOString().split('T')[0]
      });
      await saveSocialMediaData(updatedData);
      setData(updatedData);
      setNewVideo({ platform: 'instagram', title: '', url: '', description: '' });
      onSave?.();
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    const updatedData = {
      ...data,
      videos: data.videos.filter(v => v.id !== videoId)
    };
    await saveSocialMediaData(updatedData);
    setData(updatedData);
    onSave?.();
  };

  const toggleAccountEnabled = async (platform: string) => {
    const updatedData = { ...data };
    const account = updatedData.accounts.find(a => a.platform === platform);
    if (account) {
      account.enabled = !account.enabled;
      await saveSocialMediaData(updatedData);
      setData(updatedData);
      onSave?.();
    }
  };

  return (
    <div className="w-full space-y-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Social Media Management</h2>

      {/* Social Media API Integrations */}
      {apiSettings && (
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <FaFacebookSquare /> Facebook & Instagram API
            </h3>
            <button
              onClick={handleSaveApiSettings}
              disabled={savingApi}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {savingApi ? 'Saving...' : apiSaveSuccess ? <><FaCheck /> Saved</> : <><FaSave /> Save API Settings</>}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-950/50 rounded-xl p-6">
            <div className="md:col-span-2">
              <p className="text-sm text-blue-200 mb-4">
                Configure your Facebook Developer App to enable automatic publishing of AI generated blogs. You will need a Graph API Long-Lived Token with <code>pages_manage_posts</code> and <code>instagram_content_publish</code> permissions.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Facebook App ID</label>
              <input
                type="text"
                value={apiSettings.facebookAppId}
                onChange={(e) => setApiSettings({ ...apiSettings, facebookAppId: e.target.value })}
                placeholder="App ID"
                className="w-full px-4 py-2 bg-blue-800/50 border-2 border-blue-500 rounded-lg text-white focus:outline-none placeholder-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Facebook App Secret</label>
              <input
                type="password"
                value={apiSettings.facebookAppSecret}
                onChange={(e) => setApiSettings({ ...apiSettings, facebookAppSecret: e.target.value })}
                placeholder="App Secret"
                className="w-full px-4 py-2 bg-blue-800/50 border-2 border-blue-500 rounded-lg text-white focus:outline-none placeholder-blue-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Graph API Access Token (Long-Lived)</label>
              <input
                type="password"
                value={apiSettings.facebookLongLivedToken}
                onChange={(e) => setApiSettings({ ...apiSettings, facebookLongLivedToken: e.target.value })}
                placeholder="EAAB..."
                className="w-full px-4 py-2 bg-blue-800/50 border-2 border-blue-500 rounded-lg text-white focus:outline-none placeholder-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Facebook Page ID (For publishing)</label>
              <input
                type="text"
                value={apiSettings.selectedFacebookPageId}
                onChange={(e) => setApiSettings({ ...apiSettings, selectedFacebookPageId: e.target.value })}
                placeholder="e.g. 1029384756"
                className="w-full px-4 py-2 bg-blue-800/50 border-2 border-blue-500 rounded-lg text-white focus:outline-none placeholder-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Instagram Business Account ID</label>
              <input
                type="text"
                value={apiSettings.selectedInstagramAccountId}
                onChange={(e) => setApiSettings({ ...apiSettings, selectedInstagramAccountId: e.target.value })}
                placeholder="e.g. 17841400000000"
                className="w-full px-4 py-2 bg-blue-800/50 border-2 border-blue-500 rounded-lg text-white focus:outline-none placeholder-blue-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Social Media Accounts Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaLink /> Social Media Accounts
        </h3>

        {/* Add new account */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 space-y-4">
          <h4 className="font-bold text-lg">Add Account</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Platform</label>
              <select
                value={newAccount.platform}
                onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700 border-2 border-pink-500 rounded-lg text-white focus:outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <input
                type="text"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                placeholder="e.g., @yourhandle"
                className="w-full px-4 py-2 bg-slate-700 border-2 border-pink-500 rounded-lg text-white focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Profile URL</label>
              <input
                type="url"
                value={newAccount.url}
                onChange={(e) => setNewAccount({ ...newAccount, url: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-4 py-2 bg-slate-700 border-2 border-pink-500 rounded-lg text-white focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleAddAccount}
            disabled={!newAccount.username || !newAccount.url}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="inline mr-2" /> Add Account
          </button>
        </div>

        {/* Current accounts */}
        <div>
          <h4 className="font-bold text-lg mb-4">Active Accounts ({data.accounts.length})</h4>
          {data.accounts.length > 0 ? (
            <div className="space-y-3">
              {data.accounts.map((account) => (
                <div
                  key={account.platform}
                  className={`bg-gradient-to-r ${platformColors[account.platform]} rounded-lg p-4 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{platformIcons[account.platform]}</div>
                    <div>
                      <p className="font-bold text-lg capitalize">{account.platform}</p>
                      <p className="text-sm opacity-90">{account.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAccountEnabled(account.platform)}
                      className={`px-4 py-2 rounded font-bold transition-all ${
                        account.enabled
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {account.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded font-bold transition-all"
                    >
                      Visit
                    </a>
                    <button
                      onClick={() => handleRemoveAccount(account.platform)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No social media accounts added yet</p>
          )}
        </div>
      </div>

      {/* Social Media Videos Section */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaYoutube /> Social Media Videos
        </h3>

        {/* Add new video */}
        <div className="bg-purple-800/50 rounded-xl p-6 mb-6 space-y-4">
          <h4 className="font-bold text-lg">Add Video</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Platform</label>
              <select
                value={newVideo.platform}
                onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value as any })}
                className="w-full px-4 py-2 bg-purple-700 border-2 border-blue-400 rounded-lg text-white focus:outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Video Title</label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="e.g., Amazing Quad Adventure"
                className="w-full px-4 py-2 bg-purple-700 border-2 border-blue-400 rounded-lg text-white focus:outline-none placeholder-purple-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Video URL</label>
              <input
                type="url"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                placeholder="https://www.tiktok.com/@yourhandle/video/123456789"
                className="w-full px-4 py-2 bg-purple-700 border-2 border-blue-400 rounded-lg text-white focus:outline-none placeholder-purple-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                placeholder="Brief description of this video..."
                rows={3}
                className="w-full px-4 py-2 bg-purple-700 border-2 border-blue-400 rounded-lg text-white focus:outline-none placeholder-purple-300 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleAddVideo}
            disabled={!newVideo.title || !newVideo.url}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="inline mr-2" /> Add Video
          </button>
        </div>

        {/* Current videos */}
        <div>
          <h4 className="font-bold text-lg mb-4">Current Videos ({data.videos.length})</h4>
          {data.videos.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {data.videos.map((video) => (
                <div key={video.id} className="bg-purple-700/50 rounded-lg overflow-hidden border-2 border-purple-600">
                  <div className="h-40 bg-slate-900 flex items-center justify-center">
                    {platformIcons[video.platform] && (
                      <div className="text-6xl opacity-50">{platformIcons[video.platform]}</div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h5 className="font-bold text-white">{video.title}</h5>
                    <p className="text-sm text-purple-200 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-purple-300">
                      <span className="capitalize font-semibold">{video.platform}</span>
                      <span>{video.createdAt}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-purple-600">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded text-center hover:bg-blue-700 transition-all"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleRemoveVideo(video.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-purple-300 italic">No videos added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAdmin;
