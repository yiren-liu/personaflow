import re
import pymupdf4llm

class PDFToText:
    def __init__(self):
        pass

    def clean_text(self, md_text):
        """"
        First searches for references section which can occurs with any number of # and removes any text after that.
        """
        pattern = re.compile(r'(^|\n)#+\s*References.*', re.IGNORECASE)
        match = pattern.search(md_text)
        if match:
            # Remove everything after the "References" section
            md_text = md_text[:match.start()]
        return md_text


    def to_text(self, pdf_path):
        md_text = pymupdf4llm.to_markdown(pdf_path)
        return self.clean_text(md_text)
    
    def get_university(self,pdf_path):
        md_text = pymupdf4llm.to_markdown(pdf_path,pages=[0])
        institution_pattern = r"(?i)([A-Za-z\s,]+(?:University|Institute of Technology|College)[A-Za-z\s,]*)"
        institutions = re.findall(institution_pattern, md_text)
        unique_institutions = list(set(institutions))
        return unique_institutions

if __name__ == "__main__":
    pdf_to_text = PDFToText()
    # print(pdf_to_text.to_text('coquest.pdf'))
    print(pdf_to_text.get_university('SSR.pdf'))