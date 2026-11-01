/**
 * Node.js Backend Client for Activity Confirmation Email Service
 * 
 * Usage:
 * const { ActivityNotifier } = require('./client-sdk/node-client');
 * const notifier = new ActivityNotifier({ endpoint: 'http://localhost:3000/api/activity/notify' });
 * 
 * await notifier.notify({
 *   user: { email: 'john@example.com', name: 'John' },
 *   activity: {
 *     type: 'login',
 *     ip: req.ip,
 *     userAgent: req.headers['user-agent']
 *   }
 * });
 */

class ActivityNotifier {
  constructor(options = {}) {
    this.endpoint = options.endpoint || process.env.ACTIVITY_EMAIL_SERVICE_URL || 'http://localhost:3000/api/activity/notify';
    this.apiKey = options.apiKey || process.env.ACTIVITY_EMAIL_SERVICE_KEY || null;
  }

  async notify(payload) {
    if (!payload.user || !payload.user.email) {
      throw new Error('payload.user.email is required');
    }

    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Pre-built helpers
  notifyLogin(user, req) {
    return this.notify({
      user,
      activity: {
        type: 'login',
        title: 'New Sign-In',
        ip: req?.ip || req?.socket?.remoteAddress,
        userAgent: req?.headers ? req.headers['user-agent'] : null,
        timestamp: new Date().toUTCString()
      }
    });
  }

  notifyPasswordChanged(user, req) {
    return this.notify({
      user,
      activity: {
        type: 'password_change',
        title: 'Password Changed',
        ip: req?.ip,
        userAgent: req?.headers ? req.headers['user-agent'] : null,
        timestamp: new Date().toUTCString()
      }
    });
  }

  notifyProfileUpdated(user, updatedFields) {
    return this.notify({
      user,
      activity: {
        type: 'profile_update',
        title: 'Profile Updated',
        details: { updatedFields },
        timestamp: new Date().toUTCString()
      }
    });
  }

  notifyOrderPlaced(user, order) {
    return this.notify({
      user,
      activity: {
        type: 'order_placed',
        title: `Order #${order.id}`,
        details: {
          orderId: order.id,
          total: order.total,
          items: order.items
        },
        actionUrl: order.trackingUrl,
        timestamp: new Date().toUTCString()
      }
    });
  }

  notifyCustomActivity(user, activity) {
    return this.notify({
      user,
      activity: {
        type: activity.type || 'custom',
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata || {},
        actionUrl: activity.actionUrl,
        actionText: activity.actionText,
        severity: activity.severity || 'info',
        timestamp: new Date().toUTCString()
      }
    });
  }
}

module.exports = { ActivityNotifier };
