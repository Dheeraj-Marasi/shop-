/**
 * Website Activity Confirmation Email Tracker SDK
 * Drop-in client for any frontend web application
 *
 * Usage:
 * <script src="http://localhost:3000/sdk/website-tracker.js"></script>
 * <script>
 *   WebsiteActivityTracker.init({
 *     endpoint: 'http://localhost:3000/api/activity/notify',
 *     user: { email: 'user@example.com', name: 'Alex' }
 *   });
 *   
 *   // Send confirmation email on any activity:
 *   WebsiteActivityTracker.track('login');
 * </script>
 */

(function (window) {
  'use strict';

  class Tracker {
    constructor() {
      this.endpoint = 'http://localhost:3000/api/activity/notify';
      this.apiKey = null;
      this.currentUser = null;
      this.initialized = false;
    }

    /**
     * Initialize tracker with options
     * @param {Object} options 
     */
    init(options = {}) {
      if (options.endpoint) this.endpoint = options.endpoint;
      if (options.apiKey) this.apiKey = options.apiKey;
      if (options.user) this.currentUser = options.user;
      this.initialized = true;
      return this;
    }

    /**
     * Set or update active logged-in user
     * @param {Object} user - { email, name }
     */
    setUser(user) {
      this.currentUser = user;
      return this;
    }

    /**
     * Clear logged in user
     */
    clearUser() {
      this.currentUser = null;
      return this;
    }

    /**
     * Track any arbitrary activity and send confirmation mail
     * @param {string} activityType - e.g. 'login', 'password_change', 'profile_update', 'order_placed', 'custom'
     * @param {Object} options - Activity details and optional user overrides
     */
    async track(activityType, options = {}) {
      const user = options.user || this.currentUser;

      if (!user || !user.email) {
        console.warn('[WebsiteActivityTracker] No recipient user email provided for activity:', activityType);
        return { success: false, error: 'Recipient email required' };
      }

      const payload = {
        user: {
          email: user.email,
          name: user.name || 'Valued User'
        },
        activity: {
          type: activityType,
          title: options.title || formatTitle(activityType),
          description: options.description || null,
          timestamp: options.timestamp || new Date().toUTCString(),
          userAgent: navigator.userAgent,
          actionUrl: options.actionUrl || window.location.href,
          actionText: options.actionText || 'View Activity',
          details: options.details || {},
          metadata: Object.assign({
            pageUrl: window.location.href,
            pageTitle: document.title,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
          }, options.metadata || {})
        }
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          keepalive: true
        });

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('[WebsiteActivityTracker] Failed to record activity:', err);
        return { success: false, error: err.message };
      }
    }

    // Convenience Shortcuts
    trackLogin(opts = {}) {
      return this.track('login', Object.assign({ title: 'Website Sign-In' }, opts));
    }

    trackSignup(opts = {}) {
      return this.track('signup', Object.assign({ title: 'Welcome Registration' }, opts));
    }

    trackPasswordChange(opts = {}) {
      return this.track('password_change', Object.assign({ title: 'Password Changed' }, opts));
    }

    trackProfileUpdate(updatedFields, opts = {}) {
      return this.track('profile_update', Object.assign({
        title: 'Profile Updated',
        details: { updatedFields: Array.isArray(updatedFields) ? updatedFields : [updatedFields] }
      }, opts));
    }

    trackOrder(orderId, total, items, opts = {}) {
      return this.track('order_placed', Object.assign({
        title: `Order #${orderId}`,
        details: { orderId, total, items }
      }, opts));
    }
  }

  function formatTitle(str) {
    if (!str) return 'Website Activity';
    return str
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  window.WebsiteActivityTracker = new Tracker();

})(typeof window !== 'undefined' ? window : this);
