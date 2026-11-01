const { createBaseEmailLayout, escapeHtml } = require('./base');

/**
 * Generate HTML & Text for Any Custom / Generic Activity on the website
 */
function renderCustomActivityTemplate(data) {
  const userName = data.user?.name || 'Valued User';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const activityType = data.activity?.type || 'Activity Confirmation';
  const title = data.activity?.title || 'Account Activity Confirmation';
  const description = data.activity?.description || 'A new activity was recorded on your account.';
  const metadata = data.activity?.metadata || data.activity?.details || {};
  const actionUrl = data.activity?.actionUrl || process.env.COMPANY_WEBSITE || '#';
  const actionText = data.activity?.actionText || 'View in Account';

  // Badge styling based on severity / type
  const badgeColors = {
    info: { bg: '#eff6ff', text: '#2563eb' },
    success: { bg: '#ecfdf5', text: '#059669' },
    warning: { bg: '#fffbeb', text: '#d97706' },
    danger: { bg: '#fef2f2', text: '#dc2626' }
  };
  const severity = data.activity?.severity || 'info';
  const badgeStyle = badgeColors[severity] || badgeColors.info;

  // Render metadata rows if any
  const metaKeys = Object.keys(metadata);
  const metadataRowsHtml = metaKeys.length > 0 ? metaKeys.map(key => `
    <tr>
      <td width="35%" style="font-weight: 600; color: #64748b; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
        ${escapeHtml(formatKey(key))}:
      </td>
      <td style="color: #1e293b; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
        ${escapeHtml(typeof metadata[key] === 'object' ? JSON.stringify(metadata[key]) : String(metadata[key]))}
      </td>
    </tr>
  `).join('') : '';

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: ${badgeStyle.bg}; border-radius: 6px; color: ${badgeStyle.text}; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        📌 ${escapeHtml(formatKey(activityType))}
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Hi ${escapeHtml(userName)},
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        ${escapeHtml(description)}
      </p>

      <!-- Activity Metadata Box -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 18px 22px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td width="35%" style="font-weight: 600; color: #64748b; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">Activity:</td>
                <td style="font-weight: 600; color: #0f172a; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">${escapeHtml(title)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">Recorded At:</td>
                <td style="color: #334155; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${escapeHtml(activityTime)}</td>
              </tr>
              ${metadataRowsHtml}
            </table>
          </td>
        </tr>
      </table>

      ${actionUrl && actionUrl !== '#' ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #2563eb;">
            <a href="${actionUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              ${escapeHtml(actionText)}
            </a>
          </td>
        </tr>
      </table>
      ` : ''}

      <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 19px;">
        This is an automated activity confirmation. If you did not initiate this action, please review your security settings.
      </p>
    </div>
  `;

  const html = createBaseEmailLayout({
    title,
    preheader: `${title} on ${activityTime}`,
    contentHtml
  });

  const metadataText = metaKeys.map(k => `${formatKey(k)}: ${metadata[k]}`).join('\n');
  const text = `
${title}

Hi ${userName},

${description}

Activity: ${title}
Time: ${activityTime}
${metadataText}

${actionUrl && actionUrl !== '#' ? `Action link: ${actionUrl}` : ''}
  `.trim();

  return {
    subject: `Activity Confirmation: ${title} [${process.env.COMPANY_NAME || 'Our Website'}]`,
    html,
    text
  };
}

function formatKey(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

module.exports = {
  renderCustomActivityTemplate
};
