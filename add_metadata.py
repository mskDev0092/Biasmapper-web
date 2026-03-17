from pypdf import PdfReader, PdfWriter

pdf_path = '/home/z/my-project/download/BiasMapper_Analysis_Report.pdf'

reader = PdfReader(pdf_path)
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.add_metadata({
    '/Title': 'BiasMapper Analysis Report',
    '/Author': 'Z.ai',
    '/Subject': 'Media Bias Analysis using BiasMapper Framework',
    '/Creator': 'Z.ai'
})

with open(pdf_path, 'wb') as output:
    writer.write(output)

print(f"Metadata added to {pdf_path}")
