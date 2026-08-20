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
    <div className="space-y-6 pb-20 lg:pb-12">
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
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Cloud assets stored in public Supabase CDN buckets
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all self-stretch sm:self-auto min-h-[44px]">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Bucket Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['product-images', 'hero-images', 'site-assets'] as const).map(b => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all border whitespace-nowrap min-h-[44px] ${
              bucket === b
                ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
                : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
            }`}
          >
            {b.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <AdminCardSkeleton />
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-curator-coral-light text-curator-coral mx-auto flex items-center justify-center">
            <Image className="w-6 h-6" />
          </div>
          <p className="text-xs text-curator-muted">No files in "{bucket}" bucket yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {mediaList.map((file, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl border border-curator-border overflow-hidden shadow-xs group flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-[#FAF5EE] overflow-hidden">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 sm:p-4 space-y-2 border-t border-curator-border/50">
                <p className="text-[11px] font-mono text-curator-charcoal truncate" title={file.name}>
                  {file.name}
                </p>

                <button
                  type="button"
                  onClick={() => handleCopyUrl(file.url)}
                  className="w-full py-2 px-3 rounded-xl border border-curator-border hover:bg-curator-coral hover:text-white text-curator-charcoal text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[36px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CDN URL</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
