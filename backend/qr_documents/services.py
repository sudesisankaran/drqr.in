import io
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def generate_qr_image_bytes(data: str) -> io.BytesIO:
    """Generates a high-quality QR code as PNG in-memory bytes."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F766E", back_color="#FFFFFF")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer


def generate_record_pdf_bytes(record, target_url: str) -> io.BytesIO:
    """
    Generates a professional healthcare record document using ReportLab.
    Includes healthcare branding, record metadata, hospital details,
    facilities, doctor information, and embedded verification QR code.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F766E")   # Teal 700
    dark_text = colors.HexColor("#0F172A")       # Slate 900
    muted_text = colors.HexColor("#475569")      # Slate 600
    border_color = colors.HexColor("#CBD5E1")    # Slate 300
    card_bg = colors.HexColor("#F8FAFC")         # Slate 50
    header_bg = colors.HexColor("#F0FDFA")       # Teal 50

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=muted_text
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=6
    )

    label_style = ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=dark_text
    )

    val_style = ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=dark_text
    )

    footer_style = ParagraphStyle(
        'DocFooter',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=muted_text,
        alignment=1
    )

    elements = []

    # 1. Header Banner with QR Code
    qr_buffer = generate_qr_image_bytes(target_url)
    qr_img = Image(qr_buffer, width=1.3 * inch, height=1.3 * inch)

    header_text_elements = [
        Paragraph("MEDICAL HEALTH CARE MANAGEMENT SYSTEM", ParagraphStyle('SmallHdr', fontName='Helvetica-Bold', fontSize=8, textColor=primary_color)),
        Spacer(1, 2),
        Paragraph(f"{record.hospital_name.upper()}", title_style),
        Spacer(1, 4),
        Paragraph(f"Official Health Care Provider Record & Verification Certificate", subtitle_style),
        Paragraph(f"Registration Number: <b>{record.registration_number}</b> | License: <b>{record.license_number}</b>", subtitle_style),
    ]

    header_table = Table(
        [[header_text_elements, qr_img]],
        colWidths=[5.4 * inch, 1.8 * inch]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(header_table)

    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=12))

    # 2. Record Summary Metadata Card
    patient_ref = "N/A"
    if hasattr(record.patient, 'patient_profile'):
        patient_ref = record.patient.patient_profile.patient_reference_id

    meta_data = [
        [
            Paragraph("<b>Record Reference ID:</b>", label_style),
            Paragraph(f"REC-{str(record.id)[:8].upper()}", val_style),
            Paragraph("<b>Patient Ref ID:</b>", label_style),
            Paragraph(str(patient_ref), val_style),
        ],
        [
            Paragraph("<b>Date Registered:</b>", label_style),
            Paragraph(record.created_at.strftime("%B %d, %Y - %H:%M UTC"), val_style),
            Paragraph("<b>Last Updated:</b>", label_style),
            Paragraph(record.updated_at.strftime("%B %d, %Y - %H:%M UTC"), val_style),
        ],
        [
            Paragraph("<b>Verification Status:</b>", label_style),
            Paragraph("<font color='#059669'><b>● VERIFIED ACTIVE RECORD</b></font>", val_style),
            Paragraph("<b>Security Type:</b>", label_style),
            Paragraph("Cryptographically Linked QR Certificate", val_style),
        ]
    ]

    meta_table = Table(meta_data, colWidths=[1.8 * inch, 2.0 * inch, 1.6 * inch, 1.8 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), header_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_table)

    elements.append(Spacer(1, 14))

    # 3. Hospital Information Details
    elements.append(Paragraph("1. Hospital Identification & Contact Details", heading_style))

    hospital_info_data = [
        [
            Paragraph("<b>Hospital Name:</b>", label_style),
            Paragraph(record.hospital_name, val_style),
            Paragraph("<b>Hospital Type:</b>", label_style),
            Paragraph(record.hospital_type, val_style),
        ],
        [
            Paragraph("<b>Registration No.:</b>", label_style),
            Paragraph(record.registration_number, val_style),
            Paragraph("<b>License No.:</b>", label_style),
            Paragraph(record.license_number, val_style),
        ],
        [
            Paragraph("<b>Doctor-in-Charge:</b>", label_style),
            Paragraph(record.doctor_in_charge, val_style),
            Paragraph("<b>Official Email:</b>", label_style),
            Paragraph(record.official_email, val_style),
        ],
        [
            Paragraph("<b>Contact Phone:</b>", label_style),
            Paragraph(record.contact_number, val_style),
            Paragraph("<b>Full Location:</b>", label_style),
            Paragraph(f"{record.city}, {record.district}, {record.state} - {record.pincode}", val_style),
        ],
        [
            Paragraph("<b>Physical Address:</b>", label_style),
            Paragraph(record.address, val_style),
            Paragraph("<b>Record Owner:</b>", label_style),
            Paragraph(f"{record.patient.full_name} ({record.patient.email})", val_style),
        ]
    ]

    hospital_table = Table(hospital_info_data, colWidths=[1.6 * inch, 2.2 * inch, 1.6 * inch, 1.8 * inch])
    hospital_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), card_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(hospital_table)

    elements.append(Spacer(1, 14))

    # 4. Medical Specializations & Facilities
    elements.append(Paragraph("2. Specializations & Medical Facilities", heading_style))

    spec_fac_data = [
        [
            Paragraph("<b>Specializations:</b>", label_style),
            Paragraph(record.specializations or "Not specified", val_style),
        ],
        [
            Paragraph("<b>Available Facilities:</b>", label_style),
            Paragraph(record.facilities or "Not specified", val_style),
        ]
    ]

    spec_table = Table(spec_fac_data, colWidths=[1.8 * inch, 5.4 * inch])
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), card_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(spec_table)

    elements.append(Spacer(1, 16))

    # 5. Verification Notice & Signature Section
    sign_section = [
        [
            Paragraph(
                "<b>Security & Authenticity Note:</b><br/>"
                "This document is an authentic digital healthcare record generated by the Medical Health Care Management System. "
                "Scan the QR code above or visit the verification portal to validate the official registration details.",
                subtitle_style
            ),
            Paragraph(
                "<br/><br/>"
                "____________________________________<br/>"
                f"<b>Authorized Signature</b><br/>"
                f"{record.doctor_in_charge}<br/>"
                f"<font size='8'>{record.hospital_name}</font>",
                ParagraphStyle('SignStyle', fontName='Helvetica', fontSize=8, leading=11, alignment=1)
            )
        ]
    ]
    sign_table = Table(sign_section, colWidths=[4.8 * inch, 2.4 * inch])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(KeepTogether(sign_table))

    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceBefore=4, spaceAfter=8))
    elements.append(Paragraph(
        f"Generated on {record.updated_at.strftime('%Y-%m-%d')} | Record UUID: {record.id} | Confidential Medical Management System",
        footer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_patient_summary_pdf_bytes(patient_profile, qr_identity, hospitals=None, records=None, documents=None, requesting_hospital=None) -> io.BytesIO:
    """
    Generates an official Patient Clinical Summary Report PDF using ReportLab.
    Features:
    - Patient demographics and emergency details
    - Embedded ONE permanent patient QR code
    - Registered hospitals list
    - Authorized clinical visit records
    - Medical documents registry
    - Confidential verification stamp
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor("#0F766E")   # Teal 700
    dark_text = colors.HexColor("#0F172A")       # Slate 900
    muted_text = colors.HexColor("#475569")      # Slate 600
    border_color = colors.HexColor("#CBD5E1")    # Slate 300
    card_bg = colors.HexColor("#F8FAFC")         # Slate 50
    header_bg = colors.HexColor("#F0FDFA")       # Teal 50

    title_style = ParagraphStyle(
        'PatTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        'PatSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=muted_text
    )

    heading_style = ParagraphStyle(
        'PatHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceAfter=4
    )

    label_style = ParagraphStyle(
        'PatLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=dark_text
    )

    val_style = ParagraphStyle(
        'PatVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=dark_text
    )

    elements = []

    # 1. Header with QR code side by side
    target_url = qr_identity.get_target_url()
    qr_buffer = io.BytesIO(qr_identity.generate_qr_png_bytes())
    qr_image = Image(qr_buffer, width=1.35 * inch, height=1.35 * inch)

    hosp_name = requesting_hospital.hospital_name if requesting_hospital else "MediQR Healthcare System"

    header_text = [
        Paragraph(f"<b>{hosp_name}</b>", title_style),
        Paragraph("<b>PATIENT CLINICAL SUMMARY & IDENTITY DOSSIER</b>", subtitle_style),
        Spacer(1, 4),
        Paragraph(f"<b>Patient Reference ID:</b> <font color='#0F766E'>{patient_profile.patient_reference_id}</font>", label_style),
        Paragraph(f"<b>QR Identity UUID:</b> <font size='7'>{qr_identity.public_uuid}</font>", subtitle_style),
        Paragraph("Scan QR for secure digital patient verification", subtitle_style),
    ]

    header_table = Table([[header_text, qr_image]], colWidths=[5.6 * inch, 1.6 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=8))

    # 2. Patient Profile Information Card
    elements.append(Paragraph("<b>PATIENT PROFILE & CONTACT INFORMATION</b>", heading_style))

    pat_name = patient_profile.effective_full_name
    pat_phone = patient_profile.effective_phone or "Not provided"
    pat_email = patient_profile.effective_email or "Not provided"
    pat_dob = str(patient_profile.date_of_birth) if patient_profile.date_of_birth else "Not provided"
    pat_gender = patient_profile.gender.capitalize() if patient_profile.gender else "Not specified"
    pat_addr = f"{patient_profile.address}, {patient_profile.city}, {patient_profile.district}, {patient_profile.state} - {patient_profile.pincode}" if patient_profile.address else "Not provided"
    pat_emg = patient_profile.emergency_contact or "Not specified"

    demo_data = [
        [
            Paragraph("<b>Full Name:</b>", label_style), Paragraph(pat_name, val_style),
            Paragraph("<b>Date of Birth:</b>", label_style), Paragraph(pat_dob, val_style),
        ],
        [
            Paragraph("<b>Phone Number:</b>", label_style), Paragraph(pat_phone, val_style),
            Paragraph("<b>Gender:</b>", label_style), Paragraph(pat_gender, val_style),
        ],
        [
            Paragraph("<b>Email Address:</b>", label_style), Paragraph(pat_email, val_style),
            Paragraph("<b>Emergency Contact:</b>", label_style), Paragraph(pat_emg, val_style),
        ],
        [
            Paragraph("<b>Address:</b>", label_style), Paragraph(pat_addr, val_style),
            Paragraph("<b>Permanent QR:</b>", label_style), Paragraph("Active & Linked", val_style),
        ],
    ]

    demo_table = Table(demo_data, colWidths=[1.4 * inch, 2.2 * inch, 1.4 * inch, 2.2 * inch])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), card_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(demo_table)
    elements.append(Spacer(1, 10))

    # 3. Clinical Visit Records
    if records:
        elements.append(Paragraph("<b>AUTHORIZED CLINICAL VISIT RECORDS</b>", heading_style))
        rec_data = [
            [
                Paragraph("<b>Date</b>", label_style),
                Paragraph("<b>Hospital / Provider</b>", label_style),
                Paragraph("<b>Record Type / Title</b>", label_style),
                Paragraph("<b>Doctor-in-Charge</b>", label_style),
            ]
        ]
        for r in records[:8]:
            v_date = str(r.visit_date or r.created_at.strftime('%Y-%m-%d'))
            rec_data.append([
                Paragraph(v_date, val_style),
                Paragraph(r.hospital_name, val_style),
                Paragraph(f"{r.title}<br/><font color='#64748B'>{r.record_type}</font>", val_style),
                Paragraph(r.doctor_in_charge or "Staff Doctor", val_style),
            ])

        rec_table = Table(rec_data, colWidths=[1.1 * inch, 2.4 * inch, 2.3 * inch, 1.4 * inch])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), header_bg),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(rec_table)
        elements.append(Spacer(1, 10))

    # 4. Uploaded Medical Documents
    if documents:
        elements.append(Paragraph("<b>UPLOADED MEDICAL DOCUMENTS & LAB REPORTS</b>", heading_style))
        doc_data = [
            [
                Paragraph("<b>Title</b>", label_style),
                Paragraph("<b>Category</b>", label_style),
                Paragraph("<b>Record Date</b>", label_style),
                Paragraph("<b>File Details</b>", label_style),
            ]
        ]
        for d in documents[:8]:
            size_mb = f"{d.file_size / (1024*1024):.1f} MB" if d.file_size else "N/A"
            doc_data.append([
                Paragraph(d.title, val_style),
                Paragraph(d.category, val_style),
                Paragraph(str(d.record_date or "-"), val_style),
                Paragraph(f"{d.original_filename} ({size_mb})", val_style),
            ])

        doc_table = Table(doc_data, colWidths=[2.6 * inch, 1.6 * inch, 1.2 * inch, 1.8 * inch])
        doc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), header_bg),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(doc_table)
        elements.append(Spacer(1, 10))

    # 5. Footer & Notice
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceBefore=4, spaceAfter=6))
    elements.append(Paragraph(
        "<b>CONFIDENTIAL MEDICAL RECORD:</b> This report contains privileged patient health information. "
        "Each patient maintains exactly one permanent QR identity across all authorized hospital networks. "
        "Any unauthorized duplication, distribution, or scanning without consent is strictly prohibited.",
        subtitle_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
