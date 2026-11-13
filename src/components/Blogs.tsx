import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Blog } from '../types';
import BlogCard, { FeaturedBlogCard } from './blogs/BlogCard';
import BlogReader from './blogs/BlogReader';

interface BlogsProps {
  setTab: (tab: string) => void;
  user: any | null;
  isHome?: boolean;
}

const bulletins = [
  { href: 'https://www.reddit.com/r/JapanTravel/comments/12yby9k/guide_on_how_to_book_and_experience_ryokans/', title: "Unlocking Kyoto's Private Ryokans", meta: '3 MIN READ • REDDIT DISCUSSION' },
  { href: 'https://www.reddit.com/r/travel/comments/15k6p8u/scenic_trains_in_switzerland_which_are_the_best/', title: 'The Ultimate Swiss Train Scenic Routes', meta: '5 MIN READ • REDDIT DISCUSSIONS' },
  { href: 'https://www.quora.com/Which-is-better-North-Goa-or-South-Goa', title: 'Why We Prefer South Goa over the North', meta: '4 MIN READ • QUORA ANSWER' },
];

export default function Blogs({ setTab, user, isHome = false }: BlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  // Blog id the reader was most recently opened for, so a slow
  // GET /api/blogs/:id response can never clobber a newer selection.
  const requestedBlogIdRef = useRef<string | null>(null);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
      // Initialize mock likes
      const initialLikes: Record<string, number> = {};
      data.forEach((b: Blog) => { initialLikes[b.id] = Math.floor(Math.random() * 50) + 12; });
      setLikes(initialLikes);
    } catch (err) {
      console.error('Failed to load blogs', err);
    }
  };

  // Open the reader on the list item, then pull the fresh record from
  // GET /api/blogs/:id and prefer its title/content/category/image for display.
  // On any failure we silently keep the list item (no visible error).
  const openBlog = async (blog: Blog) => {
    requestedBlogIdRef.current = blog.id;
    setSelectedBlog(blog);
    try {
      const res = await fetch(`/api/blogs/${blog.id}`);
      if (!res.ok) return;
      const fresh = (await res.json()) as Blog;
      // Stale-response guard: only apply if this is still the requested blog.
      if (requestedBlogIdRef.current !== blog.id || !fresh || fresh.id !== blog.id) return;
      setSelectedBlog(prev =>
        prev && prev.id === blog.id
          ? { ...prev, title: fresh.title, content: fresh.content, category: fresh.category, image_url: fresh.image_url }
          : prev
      );
    } catch {
      // Silently keep the list item.
    }
  };

  const closeBlog = () => {
    requestedBlogIdRef.current = null;
    setSelectedBlog(null);
  };

  const toggleLike = (blogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = liked[blogId];
    setLiked(prev => ({ ...prev, [blogId]: !isLiked }));
    setLikes(prev => ({
      ...prev,
      [blogId]: isLiked ? prev[blogId] - 1 : prev[blogId] + 1
    }));
  };

  const cardProps = (blog: Blog) => ({
    liked: !!liked[blog.id],
    likeCount: likes[blog.id] || 0,
    onToggleLike: toggleLike,
    onSelect: openBlog,
  });

  // Divide into Featured article (first) and minor articles (rest)
  const featuredBlog = blogs[0];
  const listBlogs = blogs.slice(1);

  return (
    <div className={`${isHome ? 'py-12 md:py-16' : 'py-24 min-h-screen'} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100`} id="blogs-magazine">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4 text-slate-900 dark:text-white">The Travel Log & Journal</h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 max-w-2xl mx-auto text-base font-light">
            Dive into premium travel columns, tactical packing guidelines, and rich culinary journals written by veteran globe-trotters.
          </motion.p>
        </div>

        {blogs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">Loading publication issues...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT Column: Magazine grid */}
            <div className="lg:col-span-8 space-y-12">
              {/* Featured Large Article */}
              {featuredBlog && (
                <FeaturedBlogCard blog={featuredBlog} {...cardProps(featuredBlog)} />
              )}
              {/* Minor Articles Below */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {listBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} {...cardProps(blog)} />
                ))}
              </div>
            </div>

            {/* RIGHT Column: Sidebar publication info */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:12px_12px]"></div>
                <h3 className="text-xl font-display font-medium mb-4 relative z-10">Featured Columnist</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light mb-6 relative z-10">
                  Are you a professional travel writer, digital nomad or culinary anthropologist? Join our elite contributor list to publish your stories to Trippy members.
                </p>
                <button className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold relative z-10 transition">Apply for Contributor Account</button>
              </div>

              {/* Subscriptions info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 text-left">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Trending Bulletins</h3>
                <div className="space-y-4">
                  {bulletins.map((item, i) => (
                    <div key={item.href} className={`flex gap-4 items-start${i < bulletins.length - 1 ? ' pb-4 border-b border-gray-100 dark:border-white/5' : ''}`}>
                      <span className="text-2xl font-display font-bold text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-800 dark:text-white hover:text-amber-500 transition cursor-pointer">{item.title}</a>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Single Detailed Blog Column View Overlay */}
        <AnimatePresence>
          {selectedBlog && (
            <BlogReader blog={selectedBlog} user={user} setTab={setTab} onClose={closeBlog} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
