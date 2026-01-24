#!/usr/bin/env python3
"""
Deploy CORS plugin to WordPress via FTP
This enables the Next.js frontend to access the WooCommerce API
"""

import os
from ftplib import FTP

# FTP credentials from KWON_ADAM_CREDENTIALS.md
FTP_HOST = "82mobile.com"
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"

# Deployment paths
LOCAL_FILE = "cors.php"
REMOTE_PATH = "/wp-content/mu-plugins/82mobile-cors.php"

def deploy_cors_plugin():
    """Upload CORS plugin to WordPress mu-plugins directory"""
    print("🚀 Deploying CORS plugin to WordPress...")

    # Check if local file exists
    if not os.path.exists(LOCAL_FILE):
        print(f"❌ Error: {LOCAL_FILE} not found!")
        print("   Make sure you're running this from the wordpress-setup directory")
        return False

    try:
        # Connect to FTP
        print(f"📡 Connecting to {FTP_HOST}...")
        ftp = FTP(FTP_HOST, FTP_USER, FTP_PASS)
        print("✅ Connected!")

        # Ensure mu-plugins directory exists
        print("📁 Checking mu-plugins directory...")
        try:
            ftp.cwd('/wp-content/mu-plugins')
            print("✅ mu-plugins directory exists")
        except:
            print("📁 Creating mu-plugins directory...")
            ftp.mkd('/wp-content/mu-plugins')
            ftp.cwd('/wp-content/mu-plugins')
            print("✅ Created mu-plugins directory")

        # Upload CORS plugin
        print(f"📤 Uploading {LOCAL_FILE}...")
        with open(LOCAL_FILE, 'rb') as f:
            ftp.storbinary(f'STOR 82mobile-cors.php', f)

        print("✅ CORS plugin deployed successfully!")
        print(f"   Remote path: {REMOTE_PATH}")

        # Verify upload
        print("\n📋 Verifying upload...")
        files = ftp.nlst()
        if '82mobile-cors.php' in files:
            print("✅ File verified on server")
        else:
            print("⚠️  Warning: Could not verify file on server")

        ftp.quit()

        print("\n" + "="*50)
        print("✅ CORS PLUGIN DEPLOYMENT COMPLETE")
        print("="*50)
        print("\n📝 Next steps:")
        print("1. The plugin is now active (mu-plugins auto-load)")
        print("2. Test API access:")
        print("   curl https://82mobile.com/wp-json/wc/v3/products \\")
        print("     -u 'your_consumer_key:your_consumer_secret'")
        print("\n3. If you get errors, check WordPress error log")
        print("   or contact the developer")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("="*50)
    print("82mobile CORS Plugin Deployment")
    print("="*50)
    print()

    success = deploy_cors_plugin()

    if not success:
        print("\n⚠️  Deployment failed. Please check the error and try again.")
        exit(1)

    print("\n✨ Deployment successful!")
