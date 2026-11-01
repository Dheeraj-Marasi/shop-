/**
 * Frontend Controller for Activity Email Notification Service Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const connectionBadge = document.getElementById('connectionBadge');
  const refreshBtn = document.getElementById('refreshBtn');
  const userEmailInput = document.getElementById('userEmail');
  const userNameInput = document.getElementById('userName');
  const latestResultBox = document.getElementById('latestResultBox');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultSubtitle = document.getElementById('resultSubtitle');
  const resultPreviewBtn = document.getElementById('resultPreviewBtn');
  const resActivityType = document.getElementById('resActivityType');
  const resRecipient = document.getElementById('resRecipient');
  const resSubject = document.getElementById('resSubject');
  const resMode = document.getElementById('resMode');

  const historyTableBody = document.getElementById('historyTableBody');
  const logCount = document.getElementById('logCount');
  const clearLogBtn = document.getElementById('clearLogBtn');

  const templateSelect = document.getElementById('templateSelect');
  const templateFrame = document.getElementById('templateFrame');

  // Custom modal elements
  const customModal = document.getElementById('customModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const fireCustomBtn = document.getElementById('fireCustomBtn');
  const customTitleInput = document.getElementById('customTitle');
  const customDescInput = document.getElementById('customDesc');
  const customActionUrlInput = document.getElementById('customActionUrl');
  const customActionTextInput = document.getElementById('customActionText');
  const customSeveritySelect = document.getElementById('customSeverity');

  // Diagnostic Test Email
  const testEmailAddrInput = document.getElementById('testEmailAddr');
  const testEmailNameInput = document.getElementById('testEmailName');
  const sendTestEmailBtn = document.getElementById('sendTestEmailBtn');
  const testResultMsg = document.getElementById('testResultMsg');

  // Config fields
  const cfgMode = document.getElementById('cfgMode');
  const cfgHost = document.getElementById('cfgHost');
  const cfgCompany = document.getElementById('cfgCompany');
  const cfgSupport = document.getElementById('cfgSupport');
  const cfgAuth = document.getElementById('cfgAuth');
  const configModeBadge = document.getElementById('configModeBadge');

  // Initialize Tracker client
  if (window.WebsiteActivityTracker) {
    window.WebsiteActivityTracker.init({
      endpoint: '/api/activity/notify'
    });
  }

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = `tab-${btn.dataset.tab}`;
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');

      if (btn.dataset.tab === 'history') {
        fetchHistory();
      }
    });
  });

  // Code tabs
  document.querySelectorAll('.code-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.code-block').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const codeId = `code-${btn.dataset.lang}`;
      const targetCode = document.getElementById(codeId);
      if (targetCode) targetCode.classList.add('active');
    });
  });

  // Template inspector selector
  if (templateSelect && templateFrame) {
    templateSelect.addEventListener('change', (e) => {
      templateFrame.src = `/api/activity/templates/preview/${e.target.value}`;
    });
  }

  // Refresh status
  refreshBtn.addEventListener('click', () => {
    checkServiceStatus();
    fetchHistory();
  });

  // Simulator Buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'custom_modal') {
        customModal.classList.remove('hidden');
      } else {
        triggerActivity(action);
      }
    });
  });

  // Custom modal controls
  function closeCustomModal() {
    customModal.classList.add('hidden');
  }
  closeModalBtn.addEventListener('click', closeCustomModal);
  cancelModalBtn.addEventListener('click', closeCustomModal);
  fireCustomBtn.addEventListener('click', () => {
    const title = customTitleInput.value.trim() || 'Custom Activity';
    const description = customDescInput.value.trim() || '';
    const actionUrl = customActionUrlInput.value.trim() || '#';
    const actionText = customActionTextInput.value.trim() || 'View';
    const severity = customSeveritySelect.value;

    triggerActivity('custom', {
      title,
      description,
      actionUrl,
      actionText,
      severity,
      metadata: {
        'Activity Category': 'User Custom Action',
        'Triggered From': 'Website Control Dashboard'
      }
    });

    closeCustomModal();
  });

  // Clear history
  clearLogBtn.addEventListener('click', async () => {
    if (!confirm('Clear all recorded activity history?')) return;
    try {
      await fetch('/api/activity/history', { method: 'DELETE' });
      fetchHistory();
    } catch (e) {
      alert('Error clearing history: ' + e.message);
    }
  });

  // Diagnostic Send Test Email
  sendTestEmailBtn.addEventListener('click', async () => {
    const email = testEmailAddrInput.value.trim();
    const name = testEmailNameInput.value.trim();
    if (!email) {
      alert('Please enter a destination email');
      return;
    }

    sendTestEmailBtn.disabled = true;
    sendTestEmailBtn.textContent = '⏳ Sending test email...';
    testResultMsg.classList.add('hidden');

    try {
      const res = await fetch('/api/activity/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();

      testResultMsg.classList.remove('hidden');
      if (data.success) {
        testResultMsg.className = 'mt-3 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200';
        let msg = `✅ Test email successfully sent!`;
        if (data.details && data.details.previewUrl) {
          msg += ` <a href="${data.details.previewUrl}" target="_blank" class="underline font-bold">Open Email Web Preview</a>`;
        }
        testResultMsg.innerHTML = msg;
        fetchHistory();
      } else {
        testResultMsg.className = 'mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200';
        testResultMsg.textContent = `❌ Failed: ${data.error}`;
      }
    } catch (err) {
      testResultMsg.className = 'mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200';
      testResultMsg.textContent = `❌ Network Error: ${err.message}`;
    } finally {
      sendTestEmailBtn.disabled = false;
      sendTestEmailBtn.textContent = '🚀 Send Test Email';
    }
  });

  // Core Activity Trigger
  async function triggerActivity(activityType, customDetails = {}) {
    const email = userEmailInput.value.trim();
    const name = userNameInput.value.trim() || 'Valued User';

    if (!email) {
      alert('Please provide a valid recipient email in Step 1.');
      userEmailInput.focus();
      return;
    }

    // Set loading indicator
    connectionBadge.className = 'status-badge loading';
    connectionBadge.textContent = '⏳ Sending confirmation...';

    const payload = {
      user: { email, name },
      activity: Object.assign({
        type: activityType,
        timestamp: new Date().toUTCString(),
        ip: '127.0.0.1 (Local Browser)',
        device: 'Web Client Simulator',
        actionUrl: window.location.href
      }, getActivityDefaults(activityType), customDetails)
    };

    try {
      const res = await fetch('/api/activity/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        displayLatestResult(result, payload);
        fetchHistory();
        checkServiceStatus();
      } else {
        alert('Service Error: ' + (result.error || 'Failed to dispatch email'));
        checkServiceStatus();
      }
    } catch (err) {
      alert('Network Error connecting to service: ' + err.message);
      checkServiceStatus();
    }
  }

  function getActivityDefaults(type) {
    switch (type) {
      case 'login':
        return {
          title: 'Sign In Detected',
          location: 'San Francisco, CA, USA',
          actionUrl: `${window.location.origin}/#security`
        };
      case 'password_change':
        return {
          title: 'Password Updated',
          actionUrl: `${window.location.origin}/#reset`
        };
      case 'signup':
        return {
          title: 'New User Account Created',
          actionUrl: `${window.location.origin}/#dashboard`
        };
      case 'profile_update':
        return {
          title: 'Profile Details Changed',
          details: { updatedFields: ['Display Name', 'Contact Phone', 'Notification Preferences'] },
          actionUrl: `${window.location.origin}/#profile`
        };
      case 'order_placed':
        return {
          title: 'Order Placed',
          details: {
            orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            total: '$79.99',
            items: [
              { name: 'Website Annual Subscription', qty: 1, price: '$69.99' },
              { name: 'Priority Support Addon', qty: 1, price: '$10.00' }
            ]
          },
          actionUrl: `${window.location.origin}/#orders`
        };
      default:
        return {};
    }
  }

  function displayLatestResult(result, payload) {
    latestResultBox.classList.remove('hidden');
    resultIcon.textContent = '✅';
    resultTitle.textContent = 'Activity Confirmation Email Dispatched!';
    resultSubtitle.textContent = `Notification triggered for ${payload.user.email}`;

    resActivityType.textContent = result.activityType || payload.activity.type;
    resRecipient.textContent = payload.user.email;
    resSubject.textContent = result.subject || '-';
    resMode.textContent = (result.mode || 'ethereal').toUpperCase();

    if (result.previewUrl) {
      resultPreviewBtn.href = result.previewUrl;
      resultPreviewBtn.style.display = 'inline-flex';
      resultPreviewBtn.textContent = '🔍 View Rendered Email (Ethereal)';
    } else {
      resultPreviewBtn.style.display = 'none';
    }

    latestResultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Fetch status and config
  async function checkServiceStatus() {
    try {
      const [healthRes, configRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/config')
      ]);

      if (healthRes.ok && configRes.ok) {
        const config = await configRes.json();
        connectionBadge.className = 'status-badge online';
        connectionBadge.textContent = `● Service Online (${config.mailer.mode.toUpperCase()})`;

        // Populate Settings Tab
        cfgMode.textContent = config.mailer.mode.toUpperCase();
        cfgHost.textContent = config.mailer.host || 'Ethereal Mail (Local Test Service)';
        cfgCompany.textContent = config.companyName;
        cfgSupport.textContent = config.supportEmail || 'N/A';
        cfgAuth.textContent = config.hasApiKey ? 'Protected by API Key' : 'Public (Development Mode)';

        configModeBadge.textContent = config.mailer.isTestMode ? 'Test Mode (Preview Enabled)' : 'Live SMTP Active';
        configModeBadge.className = config.mailer.isTestMode ? 'badge badge-blue' : 'badge badge-green';
      } else {
        throw new Error('Service responded with non-200');
      }
    } catch (err) {
      connectionBadge.className = 'status-badge error';
      connectionBadge.textContent = '● Service Offline';
    }
  }

  // Fetch Activity History
  async function fetchHistory() {
    try {
      const res = await fetch('/api/activity/history');
      const data = await res.json();

      if (data.success) {
        logCount.textContent = data.activities.length;
        renderHistoryTable(data.activities);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  function renderHistoryTable(activities) {
    if (!activities || activities.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-6">No activities recorded yet. Trigger an activity from the simulator!</td>
        </tr>
      `;
      return;
    }

    historyTableBody.innerHTML = activities.map(item => {
      const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const statusClass = item.status === 'sent' ? 'badge-green' : (item.status === 'sending' ? 'badge-blue' : 'badge-red');
      const previewButton = item.previewUrl
        ? `<a href="${item.previewUrl}" target="_blank" class="btn btn-outline btn-sm">🔍 Preview Email</a>`
        : `<span class="text-muted text-sm">${item.status === 'sent' ? 'Delivered via SMTP' : '-'}</span>`;

      return `
        <tr>
          <td><span title="${item.timestamp}">${timeFormatted}</span></td>
          <td><span class="badge badge-purple">${escapeHtml(item.activityType)}</span></td>
          <td>
            <strong>${escapeHtml(item.recipientName)}</strong><br>
            <span class="text-muted text-sm">${escapeHtml(item.recipientEmail)}</span>
          </td>
          <td>${escapeHtml(item.subject)}</td>
          <td><span class="badge ${statusClass}">${escapeHtml(item.status)}</span></td>
          <td>${previewButton}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Initial loads
  checkServiceStatus();
  fetchHistory();
});
