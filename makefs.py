import argparse
from enum import Enum

class MakeHtmlCClass:
    class TypeContent(Enum):
        application_EDI_X12 = 'application/EDI-X12'
        application_EDIFACTapplication_javascript = 'application/EDIFACTapplication/javascript'
        application_octet_stream = 'application/octet-stream'
        application_ogg = 'application/ogg'
        application_pdfapplication_xhtml_xml = 'application/pdfapplication/xhtml+xml'
        application_x_shockwave_flash = 'application/x-shockwave-flash'
        application_json = 'application/json'
        application_ld_json = 'application/ld+json'
        application_xml = 'application/xml'
        application_zip = 'application/zip'
        application_x_www_form_urlencoded = 'application/x-www-form-urlencoded'
        audio_mpeg = 'audio/mpeg'
        audio_x_ms_wma = 'audio/x-ms-wma'
        audio_vn_rn_realaudio = 'audio/vnd.rn-realaudio'
        audio_x_wav = 'audio/x-wav'
        image_gif = 'image/gif'
        image_jpeg = 'image/jpeg'
        image_png = 'image/png'
        image_tiff = 'image/tiff'
        image_vnd_microsoft_icon = 'image/vnd.microsoft.icon'
        image_x_icon = 'image/x-icon'
        image_vnd_djvu = 'image/vnd.djvu'
        image_svg_xml = 'image/svg+xml'
        multipart_mixed = 'multipart/mixed'
        multipart_alternative = 'multipart/alternative'
        multipart_related = 'multipart/related'
        multipart_form_data = 'multipart/form-data'
        text_css = 'text/css'
        text_csv = 'text/csv'
        text_html = 'text/html'
        text_javascript = 'text/javascript'
        text_plain = 'text/plain'
        text_xml = 'text/xml'
        video_mpeg = 'video/mpeg'
        video_mp4 = 'video/mp4'
        video_quicktime = 'video/quicktime'
        video_x_ms_wmv = 'video/x-ms-wmv'
        video_x_msvideo = 'video/x-msvideo'
        video_x_flv = 'video/x-flv'
        video_webm = 'video/webm'
        application_vnd_oasis_opendocument_text = 'application/vnd.oasis.opendocument.text'
        application_vnd_oasis_opendocument_spreadsheet = 'application/vnd.oasis.opendocument.spreadsheet'
        application_vnd_oasis_opendocument_presentation = 'application/vnd.oasis.opendocument.presentation'
        application_vnd_oasis_opendocument_graphics = 'application/vnd.oasis.opendocument.graphics'
        application_vnd_ms_excel = 'application/vnd.ms-excel'
        application_vnd_openxmlformats_officedocument_spreadsheetml_sheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        application_vnd_ms_powerpoint = 'application/vnd.ms-powerpoint'
        application_vnd_openxmlformats_officedocument_presentationml_presentation = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        application_msword = 'application/msword'
        application_vnd_openxmlformats_officedocument_wordprocessingml_document = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        application_vnd_mozilla_xul_xml = 'application/vnd.mozilla.xul+xml'

        @classmethod
        def get_all_values(cls):
            values = list()
            for v in cls:
                values.append(v.value)
            return values

    def __init__(self, path_in, path_out, uri, server_name, header, content_type=None):
        self.path_in = path_in
        self.path_out = path_out
        with open(self.path_in, "r") as fl:
            self.content = fl.read()

        self.validate_content_type(content_type)
        self.contentType = content_type
        self.contentSize  = self.determine_content_size()
        self.template = {
            "": uri + "\0\0\0",
            "HTTP": header + "\r\n",
            "Server ": server_name + "\r\n",
            "Content-Length: ":self.contentSize +"\r\n",
            "Content-Type: ":self.contentType +"\r\n",
        }

    def validate_content_type(self, content_type):
        if content_type not in self.TypeContent.get_all_values():
            raise Exception(f"Content-Type is not Valid use values f{self.TypeContent.get_all_values()}")


    def determine_content_size(self):
        return str(len(self.content))

    def create_name_variable(self):
        return self.template[""][1:].replace(".", "_").replace("\0", "")

    def prepare_content(self, content):
        hex_content = ""
        i = 0
        for elem in content:
            hex_content +='0x' + elem.encode("utf-8").hex() + ","
            i+=1
            if i%10 == 9:
                hex_content+="\n"
        return hex_content[:-1]

    def create_arr(self):
        hex_out = f"static const unsigned char FSDATA_ALIGN_PRE {self.create_name_variable()}[] FSDATA_ALIGN_POST = " + "{"
        for k,v in self.template.items():
            hex_template = f"\n/* {k}{v[:-2]} */ \n"
            hex_key = self.prepare_content(k)#['0x'+elem.encode("utf-8").hex() for elem in k]
            hex_value = self.prepare_content(v)#['0x'+elem.encode("utf-8").hex() for elem in v]
            hex_out += hex_template + hex_key + ("," if k != "" else "" )+ hex_value + ","
        hex_out += "\n/* Content_Info*/\n"
        hex_out +=  self.prepare_content(self.content)+ "}"
        print(hex_out)
        return hex_out

    def make_file(self):
        with open(self.path_out, "w") as fl:
            fl.write(self.create_arr())

parser = argparse.ArgumentParser(
                    prog='Makefs Program',
                    description='This program generate c file of source object',
                    epilog='')

parser.add_argument("-i","--infile", type=str, help='Input file')
parser.add_argument("-o","--outfile", type=str, help='Output file')
parser.add_argument("-u","--uri", type=str, help="uri of file like as /test.html", default="/test.html")
parser.add_argument("-s","--server", type=str, help="Server information", default="defaultServer")
parser.add_argument("-p","--protocol", type=str, help="Header of protocol like as /1.0 200 OK", default="/1.0 200 OK")
parser.add_argument("-c", "--content", type=str, help="content-type", default="text/html")
args = parser.parse_args()

if __name__ == "__main__":
    m = MakeHtmlCClass(path_in = args.infile , path_out = args.outfile, uri=args.uri, server_name=args.server, header=args.protocol, content_type=args.content)
    m.make_file()