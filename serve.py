"""Servidor de vista previa; no forma parte del backend ni se usa en GitHub Pages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path.rstrip('/') in {'/dev', '/qa', '/uat', '/prod'}:
            self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    print('Local: http://127.0.0.1:8765/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8765), PreviewHandler).serve_forever()
