import { useState } from 'react';
import { X, Plus, ExternalLink, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Resource } from '@/types';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
  onAddResource: (title: string, url: string) => void;
  onDeleteResource: (resourceId: string) => void;
}

export function ResourceModal({ 
  isOpen, 
  onClose, 
  resources, 
  onAddResource, 
  onDeleteResource 
}: ResourceModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) {
      alert('Please fill in both title and URL');
      return;
    }

    onAddResource(title, url);
    setTitle('');
    setUrl('');
  };

  const handleDownload = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-3xl w-full max-w-2xl shadow-2xl animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)] overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Learning Resources</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Add Resource Section */}
            <div className="bg-purple-50/50 rounded-2xl p-5 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Resource
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resourceTitle" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                    Resource Title
                  </Label>
                  <Input
                    id="resourceTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., React Documentation, Tutorial Video"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-600 focus:ring-purple-600/20 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="resourceUrl" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                    URL / Link
                  </Label>
                  <Input
                    id="resourceUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/resource"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-600 focus:ring-purple-600/20 bg-white"
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </Button>
              </div>
            </div>

            {/* Resources List */}
            <div>
              <h3 className="text-lg font-bold text-[#2c1810] mb-4">
                Saved Resources ({resources.length})
              </h3>
              {resources.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="text-5xl mb-3">📚</div>
                  <p className="text-gray-600 font-medium">No resources added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add your first learning resource above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#2c1810] mb-1 truncate">
                            {resource.title}
                          </h4>
                          
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{resource.url}</span>
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            Added: {new Date(resource.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDownload(resource)}
                            className="p-2 bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg transition-all duration-200"
                            title="Open resource"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteResource(resource.id)}
                            className="p-2 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white rounded-lg transition-all duration-200"
                            title="Delete resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex justify-end">
            <Button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}