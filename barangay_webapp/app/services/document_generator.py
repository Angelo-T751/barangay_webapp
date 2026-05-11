from fpdf import FPDF

class DocumentGenerator:
    @staticmethod
    def generate_certificate(user_data, cert_type):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        
        pdf.cell(200, 10, txt=f"OFFICIAL {cert_type.replace('_', ' ')}", ln=True, align='C')
        pdf.set_font("Arial", size=12)
        pdf.ln(10)
        pdf.cell(200, 10, txt=f"Issued to: {user_data['name']}", ln=True)
        pdf.cell(200, 10, txt=f"Date: {user_data['date']}", ln=True)
        
        file_path = f"outputs/{user_data['id']}_{cert_type}.pdf"
        pdf.output(file_path)
        return file_path
