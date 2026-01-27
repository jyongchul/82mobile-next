#!/usr/bin/env python3
"""
Upload CoCart plugin to WordPress via FTP
"""
import ftplib
import os

FTP_HOST = "82mobile.com"
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"
LOCAL_PLUGIN_DIR = "/tmp/cart-rest-api-for-woocommerce"
REMOTE_PLUGIN_DIR = "/wp-content/plugins/cart-rest-api-for-woocommerce"

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively upload directory via FTP"""
    try:
        ftp.mkd(remote_dir)
        print(f"Created directory: {remote_dir}")
    except ftplib.error_perm:
        pass  # Directory already exists

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"

        if os.path.isfile(local_path):
            print(f"Uploading: {remote_path}")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
        elif os.path.isdir(local_path):
            upload_directory(ftp, local_path, remote_path)

def main():
    print(f"Connecting to {FTP_HOST}...")
    ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS)
    print("✓ Connected")

    try:
        # Upload plugin directory
        print(f"\nUploading CoCart plugin to {REMOTE_PLUGIN_DIR}...")
        upload_directory(ftp, LOCAL_PLUGIN_DIR, REMOTE_PLUGIN_DIR)

        print("\n✓ CoCart plugin uploaded successfully")
        print("\nNow activate it via WordPress admin or Playwright")

    finally:
        ftp.quit()

if __name__ == '__main__':
    main()
