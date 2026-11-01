const { createBaseEmailLayout, escapeHtml } = require('./base');

/**
 * Generate HTML & Text for Profile Update Activity
 */
function renderProfileUpdateTemplate(data) {
  const userName = data.user?.name || 'Valued User';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const updatedFields = data.activity?.details?.updatedFields || data.activity?.metadata?.updatedFields || ['Profile Information'];
  const viewAccountUrl = data.activity?.actionUrl || `${process.env.COMPANY_WEBSITE || '#'}/profile`;

  const fieldsListHtml = Array.isArray(updatedFields)
    ? updatedFields.map(field => `<li style="margin-bottom: 6px;">${escapeHtml(field)}</li>`).join('')
    : `<li>${escapeHtml(String(updatedFields))}</li>`;

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: #e0f2fe; border-radius: 6px; color: #0284c7; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        👤 Profile Updated
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Hi ${escapeHtml(userName)},
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        This email confirms that your profile details were recently updated on our website.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
              <tr>
                <td width="35%" style="font-weight: 600; color: #64748b;">Activity:</td>
                <td><strong>Profile Details Modified</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Updated At:</td>
                <td>${escapeHtml(activityTime)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b; vertical-align: top;">Fields Modified:</td>
                <td>
                  <ul style="margin: 0; padding-left: 20px; color: #0f172a;">
                    ${fieldsListHtml}
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 22px;">
        If you made these changes, you don't need to do anything. If you didn't authorize this change, please check your account settings right away.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #0284c7;">
            <a href="${viewAccountUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              View Profile Settings
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = createBaseEmailLayout({
    title: 'Your Profile Was Updated',
    preheader: `Confirmation: Profile modifications on ${activityTime}`,
    contentHtml
  });

  const text = `
Profile Update Confirmation

Hi ${userName},

Your profile was updated on ${activityTime}.
Updated items: ${Array.isArray(updatedFields) ? updatedFields.join(', ') : updatedFields}

Check your settings: ${viewAccountUrl}
  `.trim();

  return {
    subject: `Activity Confirmation: Your Profile Was Updated [${process.env.COMPANY_NAME || 'Our Website'}]`,
    html,
    text
  };
}

module.exports = {
  renderProfileUpdateTemplate
};
