const { createBaseEmailLayout, escapeHtml } = require('./base');

/**
 * Generate HTML & Text for New Sign-In Activity
 */
function renderLoginTemplate(data) {
  const userName = data.user?.name || 'Valued User';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const ip = data.activity?.ip || 'Not recorded';
  const device = data.activity?.device || data.activity?.userAgent || 'Web Browser';
  const location = data.activity?.location || 'Unknown Location';
  const secureUrl = data.activity?.actionUrl || `${process.env.COMPANY_WEBSITE || '#'}/security`;

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: #eff6ff; border-radius: 6px; color: #2563eb; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        🔑 New Sign-In Detected
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Hi ${escapeHtml(userName)},
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        We detected a successful sign-in to your account on our website. Please review the activity details below to ensure it was you.
      </p>

      <!-- Activity Metadata Box -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
              <tr>
                <td width="35%" style="font-weight: 600; color: #64748b;">Activity:</td>
                <td><strong>Website Sign-In</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Time:</td>
                <td>${escapeHtml(activityTime)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Device / Browser:</td>
                <td>${escapeHtml(device)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">IP Address:</td>
                <td><code>${escapeHtml(ip)}</code></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Location:</td>
                <td>${escapeHtml(location)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Security Advisory Box -->
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #92400e;">
          <strong>Don't recognize this activity?</strong> If you did not log in at this time, someone else may have accessed your account. Protect your account immediately.
        </p>
      </div>

      <!-- Action Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #dc2626;">
            <a href="${secureUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              Secure My Account
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 19px;">
        If this was you, you can safely ignore this email. No action is required.
      </p>
    </div>
  `;

  const html = createBaseEmailLayout({
    title: 'New Sign-In Detected on Your Account',
    preheader: `Sign-in activity detected on ${activityTime} from ${device}`,
    contentHtml
  });

  const text = `
New Sign-In Detected on Your Account

Hi ${userName},

We detected a successful sign-in to your account on our website.

Activity: Website Sign-In
Time: ${activityTime}
Device: ${device}
IP Address: ${ip}
Location: ${location}

Don't recognize this activity? Secure your account here: ${secureUrl}
If this was you, you can safely ignore this notification.
  `.trim();

  return {
    subject: `Security Alert: New Sign-In to Your Account [${process.env.COMPANY_NAME || 'Our Website'}]`,
    html,
    text
  };
}

/**
 * Generate HTML & Text for Password Change Confirmation
 */
function renderPasswordChangeTemplate(data) {
  const userName = data.user?.name || 'Valued User';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const ip = data.activity?.ip || 'Not recorded';
  const device = data.activity?.device || data.activity?.userAgent || 'Web Browser';
  const resetUrl = data.activity?.actionUrl || `${process.env.COMPANY_WEBSITE || '#'}/forgot-password`;

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: #fef2f2; border-radius: 6px; color: #dc2626; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        🛡️ Password Changed Successfully
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Hi ${escapeHtml(userName)},
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        This email confirms that the password for your account was recently updated.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
              <tr>
                <td width="35%" style="font-weight: 600; color: #64748b;">Activity:</td>
                <td><strong>Password Reset / Changed</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Time:</td>
                <td>${escapeHtml(activityTime)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Device:</td>
                <td>${escapeHtml(device)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">IP Address:</td>
                <td><code>${escapeHtml(ip)}</code></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #991b1b;">
          <strong>Didn't make this change?</strong> Please reset your password immediately and contact support to lock unauthorized access.
        </p>
      </div>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #ef4444;">
            <a href="${resetUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              Recover Account Immediately
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = createBaseEmailLayout({
    title: 'Your Password Was Changed',
    preheader: `Confirmation: Your account password was updated on ${activityTime}`,
    contentHtml
  });

  const text = `
Password Changed Successfully

Hi ${userName},

Your account password was updated on ${activityTime} from ${device} (${ip}).

If you did not initiate this change, reset your account immediately: ${resetUrl}
  `.trim();

  return {
    subject: `Security Alert: Your Password Was Changed [${process.env.COMPANY_NAME || 'Our Website'}]`,
    html,
    text
  };
}

/**
 * Generate HTML & Text for Registration / Welcome Activity
 */
function renderSignupTemplate(data) {
  const userName = data.user?.name || 'there';
  const activityTime = data.activity?.timestamp || new Date().toUTCString();
  const dashboardUrl = data.activity?.actionUrl || `${process.env.COMPANY_WEBSITE || '#'}/dashboard`;

  const contentHtml = `
    <div style="text-align: left;">
      <div style="display: inline-block; padding: 6px 12px; background: #ecfdf5; border-radius: 6px; color: #059669; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
        🎉 Welcome to the Family!
      </div>
      
      <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
        Welcome aboard, ${escapeHtml(userName)}!
      </h1>
      
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
        We're thrilled to confirm that your account was successfully created. You're now ready to explore everything our website has to offer.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
              <tr>
                <td width="35%" style="font-weight: 600; color: #64748b;">Account Email:</td>
                <td><strong>${escapeHtml(data.user?.email || 'N/A')}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Registration Date:</td>
                <td>${escapeHtml(activityTime)}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #64748b;">Status:</td>
                <td><span style="color: #059669; font-weight: 600;">Active & Ready</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="border-radius: 6px; background: #2563eb;">
            <a href="${dashboardUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              Go to Your Dashboard
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const html = createBaseEmailLayout({
    title: 'Welcome to Our Website!',
    preheader: `Your account is ready, ${userName}. Get started today.`,
    contentHtml
  });

  const text = `
Welcome aboard, ${userName}!

Your account was created on ${activityTime}.
Go to your dashboard to get started: ${dashboardUrl}
  `.trim();

  return {
    subject: `Welcome to ${process.env.COMPANY_NAME || 'Our Website'} - Your Account Is Ready!`,
    html,
    text
  };
}

module.exports = {
  renderLoginTemplate,
  renderPasswordChangeTemplate,
  renderSignupTemplate
};
