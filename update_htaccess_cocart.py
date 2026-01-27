#!/usr/bin/env python3
"""
Update .htaccess to add CoCart-API-Cart-Key to CORS headers
"""
import ftplib
import re

FTP_HOST = "82mobile.com"
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"

def main():
    print(f"Connecting to {FTP_HOST}...")
    ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS)
    print("✓ Connected")

    try:
        # Download current .htaccess
        print("Downloading current .htaccess...")
        htaccess_lines = []
        ftp.retrlines('RETR .htaccess', htaccess_lines.append)
        current_content = '\n'.join(htaccess_lines)

        # Backup
        with open('/mnt/c/82Mobile/82mobile-next/.htaccess.backup', 'w') as f:
            f.write(current_content)
        print("✓ Backed up to .htaccess.backup")

        # Update Access-Control-Allow-Headers to include CoCart-API-Cart-Key
        updated_content = re.sub(
            r'(Header set Access-Control-Allow-Headers\s+)"([^"]+)"',
            lambda m: f'{m.group(1)}"{m.group(2)}, CoCart-API-Cart-Key"' if 'CoCart-API-Cart-Key' not in m.group(2) else m.group(0),
            current_content
        )

        # Check if update was made
        if updated_content == current_content:
            print("⚠ No changes needed - CoCart-API-Cart-Key already in CORS headers or no CORS headers found")
        else:
            print("Uploading updated .htaccess...")
            with open('/tmp/.htaccess.new', 'w') as f:
                f.write(updated_content)

            with open('/tmp/.htaccess.new', 'rb') as f:
                ftp.storbinary('STOR .htaccess', f)

            print("✓ .htaccess updated with CoCart-API-Cart-Key header")

            # Show the change
            print("\nUpdated CORS header:")
            for line in updated_content.split('\n'):
                if 'Access-Control-Allow-Headers' in line:
                    print(f"  {line.strip()}")

    finally:
        ftp.quit()

if __name__ == '__main__':
    main()
