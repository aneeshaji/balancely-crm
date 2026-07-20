<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Balancely CRM Password Has Been Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #eef2f5;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #ef4444; padding: 40px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: rgba(255,255,255,0.15); padding: 12px; border-radius: 10px;">
                                        <span style="font-size: 24px; color: #ffffff; font-weight: bold; line-height: 1;">🔒</span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 16px 0 8px 0; letter-spacing: -0.5px;">Balancely CRM</h1>
                            <p style="color: #fca5a5; font-size: 14px; margin: 0; font-weight: 500;">Password Reset Notification</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #334155; font-size: 16px; line-height: 1.6;">
                            <p style="margin-top: 0; font-weight: 600; font-size: 18px; color: #1e293b;">Hello {{ $user->name }},</p>
                            <p style="margin-bottom: 24px;">Your password for <strong>Balancely CRM</strong> has been reset by an administrator. Please use the new credentials below to log in:</p>
                            
                            <!-- Credentials Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="30%" style="color: #64748b; font-size: 14px; font-weight: 600; padding-bottom: 10px;">Email:</td>
                                                <td width="70%" style="color: #0f172a; font-size: 14px; font-weight: 600; padding-bottom: 10px; font-family: monospace;">{{ $user->email }}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; font-weight: 600;">New Password:</td>
                                                <td style="color: #0f172a; font-size: 14px; font-weight: 600; font-family: monospace;">{{ $password }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin-bottom: 30px; color: #64748b; font-size: 14px;">If you did not request this password reset, please contact your workspace administrator immediately.</p>
                            
                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url('/') }}" target="_blank" style="background-color: #4f46e5; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15);">
                                            Sign In to Workspace
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px; border-top: 1px solid #f1f5f9; background-color: #fafafa; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                            <p style="margin: 0 0 4px 0;">This email was automatically sent from Balancely CRM.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
