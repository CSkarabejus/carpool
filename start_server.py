#!/usr/bin/env python3
"""
SplitRide - Local Development & Phone Testing Server
Starts an HTTP server accessible both locally and across the Wi-Fi network for Poco X4 Pro.
"""

import http.server
import socketserver
import socket
import os
import sys
import webbrowser

PORT = 8000

def get_local_ip():
    try:
        # Create a dummy socket to detect preferred outbound interface
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for local PWA testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    local_ip = get_local_ip()

    # Find free port if 8000 is taken
    port = PORT
    for attempt_port in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", attempt_port), CustomHandler) as httpd:
                port = attempt_port
                break
        except OSError:
            continue

    print("=" * 60)
    print("  🚗 SplitRide - Carpool Fuel Splitter App")
    print("=" * 60)
    print(f"  💻 On PC / Mac:")
    print(f"     Open: http://localhost:{port}")
    print()
    print(f"  📱 On your Poco X4 Pro (connected to same Wi-Fi):")
    print(f"     Open Chrome and navigate to:")
    print(f"     👉 http://{local_ip}:{port}")
    print("=" * 60)
    print("  ⭐ To install as an app on your Poco X4 Pro:")
    print("     1. Open http://{}:{}/ in Chrome on your phone".format(local_ip, port))
    print("     2. Tap the 3 dots (⋮) at top-right -> 'Install app' or 'Add to Home screen'")
    print("=" * 60)
    print("  Press Ctrl+C to stop the server\n")

    # Try to open browser on PC automatically
    try:
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        pass

    with socketserver.TCPServer(("", port), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Goodbye!")
            sys.exit(0)

if __name__ == '__main__':
    main()
