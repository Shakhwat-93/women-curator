import React, { useState, useEffect } from 'react';
import { Upload, Copy, Image, Sparkles } from 'lucide-react';
import { mediaService } from '../../lib/api';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminCardSkeleton } from '../components/AdminSkeleton';

export const MediaPage: React.FC = () => {
  const [bucket, setBucket] = useState<'product-images' | 'hero-images' | 'site-assets'>('product-images');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error } = useAdminToast();

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const data = await mediaService.listMedia(bucket);
      setMediaList(data);
    } catch {
      error('Failed to load media files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [bucket]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const file = files[0];
      const res = await mediaService.uploadFile(file, bucket);
      if (res.success) {
        success('Image uploaded to Supabase Storage!');
        loadMedia();
      } else {
        error(res.error || 'Upload failed');
      }
    } catch {
      error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    success('Public image URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Supabase Cloud Storage</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Media Library
          </h1>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Asset'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Bucket Selector Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-curator-border max-w-md shadow-sm text-xs font-semibold">
        {[
          { key: 'product-images', label: 'Product Images' },
          { key: 'hero-images', label: 'Hero Banners' },
          { key: 'site-assets', label: 'Site Assets' }
        ].map(b => (
          <button
            key={b.key}
            onClick={() => setBucket(b.key as any)}
            className={`flex-1 py-2 rounded-full transition-all ${
              bucket === b.key
                ? 'bg-curator-coral text-white shadow-sm font-bold'
                : 'text-curator-muted hover:text-curator-charcoal'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <AdminCardSkeleton />
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <Image className="w-10 h-10 text-curator-muted mx-auto" />
          <h4 className="font-serif text-base font-bold text-curator-charcoal">No Assets in Bucket</h4>
          <p className="text-xs text-curator-muted">
            Click <strong>Upload Asset</strong> above to upload photoshoot photos to Supabase Storage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[2rem] p-3 border border-curator-border shadow-sm flex flex-col justify-between group overflow-hidden"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-curator-bg mb-3 relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono font-semibold text-curator-charcoal truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-curator-muted font-mono">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="text-curator-coral font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
