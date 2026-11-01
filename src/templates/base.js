/**
 * Base HTML Email Layout Template
 * Compatible with major email clients (Gmail, Outlook, Apple Mail, etc.)
 */

function createBaseEmailLayout({
  title,
  preheader,
  contentHtml,
  companyName = process.env.COMPANY_NAME || 'Our Website',
  companyLogo = process.env.COMPANY_LOGO_URL || '',
  companyWebsite = process.env.COMPANY_WEBSITE || '#',
  supportEmail = process.env.SUPPORT_EMAIL || 'support@example.com',
  year = new Date().getFullYear(),
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    
    /* Responsive styles */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .content-cell { padding: 24px 18px !important; }
      .meta-box { padding: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; -webkit-font-smoothing: antialiased;">
  <!-- Hidden preheader text for email inbox preview -->
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(preheader || title)}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 32px 0;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; background: #0f172a; text-align: left; border-bottom: 3px solid #3b82f6;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    ${companyLogo ? `<img src="${companyLogo}" alt="${escapeHtml(companyName)}" width="36" height="36" style="vertical-align: middle; margin-right: 12px; border-radius: 6px;">` : ''}
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">
                      ${escapeHtml(companyName)}
                    </span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; background: #1e293b; padding: 4px 10px; border-radius: 20px;">
                      Activity Notification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="content-cell" style="padding: 36px 36px 28px 36px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 24px 36px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; line-height: 18px;">
              <p style="margin: 0 0 8px 0; font-weight: 500;">
                You received this confirmation email because an activity was registered on your account at <a href="${companyWebsite}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(companyName)}</a>.
              </p>
              <p style="margin: 0 0 12px 0;">
                Need help or didn't do this? Contact our support team immediately at <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(supportEmail)}</a>.
              </p>
              <p style="margin: 0; color: #94a3b8;">
                &copy; ${year} ${escapeHtml(companyName)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  createBaseEmailLayout,
  escapeHtml
};
