import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, User, Calendar, MessageSquare, Send, ChevronRight, XCircle, ArrowLeft, Heart, Search } from 'lucide-react';
import { Blog, BlogComment } from '../types';

const parseInlineStyles = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-white">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { idx: number; items: string[] } | null = null;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('###')) {
      if (currentList) {
        elements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 space-y-2 my-4 text-slate-600 dark:text-slate-300">
            {currentList.items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed text-sm sm:text-base font-light">{parseInlineStyles(item)}</li>
            ))}
          </ul>
        );
        currentList = null;
      }
      const headingText = trimmed.replace('###', '').trim();
      elements.push(
        <h3 key={idx} className="text-lg font-display font-semibold text-slate-900 dark:text-white pt-6 pb-2">
          {headingText}
        </h3>
      );
    } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      const itemText = trimmed.substring(1).trim();
      if (!currentList) {
        currentList = { idx, items: [] };
      }
      currentList.items.push(itemText);
    } else if (trimmed === '') {
      if (currentList) {
        elements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 space-y-2 my-4 text-slate-600 dark:text-slate-300">
            {currentList.items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed text-sm sm:text-base font-light">{parseInlineStyles(item)}</li>
            ))}
          </ul>
        );
        currentList = null;
      }
    } else {
      if (currentList) {
        elements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 space-y-2 my-4 text-slate-600 dark:text-slate-300">
            {currentList.items.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed text-sm sm:text-base font-light">{parseInlineStyles(item)}</li>
            ))}
          </ul>
        );
        currentList = null;
      }
      elements.push(
        <p key={idx} className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-4">
          {parseInlineStyles(trimmed)}
        </p>
      );
    }
  });

  if (currentList) {
    elements.push(
      <ul key="list-last" className="list-disc pl-5 space-y-2 my-4 text-slate-600 dark:text-slate-300">
        {currentList.items.map((item, itemIdx) => (
          <li key={itemIdx} className="leading-relaxed text-sm sm:text-base font-light">{parseInlineStyles(item)}</li>
        ))}
      </ul>
    );
  }

  return elements;
};

interface BlogsProps {
  setTab: (tab: string) => void;
  user: any | null;
  isHome?: boolean;
}

export default function Blogs({ setTab, user, isHome = false }: BlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (selectedBlog) {
      fetchComments(selectedBlog.id);
    }
  }, [selectedBlog]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
      // Initialize mock likes
      const initialLikes: Record<string, number> = {};
      data.forEach((b: Blog) => {
        initialLikes[b.id] = Math.floor(Math.random() * 50) + 12;
      });
      setLikes(initialLikes);
    } catch (err) {
      console.error('Failed to load blogs', err);
    }
  };

  const fetchComments = async (blogId: string) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setTab('login');
      return;
    }
    if (!newComment.trim() || !selectedBlog) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/blogs/${selectedBlog.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}:user`
        },
        body: JSON.stringify({ comment: newComment })
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to submit comment', err);
    } finally {
      setCommentLoading(false);
    }
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

  // Divide into Featured article (first) and minor articles (rest)
  const featuredBlog = blogs[0];
  const listBlogs = blogs.slice(1);

  return (
    <div className={`${isHome ? 'py-12 md:py-16' : 'py-24 min-h-screen'} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100`} id="blogs-magazine">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4 text-slate-900 dark:text-white">
            The Travel Log & Journal
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 max-w-2xl mx-auto text-base font-light"
          >
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
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedBlog(featuredBlog)}
                  className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/5 dark:shadow-none group cursor-pointer text-left"
                >
                  <div className="relative h-96 overflow-hidden">
                    <img
                      src={featuredBlog.image_url}
                      alt={featuredBlog.title}
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
                        {featuredBlog.author_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featuredBlog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="uppercase tracking-wider text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded">
                        {featuredBlog.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-amber-500 transition mb-4">
                      {featuredBlog.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-6 line-clamp-3">
                      Goa is universally loved for its sand and sea, but its real treasure lies in its kitchens. Goan cuisine is a fascinating, centuries-old fusion of traditional Hindu Saraswat recipes and Portuguese colonial influences...
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5 text-amber-500 font-semibold group-hover:translate-x-1 transition-transform">
                        Read full column <ChevronRight className="w-4 h-4" />
                      </span>
                      <div className="flex gap-4">
                        <button onClick={(e) => toggleLike(featuredBlog.id, e)} className="flex items-center gap-1 hover:text-red-500 transition">
                          <Heart className={`w-4 h-4 ${liked[featuredBlog.id] ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{likes[featuredBlog.id] || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Minor Articles Below */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {listBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
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
                      <button onClick={(e) => toggleLike(blog.id, e)} className="flex items-center gap-1 hover:text-red-500">
                        <Heart className={`w-3.5 h-3.5 ${liked[blog.id] ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{likes[blog.id] || 0}</span>
                      </button>
                    </div>
                  </div>
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
                <button className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold relative z-10 transition">
                  Apply for Contributor Account
                </button>
              </div>

              {/* Subscriptions info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 text-left">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Trending Bulletins</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-white/5">
                    <span className="text-2xl font-display font-bold text-slate-300">01</span>
                    <div>
                      <a
                        href="https://www.reddit.com/r/JapanTravel/comments/12yby9k/guide_on_how_to_book_and_experience_ryokans/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 dark:text-white hover:text-amber-500 transition cursor-pointer"
                      >
                        Unlocking Kyoto's Private Ryokans
                      </a>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">3 MIN READ • REDDIT DISCUSSION</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-white/5">
                    <span className="text-2xl font-display font-bold text-slate-300">02</span>
                    <div>
                      <a
                        href="https://www.reddit.com/r/travel/comments/15k6p8u/scenic_trains_in_switzerland_which_are_the_best/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 dark:text-white hover:text-amber-500 transition cursor-pointer"
                      >
                        The Ultimate Swiss Train Scenic Routes
                      </a>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">5 MIN READ • REDDIT DISCUSSIONS</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="text-2xl font-display font-bold text-slate-300">03</span>
                    <div>
                      <a
                        href="https://www.quora.com/Which-is-better-North-Goa-or-South-Goa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 dark:text-white hover:text-amber-500 transition cursor-pointer"
                      >
                        Why We Prefer South Goa over the North
                      </a>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">4 MIN READ • QUORA ANSWER</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Modal: Single Detailed Blog Column View Overlay */}
        <AnimatePresence>
          {selectedBlog && (
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
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 border border-white/20 text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Main Scroll content */}
                <div className="overflow-y-auto p-0 flex-1">
                  
                  {/* Photo Hero Banner */}
                  <div className="relative h-64 sm:h-96 w-full">
                    <img
                      src={selectedBlog.image_url}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-6 right-12 text-slate-950">
                      <span className="px-2.5 py-1 rounded bg-amber-500 text-[10px] font-mono tracking-widest uppercase font-bold">
                        {selectedBlog.category.replace('_', ' ')}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-display font-semibold mt-3 tracking-tight leading-tight text-white">
                        {selectedBlog.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Columnist info */}
                    <div className="md:col-span-8 space-y-6">
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pb-4 border-b border-gray-100 dark:border-white/5">
                        <span className="font-semibold text-slate-800 dark:text-white">BY {selectedBlog.author_name.toUpperCase()}</span>
                        <span>•</span>
                        <span>PUBLISHED {new Date(selectedBlog.created_at).toLocaleDateString().toUpperCase()}</span>
                      </div>

                      {/* Editorial Text */}
                      <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light space-y-4">
                        {renderContent(selectedBlog.content)}
                      </div>

                      {/* Comment threads section */}
                      <div className="pt-8 border-t border-gray-200 dark:border-white/5 space-y-6">
                        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-amber-500" />
                          <span>Comments & Notes ({comments.length})</span>
                        </h3>

                        {/* List of comments */}
                        <div className="space-y-4">
                          {comments.length === 0 ? (
                            <p className="text-xs text-slate-400 font-mono">No discussions posted. Be the first to share your travels!</p>
                          ) : (
                            comments.map((comm) => (
                              <div key={comm.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <User className="w-3 h-3 text-amber-400" /> {comm.user_name}
                                  </span>
                                  <span>Now</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-light">{comm.comment}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Write form */}
                        {user ? (
                          <form onSubmit={handlePostComment} className="flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a travel insight..."
                              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 text-sm rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="submit"
                              disabled={commentLoading}
                              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{commentLoading ? 'Posting...' : 'Post'}</span>
                            </button>
                          </form>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-slate-400">
                            Please{' '}
                            <button onClick={() => { setSelectedBlog(null); setTab('login'); }} className="text-amber-500 font-semibold hover:underline">
                              Sign In
                            </button>{' '}
                            to join the travel discussions.
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Sidebar quick links inside blog details modal */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 text-xs text-slate-400 space-y-4">
                        <div>
                          <span className="block font-mono mb-1">CATEGORICAL TAG</span>
                          <span className="font-semibold text-slate-800 dark:text-white capitalize">{selectedBlog.category.replace('_', ' ')}</span>
                        </div>
                        {selectedBlog.source_url && (
                          <div className="pt-4 border-t border-gray-200/50 dark:border-white/5">
                            <span className="block font-mono mb-2">EXTERNAL SOURCE</span>
                            <a
                              href={selectedBlog.source_url}
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
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
