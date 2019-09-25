from BaseHTTPServer import BaseHTTPRequestHandler
import urlparse
import time
import gzip
import os

class GetHandler(BaseHTTPRequestHandler):
    
    # def do_GET(self):
    #     self.send_response(200)
    #     self.send_header('Last-Modified', self.date_time_string(time.time()))
    #     self.end_headers()
    #     self.wfile.write('Response body\n')
    #     return

    #     def do_GET(self):
    #     parsed_path = urlparse.urlparse(self.path)
    #     message_parts = [
    #             'CLIENT VALUES:',
    #             'client_address=%s (%s)' % (self.client_address,
    #                                         self.address_string()),
    #             'command=%s' % self.command,
    #             'path=%s' % self.path,
    #             'real path=%s' % parsed_path.path,
    #             'query=%s' % parsed_path.query,
    #             'request_version=%s' % self.request_version,
    #             '',
    #             'SERVER VALUES:',
    #             'server_version=%s' % self.server_version,
    #             'sys_version=%s' % self.sys_version,
    #             'protocol_version=%s' % self.protocol_version,
    #             '',
    #             'HEADERS RECEIVED:',
    #             ]
    #     for name, value in sorted(self.headers.items()):
    #         message_parts.append('%s=%s' % (name, value.rstrip()))
    #     message_parts.append('')
    #     message = '\r\n'.join(message_parts)
    #     self.send_response(200)
    #     self.end_headers()
    #     self.wfile.write(message)
    #     return

    def do_GET(self):
        # Parse URL.
        parsed_path = urlparse.urlparse(self.path)
        file_path = '.' + parsed_path.path
        url_parts = parsed_path.path.split('/')

        # Determine file type.
        file_type = url_parts[-1].split('.')[-1]

        data_present = 0
        if "data" in url_parts:
            data_present = 1
            
            print("data present:", file_path)

            if file_type == "gz":
                
                self.send_response(200)
                self.send_header('Transfer-Encoding', 'gzip')
                self.send_header("Content-Type", "application/json");
                self.send_header("Content-Encoding", "gzip");
                self.send_header("Vary", "Accept-Encoding");
                self.send_header("Content-Disposition","gzip");
                self.send_header("Content-Length", os.path.getsize(file_path))
                print("file size =", os.path.getsize(file_path))
                self.end_headers()
                self.wfile.write(open(file_path, 'rb').read())
                print("finished sending gz")
            elif file_type == "json":
                self.send_response(200)
                self.send_header("Content-Type", "application/json");
                self.end_headers()
                self.wfile.write(open(file_path, 'r').read())
                print("finished sending json")
            else:
                data_present = 0

        if data_present == 0:
            print("data not present:", file_path)
            if os.path.isfile(file_path):
                self.send_response(200)

                if file_type == "ttf":
                    self.send_header("Content-Type", "application/font-sfnt")


                self.end_headers()
                self.wfile.write(open(file_path, 'r').read())
            else:   
                self.send_response(404)
                self.end_headers()

        return



if __name__ == '__main__':
    from BaseHTTPServer import HTTPServer
    server = HTTPServer(('localhost', 8080), GetHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    server.serve_forever()