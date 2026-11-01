/**
 * In-Memory Activity Audit Store
 * Retains recent activity notification events and email delivery logs
 */

class ActivityStore {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.history = [];
  }

  add(record) {
    const entry = {
      id: record.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: record.timestamp || new Date().toISOString(),
      recipientEmail: record.recipientEmail || 'unknown@example.com',
      recipientName: record.recipientName || 'User',
      activityType: record.activityType || 'custom',
      activityTitle: record.activityTitle || 'Website Activity',
      subject: record.subject || '',
      status: record.status || 'pending',
      previewUrl: record.previewUrl || null,
      messageId: record.messageId || null,
      error: record.error || null,
      ip: record.ip || null,
      device: record.device || null
    };

    this.history.unshift(entry);

    if (this.history.length > this.maxSize) {
      this.history.pop();
    }

    return entry;
  }

  update(id, updates) {
    const entry = this.history.find(item => item.id === id);
    if (entry) {
      Object.assign(entry, updates);
      return entry;
    }
    return null;
  }

  getAll() {
    return [...this.history];
  }

  getById(id) {
    return this.history.find(item => item.id === id) || null;
  }

  clear() {
    this.history = [];
  }
}

const activityStore = new ActivityStore(100);

module.exports = activityStore;
