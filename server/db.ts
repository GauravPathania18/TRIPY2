import fs from 'fs';
import path from 'path';
import { 
  User, Destination, TourPackage, Booking, Review, Blog, BlogComment, 
  SavedTrip, Favorite, ContactMessage, Notification, UserRole, BookingStatus 
} from '../src/types';
import { mockDestinations, mockPackages, mockBlogs, mockReviews } from './mockData';
import { firestore } from './firebase-admin';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // Maps user_id to a mock password hash/text
  destinations: Destination[];
  packages: TourPackage[];
  bookings: Booking[];
  reviews: Review[];
  blogs: Blog[];
  blogComments: BlogComment[];
  savedTrips: SavedTrip[];
  favorites: Favorite[];
  contactMessages: ContactMessage[];
  notifications: Notification[];
}

const DB_FILE = path.join(process.cwd(), 'server', 'db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      passwords: {},
      destinations: [],
      packages: [],
      bookings: [],
      reviews: [],
      blogs: [],
      blogComments: [],
      savedTrips: [],
      favorites: [],
      contactMessages: [],
      notifications: [],
    };
    this.init();
  }

  private init() {
    // Ensure the folder exists
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
        console.log('Database loaded successfully from file.');
      } catch (err) {
        console.error('Error parsing db.json, reinitializing...', err);
        this.loadSeedData();
      }
    } else {
      console.log('Database file not found, seeding database...');
      this.loadSeedData();
    }

    // Try asynchronously syncing from Cloud Firestore on startup
    this.syncFromFirestore().catch(err => {
      console.warn('Initial Firestore sync deferred:', err.message || err);
    });
  }

  private loadSeedData() {
    this.data.destinations = [...mockDestinations];
    this.data.packages = [...mockPackages];
    this.data.blogs = [...mockBlogs];
    this.data.reviews = [...mockReviews];
    
    // Add a default admin user
    const adminId = 'admin-1';
    this.data.users.push({
      id: adminId,
      name: 'Gaurav Pathania',
      email: 'pathaniagaurav1818@gmail.com',
      role: UserRole.ADMIN,
      created_at: new Date().toISOString()
    });
    this.data.passwords[adminId] = 'admin123'; // Secure enough for development/mock environment

    this.save();
    
    // Seed Firestore async if possible
    this.seedFirestoreAsync();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json', err);
    }
  }

  // Helper: Save a document to Cloud Firestore
  private async saveToFirestore(collectionName: string, docId: string, docData: any) {
    try {
      if (firestore) {
        await firestore.collection(collectionName).doc(docId).set(docData);
        console.log(`[Firestore] Successfully saved document ${collectionName}/${docId}`);
      }
    } catch (err: any) {
      console.warn(`[Firestore] Save failed for ${collectionName}/${docId}:`, err.message || err);
    }
  }

  // Helper: Delete a document from Cloud Firestore
  private async deleteFromFirestore(collectionName: string, docId: string) {
    try {
      if (firestore) {
        await firestore.collection(collectionName).doc(docId).delete();
        console.log(`[Firestore] Successfully deleted document ${collectionName}/${docId}`);
      }
    } catch (err: any) {
      console.warn(`[Firestore] Delete failed for ${collectionName}/${docId}:`, err.message || err);
    }
  }

  // Helper: Seed Firestore on initial boot with seed data
  private async seedFirestoreAsync() {
    try {
      if (!firestore) return;
      console.log('[Firestore] Checking if Firestore needs initial seeding...');
      const destSnap = await firestore.collection('destinations').limit(1).get();
      if (destSnap.empty) {
        console.log('[Firestore] Seeding initial collections in Cloud Firestore...');
        
        for (const dest of this.data.destinations) {
          await firestore.collection('destinations').doc(dest.id).set(dest);
        }
        for (const pkg of this.data.packages) {
          await firestore.collection('packages').doc(pkg.id).set(pkg);
        }
        for (const blog of this.data.blogs) {
          await firestore.collection('blogs').doc(blog.id).set(blog);
        }
        for (const rev of this.data.reviews) {
          await firestore.collection('reviews').doc(rev.id).set(rev);
        }
        for (const u of this.data.users) {
          await firestore.collection('users').doc(u.id).set(u);
        }
        console.log('[Firestore] Initial seeding completed successfully.');
      } else {
        console.log('[Firestore] Destinations already exist, skipping seeding.');
      }
    } catch (err: any) {
      console.warn('[Firestore] Async seeding failed (using local JSON storage):', err.message || err);
    }
  }

  // Helper: Sync existing records from Cloud Firestore to keep persistent storage in parity
  private async syncFromFirestore() {
    try {
      if (!firestore) return;
      console.log('[Firestore] Syncing database from Cloud Firestore...');
      const collections = [
        'users', 'destinations', 'packages', 'bookings', 
        'reviews', 'blogs', 'blogComments', 'savedTrips', 
        'favorites', 'contactMessages', 'notifications'
      ];
      
      let syncedAny = false;
      for (const colName of collections) {
        const snapshot = await firestore.collection(colName).get();
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const docData = doc.data() as any;
            const existingList = (this.data as any)[colName];
            if (Array.isArray(existingList)) {
              const index = existingList.findIndex((item: any) => item.id === doc.id);
              if (index === -1) {
                existingList.push(docData);
                syncedAny = true;
              } else {
                // Keep the latest record or merge
                existingList[index] = { ...existingList[index], ...docData };
              }
            }
          });
        }
      }
      if (syncedAny) {
        this.save();
        console.log('[Firestore] Sync from Cloud Firestore complete. Local storage updated.');
      } else {
        console.log('[Firestore] Parity complete. No new Cloud Firestore updates found.');
      }
    } catch (err: any) {
      console.warn('[Firestore] Sync failed (operating in resilient local-first mode):', err.message || err);
    }
  }

  // --- Users CRUD ---
  getUsers(): User[] { return this.data.users; }
  getUser(id: string): User | undefined { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email: string): User | undefined { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  
  createUser(name: string, email: string, passwordText: string, role = UserRole.USER): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('Email is already registered');
    }
    const id = 'user-' + Math.random().toString(36).substr(2, 9);
    const user: User = {
      id,
      name,
      email,
      role,
      created_at: new Date().toISOString()
    };
    this.data.users.push(user);
    this.data.passwords[id] = passwordText;
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('users', id, user);
    return user;
  }

  findOrCreateGoogleUser(name: string, email: string, photoURL?: string): User {
    let user = this.getUserByEmail(email);
    if (!user) {
      const id = 'user-' + Math.random().toString(36).substr(2, 9);
      user = {
        id,
        name: name || email.split('@')[0],
        email,
        role: UserRole.USER,
        profile_image: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        created_at: new Date().toISOString()
      };
      this.data.users.push(user);
      this.data.passwords[id] = 'google-sso-managed';
      this.save();
      
      // Asynchronously save to Cloud Firestore
      this.saveToFirestore('users', id, user);
    } else {
      if (photoURL && !user.profile_image) {
        user.profile_image = photoURL;
        this.save();
        this.saveToFirestore('users', user.id, user);
      }
    }
    return user;
  }

  verifyPassword(userId: string, passwordText: string): boolean {
    return this.data.passwords[userId] === passwordText;
  }

  updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'profile_image'>>): User {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    
    if (updates.email && updates.email.toLowerCase() !== this.data.users[idx].email.toLowerCase()) {
      const existing = this.getUserByEmail(updates.email);
      if (existing) {
        throw new Error('Email is already registered by another account');
      }
    }

    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    
    // Asynchronously update Cloud Firestore
    this.saveToFirestore('users', userId, this.data.users[idx]);
    return this.data.users[idx];
  }

  // --- Destinations CRUD ---
  getDestinations(): Destination[] { return this.data.destinations; }
  getDestination(id: string): Destination | undefined { return this.data.destinations.find(d => d.id === id); }
  createDestination(dest: Omit<Destination, 'id' | 'created_at'>): Destination {
    const id = 'dest-' + Math.random().toString(36).substr(2, 9);
    const newDest: Destination = {
      ...dest,
      id,
      created_at: new Date().toISOString()
    };
    this.data.destinations.push(newDest);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('destinations', id, newDest);
    return newDest;
  }

  // --- Packages CRUD ---
  getPackages(): TourPackage[] { return this.data.packages; }
  getPackage(id: string): TourPackage | undefined { return this.data.packages.find(p => p.id === id); }
  createPackage(pkg: Omit<TourPackage, 'id' | 'created_at'>): TourPackage {
    const id = 'pkg-' + Math.random().toString(36).substr(2, 9);
    const newPkg: TourPackage = {
      ...pkg,
      id,
      created_at: new Date().toISOString()
    };
    this.data.packages.push(newPkg);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('packages', id, newPkg);
    return newPkg;
  }

  // --- Bookings CRUD ---
  getBookings(): Booking[] { return this.data.bookings; }
  getBookingsByUser(userId: string): Booking[] { return this.data.bookings.filter(b => b.user_id === userId); }
  createBooking(userId: string, packageId: string, travelers: number, totalCost: number, startDate: string, endDate: string): Booking {
    const id = 'book-' + Math.random().toString(36).substr(2, 9);
    const booking: Booking = {
      id,
      user_id: userId,
      package_id: packageId,
      status: BookingStatus.CONFIRMED, // Auto-confirm bookings in development/mock
      travelers,
      total_cost: totalCost,
      booking_date: new Date().toISOString(),
      start_date: startDate,
      end_date: endDate,
      created_at: new Date().toISOString()
    };
    this.data.bookings.push(booking);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('bookings', id, booking);
    return booking;
  }

  updateBookingStatus(id: string, status: BookingStatus): Booking {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    this.data.bookings[idx].status = status;
    this.save();
    
    // Asynchronously update Cloud Firestore
    this.saveToFirestore('bookings', id, this.data.bookings[idx]);
    return this.data.bookings[idx];
  }

  // --- Reviews CRUD ---
  getReviews(): Review[] { return this.data.reviews; }
  getReviewsByDestination(destId: string): Review[] { return this.data.reviews.filter(r => r.destination_id === destId); }
  getReviewsByPackage(pkgId: string): Review[] { return this.data.reviews.filter(r => r.package_id === pkgId); }
  createReview(userId: string, name: string, rating: number, comment: string, destId?: string, pkgId?: string, image?: string): Review {
    const id = 'rev-' + Math.random().toString(36).substr(2, 9);
    const review: Review = {
      id,
      user_id: userId,
      user_name: name,
      user_image: image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      destination_id: destId,
      package_id: pkgId,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    this.data.reviews.push(review);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('reviews', id, review);
    return review;
  }

  // --- Blogs CRUD ---
  getBlogs(): Blog[] { return this.data.blogs; }
  getBlog(id: string): Blog | undefined { return this.data.blogs.find(b => b.id === id); }
  createBlog(blog: Omit<Blog, 'id' | 'created_at'>): Blog {
    const id = 'blog-' + Math.random().toString(36).substr(2, 9);
    const newBlog: Blog = {
      ...blog,
      id,
      created_at: new Date().toISOString()
    };
    this.data.blogs.push(newBlog);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('blogs', id, newBlog);
    return newBlog;
  }

  // --- Blog Comments CRUD ---
  getCommentsByBlog(blogId: string): BlogComment[] { return this.data.blogComments.filter(c => c.blog_id === blogId); }
  createComment(blogId: string, userId: string, userName: string, commentText: string): BlogComment {
    const id = 'comment-' + Math.random().toString(36).substr(2, 9);
    const comment: BlogComment = {
      id,
      blog_id: blogId,
      user_id: userId,
      user_name: userName,
      comment: commentText,
      created_at: new Date().toISOString()
    };
    this.data.blogComments.push(comment);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('blogComments', id, comment);
    return comment;
  }

  // --- Saved Trips CRUD ---
  getSavedTripsByUser(userId: string): SavedTrip[] { return this.data.savedTrips.filter(t => t.user_id === userId); }
  getSavedTrip(id: string): SavedTrip | undefined { return this.data.savedTrips.find(t => t.id === id); }
  createSavedTrip(userId: string, name: string, itinerary: any, budget: number, destId?: string, start_date?: string, end_date?: string): SavedTrip {
    const id = 'trip-' + Math.random().toString(36).substr(2, 9);
    const trip: SavedTrip = {
      id,
      user_id: userId,
      name,
      destination_id: destId,
      itinerary,
      budget,
      start_date,
      end_date,
      status: 'planned',
      created_at: new Date().toISOString()
    };
    this.data.savedTrips.push(trip);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('savedTrips', id, trip);
    return trip;
  }

  deleteSavedTrip(id: string, userId: string): boolean {
    const idx = this.data.savedTrips.findIndex(t => t.id === id && t.user_id === userId);
    if (idx === -1) return false;
    this.data.savedTrips.splice(idx, 1);
    this.save();
    
    // Asynchronously delete from Cloud Firestore
    this.deleteFromFirestore('savedTrips', id);
    return true;
  }

  // --- Favorites CRUD ---
  getFavoritesByUser(userId: string): Favorite[] { return this.data.favorites.filter(f => f.user_id === userId); }
  toggleFavorite(userId: string, destinationId: string): boolean {
    const idx = this.data.favorites.findIndex(f => f.user_id === userId && f.destination_id === destinationId);
    if (idx !== -1) {
      const favId = this.data.favorites[idx].id;
      this.data.favorites.splice(idx, 1);
      this.save();
      
      // Asynchronously delete from Cloud Firestore
      this.deleteFromFirestore('favorites', favId);
      return false; // unfavorited
    } else {
      const id = 'fav-' + Math.random().toString(36).substr(2, 9);
      const newFav = {
        id,
        user_id: userId,
        destination_id: destinationId,
        created_at: new Date().toISOString()
      };
      this.data.favorites.push(newFav);
      this.save();
      
      // Asynchronously save to Cloud Firestore
      this.saveToFirestore('favorites', id, newFav);
      return true; // favorited
    }
  }

  // --- Contact Messages CRUD ---
  getContactMessages(): ContactMessage[] { return this.data.contactMessages; }
  createContactMessage(name: string, email: string, subject: string, message: string): ContactMessage {
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const msg: ContactMessage = {
      id,
      name,
      email,
      subject,
      message,
      status: 'unread',
      created_at: new Date().toISOString()
    };
    this.data.contactMessages.push(msg);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('contactMessages', id, msg);
    return msg;
  }

  updateContactMessageStatus(id: string, status: 'unread' | 'read' | 'responded'): ContactMessage {
    const idx = this.data.contactMessages.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Message not found');
    this.data.contactMessages[idx].status = status;
    this.save();
    
    // Asynchronously update Cloud Firestore
    this.saveToFirestore('contactMessages', id, this.data.contactMessages[idx]);
    return this.data.contactMessages[idx];
  }

  // --- Notifications CRUD ---
  getNotificationsByUser(userId: string): Notification[] { return this.data.notifications.filter(n => n.user_id === userId); }
  createNotification(userId: string, title: string, message: string): Notification {
    const id = 'notif-' + Math.random().toString(36).substr(2, 9);
    const notif: Notification = {
      id,
      user_id: userId,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.push(notif);
    this.save();
    
    // Asynchronously save to Cloud Firestore
    this.saveToFirestore('notifications', id, notif);
    return notif;
  }

  markNotificationRead(id: string): void {
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].is_read = true;
      this.save();
      
      // Asynchronously update Cloud Firestore
      this.saveToFirestore('notifications', id, this.data.notifications[idx]);
    }
  }
}

export const db = new Database();
export default db;
