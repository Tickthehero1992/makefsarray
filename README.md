Here script for creating c array for LWIP http  web server.
Arguments to use:
"-i","--infile", type=str, help='Input file which you need to make arra'
"-o","--outfile", type=str, help='Output file'
"-u","--uri", type=str, help="uri of file like as /test.html", default="/test.html"
"-s","--server", type=str, help="Server information", default="defaultServer"
"-p","--protocol", type=str, help="Header of protocol like as /1.0 200 OK", default="/1.0 200 OK"
"-c", "--content", type=str, help="content-type", default="text/html"

Script validate content type, default type text/html

example:
 python makefs.py -i fs_dir/try.html -o fs_dir/try.c -u "/try.html" -u "/try.html" -s "MyServer" -p "/1.0 200 OK" -c "image/gif"