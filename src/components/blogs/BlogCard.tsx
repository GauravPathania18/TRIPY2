import React from 'react';
import { motion } from 'motion/react';
import { User, Calendar, ChevronRight, Heart } from 'lucide-react';
import { Blog } from '../../types';

interface BlogCardProps {
  // `key` must be declared here because this project ships without @types/react,
  // so there is no JSX.IntrinsicAttributes to supply it for typed components.
  // React strips key before the component ever runs, so it is never read.
  key?: React.Key;
  blog: Blog;
  liked: boolean;
  likeCount: number;
  onToggleLike: (blogId: string, e: React.MouseEvent) => void;
  onSelect: (blog: Blog) => void;
}

/** Featured hero card — the large "FEATURED ISSUE" article at the top of the magazine grid. */
export function FeaturedBlogCard({ blog, liked, likeCount, onToggleLike, onSelect }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(blog)}
      className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/5 dark:shadow-none group cursor-pointer text-left"
    >
      <div className="relative h-96 overflow-hidden">
        <img
          src={blog.image_url}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase font-bold bg-white text-slate-950">
            FEATURED ISSUE
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-500" />
            {blog.author_name}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span>•</span>
          <span className="uppercase tracking-wider text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded">
            {blog.category.replace('_', ' ')}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-amber-500 transition mb-4">
          {blog.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-6 line-clamp-3">
          Goa is universally loved for its sand and sea, but its real treasure lies in its kitchens. Goan cuisine is a fascinating, centuries-old fusion of traditional Hindu Saraswat recipes and Portuguese colonial influences...
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-amber-500 font-semibold group-hover:translate-x-1 transition-transform">
            Read full column <ChevronRight className="w-4 h-4" />
          </span>
          <div className="flex gap-4">
            <button onClick={(e) => onToggleLike(blog.id, e)} className="flex items-center gap-1 hover:text-red-500 transition">
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Standard grid card for the minor articles below the featured hero. */
export default function BlogCard({ blog, liked, likeCount, onToggleLike, onSelect }: BlogCardProps) {
  return (
    <div
      onClick={() => onSelect(blog)}
      className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-md shadow-gray-200/5 group cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="h-48 overflow-hidden">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
          />
        </div>
        <div className="p-5">
          <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase bg-amber-500/5 px-2 py-0.5 rounded">
            {blog.category.replace('_', ' ')}
          </span>
          <h3 className="text-lg font-display font-medium text-slate-900 dark:text-white mt-3 line-clamp-2 group-hover:text-amber-500 transition">
            {blog.title}
          </h3>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>{blog.author_name.split(' ')[0]}</span>
        <button onClick={(e) => onToggleLike(blog.id, e)} className="flex items-center gap-1 hover:text-red-500">
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
}
