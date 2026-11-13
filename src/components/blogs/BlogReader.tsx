import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Blog } from '../../types';
import { renderMarkdown } from '../../utils/markdown';
import CommentSection from './CommentSection';

interface BlogReaderProps {
  blog: Blog;
  user: any | null;
  setTab: (tab: string) => void;
  onClose: () => void;
}

/** Full-screen reader modal for a single blog column (rendered inside <AnimatePresence>). */
export default function BlogReader({ blog, user, setTab, onClose }: BlogReaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative text-left"
      >

        {/* Close Button at very top */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 border border-white/20 text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Main Scroll content */}
        <div className="overflow-y-auto p-0 flex-1">

          {/* Photo Hero Banner */}
          <div className="relative h-64 sm:h-96 w-full">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-12 text-slate-950">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-[10px] font-mono tracking-widest uppercase font-bold">
                {blog.category.replace('_', ' ')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-semibold mt-3 tracking-tight leading-tight text-white">
                {blog.title}
              </h2>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* Columnist info */}
            <div className="md:col-span-8 space-y-6">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pb-4 border-b border-gray-100 dark:border-white/5">
                <span className="font-semibold text-slate-800 dark:text-white">BY {blog.author_name.toUpperCase()}</span>
                <span>•</span>
                <span>PUBLISHED {new Date(blog.created_at).toLocaleDateString().toUpperCase()}</span>
              </div>

              {/* Editorial Text */}
              <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light space-y-4">
                {renderMarkdown(blog.content)}
              </div>

              {/* Comment threads section */}
              <CommentSection blogId={blog.id} user={user} setTab={setTab} onClose={onClose} />
            </div>

            {/* Sidebar quick links inside blog details modal */}
            <div className="md:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 text-xs text-slate-400 space-y-4">
                <div>
                  <span className="block font-mono mb-1">CATEGORICAL TAG</span>
                  <span className="font-semibold text-slate-800 dark:text-white capitalize">{blog.category.replace('_', ' ')}</span>
                </div>
                {blog.source_url && (
                  <div className="pt-4 border-t border-gray-200/50 dark:border-white/5">
                    <span className="block font-mono mb-2">EXTERNAL SOURCE</span>
                    <a
                      href={blog.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition duration-200 text-center block cursor-pointer"
                    >
                      View Original Discussion
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}
