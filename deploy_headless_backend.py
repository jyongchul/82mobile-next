#!/usr/bin/env python3
"""
Deploy headless WordPress backend configuration to 82mobile.com
- wp-config.php: Add JWT authentication defines
- .htaccess: Add Authorization passthrough, CORS, cache bypass
- headless-mode.php: MU-plugin to disable frontend
"""

import ftplib
import secrets
import sys
import os
from datetime import datetime

# FTP credentials
FTP_HOST = "82mobile.com"
FTP_PORT = 21
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"

# Paths
WP_CONFIG_PATH = "wp-config.php"
HTACCESS_PATH = ".htaccess"
MU_PLUGIN_PATH = "wp-content/mu-plugins/headless-mode.php"

def connect_ftp():
    """Connect to FTP server"""
    print(f"[FTP] Connecting to {FTP_HOST}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    print(f"[FTP] Connected successfully")
    return ftp

def download_file(ftp, remote_path):
    """Download file from FTP server"""
    print(f"[FTP] Downloading {remote_path}...")
    lines = []
    try:
        ftp.retrlines(f"RETR {remote_path}", lines.append)
        content = '\n'.join(lines)
        print(f"[FTP] Downloaded {len(content)} bytes")
        return content
    except Exception as e:
        print(f"[ERROR] Failed to download {remote_path}: {e}")
        return None

def upload_file(ftp, remote_path, content):
    """Upload file to FTP server"""
    print(f"[FTP] Uploading {remote_path}...")
    try:
        from io import BytesIO
        bio = BytesIO(content.encode('utf-8'))
        ftp.storbinary(f"STOR {remote_path}", bio)
        print(f"[FTP] Uploaded {len(content)} bytes")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to upload {remote_path}: {e}")
        return False

def backup_file(content, filename):
    """Save backup locally"""
    backup_dir = "backups"
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{backup_dir}/{filename}.backup_{timestamp}"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[BACKUP] Saved to {backup_path}")
    return backup_path

def generate_jwt_secret():
    """Generate secure JWT secret key (64 characters)"""
    return secrets.token_urlsafe(48)

def modify_wp_config(content, jwt_secret):
    """Add JWT defines to wp-config.php before 'That's all' line"""

    # Check if JWT defines already exist
    if "JWT_AUTH_SECRET_KEY" in content:
        print("[INFO] JWT_AUTH_SECRET_KEY already exists in wp-config.php")
        return content

    # Find the insertion point
    stop_editing_line = "/* That's all, stop editing!"

    if stop_editing_line not in content:
        print("[ERROR] Cannot find insertion point in wp-config.php")
        return None

    jwt_defines = f"""
/* JWT Authentication Configuration */
define('JWT_AUTH_SECRET_KEY', '{jwt_secret}');
define('JWT_AUTH_CORS_ENABLE', true);

"""

    # Insert before "That's all" line
    modified = content.replace(stop_editing_line, jwt_defines + stop_editing_line)

    print(f"[INFO] Added JWT defines (secret: {jwt_secret[:8]}...)")
    return modified

def modify_htaccess(content):
    """Add Authorization passthrough, CORS, and cache bypass to .htaccess"""

    # Check if rules already exist
    if "JWT Authorization header passthrough" in content:
        print("[INFO] JWT rules already exist in .htaccess")
        return content

    # Find WordPress rewrite rules start
    # We'll add our rules BEFORE the WordPress section
    wordpress_marker = "# BEGIN WordPress"

    new_rules = """# BEGIN 82Mobile Headless Configuration
# JWT Authorization header passthrough (required for Gabia shared hosting)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP:Authorization} ^(.*)
  RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
</IfModule>

# CORS and cache bypass for API endpoints
<IfModule mod_headers.c>
  <If "%{REQUEST_URI} =~ m#^/wp-json/#">
    Header set Access-Control-Allow-Origin "https://82mobile-next.vercel.app"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </If>
  SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
</IfModule>
# END 82Mobile Headless Configuration

"""

    if wordpress_marker in content:
        # Insert before WordPress section
        modified = content.replace(wordpress_marker, new_rules + wordpress_marker)
        print("[INFO] Added headless rules before WordPress section")
    else:
        # No WordPress section, add at the beginning
        modified = new_rules + content
        print("[INFO] Added headless rules at beginning of .htaccess")

    return modified

def create_headless_mode_plugin():
    """Create headless-mode.php MU-plugin content"""
    return """<?php
/*
 * Plugin Name: 82Mobile Headless Mode
 * Description: Disables WordPress frontend, preserves wp-admin and wp-json access
 * Version: 1.0
 * Author: Whitehat Marketing
 */

add_action('template_redirect', function() {
    // Allow admin area
    if (is_admin()) {
        return;
    }

    // Allow REST API
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') === 0) {
        return;
    }

    // Allow login page
    if (strpos($_SERVER['REQUEST_URI'], '/wp-login.php') !== false) {
        return;
    }

    // Allow wp-admin (redirect handling)
    if (strpos($_SERVER['REQUEST_URI'], '/wp-admin') !== false) {
        return;
    }

    // Allow OPTIONS preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return;
    }

    // Block everything else - this site is API-only
    status_header(404);
    nocache_headers();
    echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>82Mobile - API Only</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #c8102e; }
        p { color: #666; line-height: 1.6; }
        a { color: #0047ba; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>82Mobile</h1>
        <p>This site operates in headless mode and serves as an API-only backend.</p>
        <p>The frontend is hosted separately. Visit <a href="https://82mobile-next.vercel.app">82mobile-next.vercel.app</a> for the public website.</p>
        <p>For administration, visit <a href="/wp-admin">wp-admin</a>.</p>
    </div>
</body>
</html>';
    exit;
}, 1);
"""

def ensure_mu_plugins_dir(ftp):
    """Ensure mu-plugins directory exists"""
    try:
        # Try to change to mu-plugins directory
        ftp.cwd("/wp-content/mu-plugins")
        ftp.cwd("/")
        print("[INFO] mu-plugins directory exists")
        return True
    except:
        # Directory doesn't exist, create it
        print("[INFO] Creating mu-plugins directory...")
        try:
            ftp.cwd("/wp-content")
            ftp.mkd("mu-plugins")
            ftp.cwd("/")
            print("[INFO] Created mu-plugins directory")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to create mu-plugins directory: {e}")
            return False

def main():
    print("=" * 60)
    print("82Mobile Headless Backend Deployment")
    print("=" * 60)
    print()

    try:
        ftp = connect_ftp()

        # Generate JWT secret
        jwt_secret = generate_jwt_secret()
        print(f"[JWT] Generated secret key: {jwt_secret[:8]}...{jwt_secret[-8:]}")
        print()

        # === 1. wp-config.php ===
        print("--- Step 1: wp-config.php ---")
        wp_config_content = download_file(ftp, WP_CONFIG_PATH)
        if wp_config_content:
            backup_file(wp_config_content, "wp-config.php")
            modified_wp_config = modify_wp_config(wp_config_content, jwt_secret)
            if modified_wp_config and modified_wp_config != wp_config_content:
                if upload_file(ftp, WP_CONFIG_PATH, modified_wp_config):
                    print("[SUCCESS] wp-config.php updated with JWT configuration")
                else:
                    print("[FAILED] Could not upload wp-config.php")
            elif modified_wp_config == wp_config_content:
                print("[SKIP] wp-config.php already configured")
            else:
                print("[FAILED] Could not modify wp-config.php")
        else:
            print("[FAILED] Could not download wp-config.php")
        print()

        # === 2. .htaccess ===
        print("--- Step 2: .htaccess ---")
        htaccess_content = download_file(ftp, HTACCESS_PATH)
        if htaccess_content:
            backup_file(htaccess_content, ".htaccess")
            modified_htaccess = modify_htaccess(htaccess_content)
            if modified_htaccess and modified_htaccess != htaccess_content:
                if upload_file(ftp, HTACCESS_PATH, modified_htaccess):
                    print("[SUCCESS] .htaccess updated with CORS and cache bypass")
                else:
                    print("[FAILED] Could not upload .htaccess")
            elif modified_htaccess == htaccess_content:
                print("[SKIP] .htaccess already configured")
            else:
                print("[FAILED] Could not modify .htaccess")
        else:
            print("[FAILED] Could not download .htaccess")
        print()

        # === 3. headless-mode.php MU-plugin ===
        print("--- Step 3: headless-mode.php MU-plugin ---")
        if ensure_mu_plugins_dir(ftp):
            mu_plugin_content = create_headless_mode_plugin()
            if upload_file(ftp, MU_PLUGIN_PATH, mu_plugin_content):
                print("[SUCCESS] headless-mode.php MU-plugin deployed")
            else:
                print("[FAILED] Could not upload headless-mode.php")
        else:
            print("[FAILED] Could not create mu-plugins directory")
        print()

        ftp.quit()
        print("=" * 60)
        print("DEPLOYMENT COMPLETE")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Wait 1-2 minutes for server cache to clear")
        print("2. Run verification script: python3 verify_headless_deployment.py")
        print("3. Install JWT Authentication plugin via WordPress admin")

        # Save JWT secret for reference
        with open("JWT_SECRET.txt", "w") as f:
            f.write(f"JWT_AUTH_SECRET_KEY={jwt_secret}\n")
        print()
        print(f"JWT secret saved to JWT_SECRET.txt")

        return 0

    except Exception as e:
        print(f"[FATAL ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
