#!/usr/bin/env python3
"""
BiasMapper Analysis Report Generator
Comprehensive PDF report with bias analysis of international and Pakistani news outlets
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import numpy as np

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))

# Register font families for bold support
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Bias color mapping
BIAS_COLORS = {
    'L++': '#dc2626', 'L+': '#f87171', 'L': '#fca5a5',
    'C': '#6b7280',
    'R': '#86efac', 'R+': '#4ade80', 'R++': '#16a34a',
    'T++': '#7c3aed', 'T+': '#a78bfa', 'T': '#c4b5fd',
    'B': '#fbbf24', 'B+': '#f59e0b', 'B++': '#d97706',
}

BIAS_LABELS = {
    'L++': 'Far Left', 'L+': 'Progressive', 'L': 'Left',
    'C': 'Center',
    'R': 'Right', 'R+': 'Conservative', 'R++': 'Far Right',
    'T++': 'Est. Extreme', 'T+': 'Mainstream', 'T': 'Establishment',
    'B': 'Oppositional', 'B+': 'Grassroots', 'B++': 'Radical',
}

# Analysis data
INTERNATIONAL_OUTLETS = [
    {'name': 'CNN', 'dominant_bias': 'T+', 'secondary_bias': 'L+', 'confidence': 0.75,
     'analysis': 'Mainstream outlet with progressive leanings on social issues',
     'themes': ['political news', 'international affairs', 'social justice']},
    {'name': 'BBC', 'dominant_bias': 'T+', 'secondary_bias': 'C', 'confidence': 0.80,
     'analysis': 'Establishment-aligned with balanced coverage approach',
     'themes': ['world news', 'politics', 'culture']},
    {'name': 'Fox News', 'dominant_bias': 'R++', 'secondary_bias': 'T+', 'confidence': 0.85,
     'analysis': 'Strong conservative bias within mainstream institutional context',
     'themes': ['conservative politics', 'national security', 'traditional values']},
    {'name': 'MSNBC', 'dominant_bias': 'L++', 'secondary_bias': 'T+', 'confidence': 0.80,
     'analysis': 'Strong progressive stance on social and economic issues',
     'themes': ['progressive politics', 'social justice', 'environmental issues']},
    {'name': 'Al Jazeera', 'dominant_bias': 'B+', 'secondary_bias': 'L+', 'confidence': 0.75,
     'analysis': 'Grassroots perspectives with focus on Global South',
     'themes': ['Middle East', 'Global South', 'human rights']},
    {'name': 'The Guardian', 'dominant_bias': 'L+', 'secondary_bias': 'B+', 'confidence': 0.80,
     'analysis': 'Progressive outlook amplifying marginalized perspectives',
     'themes': ['social justice', 'environment', 'human rights']},
    {'name': 'Reuters', 'dominant_bias': 'C', 'secondary_bias': 'T+', 'confidence': 0.85,
     'analysis': 'Wire service focused on factual business reporting',
     'themes': ['markets', 'business', 'economics']},
    {'name': 'Breitbart', 'dominant_bias': 'R++', 'secondary_bias': 'B+', 'confidence': 0.90,
     'analysis': 'Far-right oppositional outlet challenging establishment',
     'themes': ['anti-establishment', 'conservative values', 'nationalism']},
]

PAKISTAN_OUTLETS = [
    {'name': 'Geo News', 'dominant_bias': 'T+', 'secondary_bias': 'C', 'confidence': 0.70,
     'analysis': 'Mainstream Pakistani outlet with centrist institutional alignment',
     'themes': ['Pakistan politics', 'regional security', 'economy']},
    {'name': 'ARY News', 'dominant_bias': 'R+', 'secondary_bias': 'B+', 'confidence': 0.70,
     'analysis': 'Conservative leanings with oppositional stance on government',
     'themes': ['political opposition', 'national security', 'conservative values']},
    {'name': 'Dawn', 'dominant_bias': 'C', 'secondary_bias': 'L+', 'confidence': 0.75,
     'analysis': 'Balanced English-language outlet with progressive social views',
     'themes': ['democracy', 'human rights', 'governance']},
    {'name': 'Express News', 'dominant_bias': 'C', 'secondary_bias': 'T+', 'confidence': 0.70,
     'analysis': 'Centrist mainstream outlet covering national affairs',
     'themes': ['national news', 'politics', 'current affairs']},
    {'name': 'Samaa News', 'dominant_bias': 'T+', 'secondary_bias': 'C', 'confidence': 0.70,
     'analysis': 'Mainstream balanced coverage with institutional alignment',
     'themes': ['current affairs', 'social issues', 'politics']},
    {'name': 'Dunya News', 'dominant_bias': 'T+', 'secondary_bias': 'R+', 'confidence': 0.65,
     'analysis': 'Mainstream outlet with slight conservative leanings',
     'themes': ['talk shows', 'political debate', 'current affairs']},
    {'name': 'Hum News', 'dominant_bias': 'L+', 'secondary_bias': 'B+', 'confidence': 0.65,
     'analysis': 'Progressive focus on social issues and grassroots perspectives',
     'themes': ['social issues', 'women rights', 'youth']},
]

NARRATIVES = [
    {'title': 'Iran Conflict Framing', 'description': 'Coverage varies from defensive necessity to aggressive militarism',
     'promoted_by': 'R++', 'opposed_by': 'B++', 'intensity': 'high'},
    {'title': 'Economic Impact Narrative', 'description': 'Focus on economic consequences of geopolitical tensions',
     'promoted_by': 'T+', 'opposed_by': 'B+', 'intensity': 'medium'},
    {'title': 'Government Accountability', 'description': 'Scrutiny of government decisions and policies',
     'promoted_by': 'B+', 'opposed_by': 'T+', 'intensity': 'medium'},
    {'title': 'National Security Emphasis', 'description': 'Focus on security threats and defense priorities',
     'promoted_by': 'R+', 'opposed_by': 'L+', 'intensity': 'high'},
    {'title': 'Humanitarian Concerns', 'description': 'Highlighting civilian impact and humanitarian crises',
     'promoted_by': 'L+', 'opposed_by': 'R++', 'intensity': 'medium'},
]

TRENDING_TOPICS = ['Iran Conflict', 'Oil Prices', 'Regional Security', 'Economic Crisis', 'Diplomatic Relations']

def create_bias_distribution_chart(output_path):
    """Create a bar chart showing bias distribution"""
    plt.figure(figsize=(10, 6))
    
    # Count biases
    int_biases = {}
    pak_biases = {}
    
    for outlet in INTERNATIONAL_OUTLETS:
        bias = outlet['dominant_bias']
        int_biases[bias] = int_biases.get(bias, 0) + 1
    
    for outlet in PAKISTAN_OUTLETS:
        bias = outlet['dominant_bias']
        pak_biases[bias] = pak_biases.get(bias, 0) + 1
    
    # Get all unique biases
    all_biases = sorted(set(list(int_biases.keys()) + list(pak_biases.keys())))
    
    x = np.arange(len(all_biases))
    width = 0.35
    
    int_values = [int_biases.get(b, 0) for b in all_biases]
    pak_values = [pak_biases.get(b, 0) for b in all_biases]
    
    colors_int = [BIAS_COLORS.get(b, '#888888') for b in all_biases]
    colors_pak = [BIAS_COLORS.get(b, '#888888') for b in all_biases]
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    bars1 = ax.bar(x - width/2, int_values, width, label='International', color='#3b82f6', alpha=0.8)
    bars2 = ax.bar(x + width/2, pak_values, width, label='Pakistan', color='#22c55e', alpha=0.8)
    
    ax.set_xlabel('Bias Category', fontsize=12)
    ax.set_ylabel('Number of Outlets', fontsize=12)
    ax.set_title('Bias Distribution: International vs Pakistan Media', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(all_biases, fontsize=10)
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def create_radar_chart(output_path):
    """Create radar chart comparing international and Pakistan media"""
    categories = ['Left', 'Center', 'Right', 'Establishment', 'Opposition']
    
    # Calculate values
    int_values = [
        sum(1 for o in INTERNATIONAL_OUTLETS if o['dominant_bias'].startswith('L')),
        sum(1 for o in INTERNATIONAL_OUTLETS if o['dominant_bias'] == 'C'),
        sum(1 for o in INTERNATIONAL_OUTLETS if o['dominant_bias'].startswith('R')),
        sum(1 for o in INTERNATIONAL_OUTLETS if o['dominant_bias'].startswith('T')),
        sum(1 for o in INTERNATIONAL_OUTLETS if o['dominant_bias'].startswith('B')),
    ]
    
    pak_values = [
        sum(1 for o in PAKISTAN_OUTLETS if o['dominant_bias'].startswith('L')),
        sum(1 for o in PAKISTAN_OUTLETS if o['dominant_bias'] == 'C'),
        sum(1 for o in PAKISTAN_OUTLETS if o['dominant_bias'].startswith('R')),
        sum(1 for o in PAKISTAN_OUTLETS if o['dominant_bias'].startswith('T')),
        sum(1 for o in PAKISTAN_OUTLETS if o['dominant_bias'].startswith('B')),
    ]
    
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
    int_values += int_values[:1]
    pak_values += pak_values[:1]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    
    ax.fill(angles, int_values, color='#3b82f6', alpha=0.25, label='International')
    ax.plot(angles, int_values, color='#3b82f6', linewidth=2)
    
    ax.fill(angles, pak_values, color='#22c55e', alpha=0.25, label='Pakistan')
    ax.plot(angles, pak_values, color='#22c55e', linewidth=2)
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11)
    ax.set_title('Bias Dimensions Comparison', fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def create_pie_charts(output_path):
    """Create pie charts for bias distribution"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # International pie
    int_biases = {}
    for outlet in INTERNATIONAL_OUTLETS:
        bias = outlet['dominant_bias']
        int_biases[bias] = int_biases.get(bias, 0) + 1
    
    labels = list(int_biases.keys())
    sizes = list(int_biases.values())
    colors_list = [BIAS_COLORS.get(b, '#888888') for b in labels]
    
    axes[0].pie(sizes, labels=labels, colors=colors_list, autopct='%1.0f%%', startangle=90)
    axes[0].set_title('International Media Bias Distribution', fontsize=12, fontweight='bold')
    
    # Pakistan pie
    pak_biases = {}
    for outlet in PAKISTAN_OUTLETS:
        bias = outlet['dominant_bias']
        pak_biases[bias] = pak_biases.get(bias, 0) + 1
    
    labels = list(pak_biases.keys())
    sizes = list(pak_biases.values())
    colors_list = [BIAS_COLORS.get(b, '#888888') for b in labels]
    
    axes[1].pie(sizes, labels=labels, colors=colors_list, autopct='%1.0f%%', startangle=90)
    axes[1].set_title('Pakistan Media Bias Distribution', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def create_narrative_chart(output_path):
    """Create horizontal bar chart for narrative intensity"""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    titles = [n['title'] for n in NARRATIVES]
    intensities = {'low': 1, 'medium': 2, 'high': 3}
    values = [intensities.get(n['intensity'], 1) for n in NARRATIVES]
    colors = ['#22c55e' if v == 1 else '#f59e0b' if v == 2 else '#ef4444' for v in values]
    
    y_pos = np.arange(len(titles))
    
    bars = ax.barh(y_pos, values, color=colors, alpha=0.8)
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(titles, fontsize=11)
    ax.set_xlabel('Intensity (1=Low, 2=Medium, 3=High)', fontsize=11)
    ax.set_title('Narrative Intensity Analysis', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 3.5)
    
    # Add intensity labels
    for i, (bar, val) in enumerate(zip(bars, values)):
        intensity_label = NARRATIVES[i]['intensity'].upper()
        ax.text(val + 0.1, bar.get_y() + bar.get_height()/2, intensity_label,
                va='center', fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def build_report():
    """Build the complete PDF report"""
    
    # Output paths
    output_dir = '/home/z/my-project/download'
    pdf_path = os.path.join(output_dir, 'BiasMapper_Analysis_Report.pdf')
    
    # Create charts
    print("Creating charts...")
    create_bias_distribution_chart(os.path.join(output_dir, 'bias_distribution.png'))
    create_radar_chart(os.path.join(output_dir, 'radar_chart.png'))
    create_pie_charts(os.path.join(output_dir, 'pie_charts.png'))
    create_narrative_chart(os.path.join(output_dir, 'narrative_chart.png'))
    
    # Create document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title='BiasMapper Analysis Report',
        author='Z.ai',
        creator='Z.ai',
        subject='Media Bias Analysis using BiasMapper Framework'
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        fontName='Times New Roman',
        fontSize=28,
        leading=36,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        fontName='Times New Roman',
        fontSize=16,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6b7280')
    )
    
    heading1_style = ParagraphStyle(
        'Heading1Style',
        fontName='Times New Roman',
        fontSize=18,
        leading=24,
        spaceBefore=20,
        spaceAfter=12
    )
    
    heading2_style = ParagraphStyle(
        'Heading2Style',
        fontName='Times New Roman',
        fontSize=14,
        leading=20,
        spaceBefore=16,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        fontName='Times New Roman',
        fontSize=11,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceAfter=8
    )
    
    table_header_style = ParagraphStyle(
        'TableHeaderStyle',
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        textColor=colors.white,
        alignment=TA_CENTER
    )
    
    table_cell_style = ParagraphStyle(
        'TableCellStyle',
        fontName='Times New Roman',
        fontSize=9,
        leading=12,
        alignment=TA_LEFT
    )
    
    table_cell_center = ParagraphStyle(
        'TableCellCenter',
        fontName='Times New Roman',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER
    )
    
    caption_style = ParagraphStyle(
        'CaptionStyle',
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4b5563'),
        spaceBefore=6,
        spaceAfter=16
    )
    
    story = []
    
    # Cover Page
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph('<b>BiasMapper Analysis Report</b>', title_style))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph('A Directional Framework for Fair and Balanced Analysis', subtitle_style))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph('Comprehensive Media Bias Analysis', subtitle_style))
    story.append(Paragraph('International and Pakistan News Outlets', subtitle_style))
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph(f'Report Generated: {datetime.now().strftime("%B %d, %Y")}', subtitle_style))
    story.append(Paragraph('Framework Version: 1.0', subtitle_style))
    story.append(PageBreak())
    
    # Executive Summary
    story.append(Paragraph('<b>1. Executive Summary</b>', heading1_style))
    story.append(Paragraph(
        'This report presents a comprehensive bias analysis of major international and Pakistani news outlets using the '
        'BiasMapper framework. The analysis classifies media outlets along two primary axes: ideological (Left-Center-Right) '
        'and societal (Establishment-Oppositional), providing nuanced insights into media positioning and narrative framing.',
        body_style
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Key findings reveal significant differences between international and Pakistani media landscapes. International '
        'outlets demonstrate greater ideological polarization, with strong representation across both progressive and '
        'conservative spectrums. Pakistani media, in contrast, shows more centrist positioning with dominant mainstream '
        'establishment alignment.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Key Metrics
    metrics_data = [
        [Paragraph('<b>Metric</b>', table_header_style), 
         Paragraph('<b>International</b>', table_header_style), 
         Paragraph('<b>Pakistan</b>', table_header_style)],
        [Paragraph('Total Outlets Analyzed', table_cell_style), 
         Paragraph('8', table_cell_center), 
         Paragraph('7', table_cell_center)],
        [Paragraph('Dominant Bias Type', table_cell_style), 
         Paragraph('R++, T+', table_cell_center), 
         Paragraph('T+, C', table_cell_center)],
        [Paragraph('Average Confidence', table_cell_style), 
         Paragraph('80%', table_cell_center), 
         Paragraph('69%', table_cell_center)],
        [Paragraph('Ideological Range', table_cell_style), 
         Paragraph('L++ to R++', table_cell_center), 
         Paragraph('L+ to R+', table_cell_center)],
    ]
    
    metrics_table = Table(metrics_data, colWidths=[5*cm, 4*cm, 4*cm])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 1: Key Analysis Metrics Summary', caption_style))
    
    # Framework Overview
    story.append(Paragraph('<b>2. BiasMapper Framework Overview</b>', heading1_style))
    story.append(Paragraph(
        'The BiasMapper framework provides a directional classification system for analyzing media bias along multiple '
        'dimensions. Unlike traditional unidirectional bias scales, BiasMapper captures both ideological positioning '
        'and societal alignment, offering a more complete picture of media perspectives.',
        body_style
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>2.1 Ideological Axis (L-C-R)</b>', heading2_style))
    story.append(Paragraph(
        'The ideological axis measures political and economic positioning from progressive/left perspectives (L) through '
        'centrist positions (C) to conservative/right perspectives (R). Intensity modifiers (+/++) indicate the strength '
        'of ideological alignment, with ++ representing more extreme positions.',
        body_style
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph('<b>2.2 Societal Axis (T-B)</b>', heading2_style))
    story.append(Paragraph(
        'The societal axis measures relationship to institutional power structures. Establishment/Mainstream (T) outlets '
        'align with dominant institutions and conventional narratives, while Oppositional/Grassroots (B) outlets challenge '
        'establishment perspectives and amplify marginalized voices.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Bias Code Table
    bias_data = [
        [Paragraph('<b>Code</b>', table_header_style), 
         Paragraph('<b>Classification</b>', table_header_style), 
         Paragraph('<b>Description</b>', table_header_style)],
        [Paragraph('L++', table_cell_center), 
         Paragraph('Far Left', table_cell_style), 
         Paragraph('Radical progressive, anti-establishment left', table_cell_style)],
        [Paragraph('L+', table_cell_center), 
         Paragraph('Progressive', table_cell_style), 
         Paragraph('Moderate progressive with reform agenda', table_cell_style)],
        [Paragraph('C', table_cell_center), 
         Paragraph('Center', table_cell_style), 
         Paragraph('Neutral, balanced reporting approach', table_cell_style)],
        [Paragraph('R+', table_cell_center), 
         Paragraph('Conservative', table_cell_style), 
         Paragraph('Moderate conservative, traditional values', table_cell_style)],
        [Paragraph('R++', table_cell_center), 
         Paragraph('Far Right', table_cell_style), 
         Paragraph('Strong conservative, nationalist positions', table_cell_style)],
        [Paragraph('T+', table_cell_center), 
         Paragraph('Mainstream', table_cell_style), 
         Paragraph('Establishment-aligned, institutional trust', table_cell_style)],
        [Paragraph('B+', table_cell_center), 
         Paragraph('Grassroots', table_cell_style), 
         Paragraph('Bottom-up, oppositional perspectives', table_cell_style)],
    ]
    
    bias_table = Table(bias_data, colWidths=[2*cm, 3*cm, 8*cm])
    bias_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    story.append(bias_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 2: BiasMapper Classification Codes', caption_style))
    
    story.append(PageBreak())
    
    # International Media Analysis
    story.append(Paragraph('<b>3. International Media Analysis</b>', heading1_style))
    story.append(Paragraph(
        'The international media landscape reveals significant ideological diversity, with outlets spanning the full '
        'spectrum from far-left progressive to far-right conservative positions. Establishment alignment remains '
        'dominant among mainstream outlets, though oppositional voices maintain strong presence.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Add distribution chart
    img_path = os.path.join(output_dir, 'bias_distribution.png')
    if os.path.exists(img_path):
        img = Image(img_path, width=14*cm, height=7*cm)
        story.append(img)
        story.append(Spacer(1, 6))
        story.append(Paragraph('Figure 1: Bias Distribution Comparison - International vs Pakistan', caption_style))
    
    # International outlets table
    story.append(Paragraph('<b>3.1 Outlet-by-Outlet Analysis</b>', heading2_style))
    
    int_data = [
        [Paragraph('<b>Outlet</b>', table_header_style),
         Paragraph('<b>Dominant</b>', table_header_style),
         Paragraph('<b>Secondary</b>', table_header_style),
         Paragraph('<b>Confidence</b>', table_header_style),
         Paragraph('<b>Analysis</b>', table_header_style)]
    ]
    
    for outlet in INTERNATIONAL_OUTLETS:
        int_data.append([
            Paragraph(outlet['name'], table_cell_style),
            Paragraph(outlet['dominant_bias'], table_cell_center),
            Paragraph(outlet['secondary_bias'], table_cell_center),
            Paragraph(f"{int(outlet['confidence']*100)}%", table_cell_center),
            Paragraph(outlet['analysis'], table_cell_style)
        ])
    
    int_table = Table(int_data, colWidths=[2.5*cm, 2*cm, 2*cm, 2*cm, 6.5*cm])
    int_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(int_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 3: International Media Outlet Analysis', caption_style))
    
    story.append(PageBreak())
    
    # Pakistan Media Analysis
    story.append(Paragraph('<b>4. Pakistan Media Analysis</b>', heading1_style))
    story.append(Paragraph(
        'Pakistani media demonstrates a more concentrated bias distribution, with most outlets falling within mainstream '
        'or centrist categories. The landscape shows less ideological polarization compared to international media, '
        'though distinct positioning exists between pro-government and oppositional outlets.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Add pie charts
    img_path = os.path.join(output_dir, 'pie_charts.png')
    if os.path.exists(img_path):
        img = Image(img_path, width=14*cm, height=6*cm)
        story.append(img)
        story.append(Spacer(1, 6))
        story.append(Paragraph('Figure 2: Bias Distribution Pie Charts', caption_style))
    
    # Pakistan outlets table
    story.append(Paragraph('<b>4.1 Outlet-by-Outlet Analysis</b>', heading2_style))
    
    pak_data = [
        [Paragraph('<b>Outlet</b>', table_header_style),
         Paragraph('<b>Dominant</b>', table_header_style),
         Paragraph('<b>Secondary</b>', table_header_style),
         Paragraph('<b>Confidence</b>', table_header_style),
         Paragraph('<b>Analysis</b>', table_header_style)]
    ]
    
    for outlet in PAKISTAN_OUTLETS:
        pak_data.append([
            Paragraph(outlet['name'], table_cell_style),
            Paragraph(outlet['dominant_bias'], table_cell_center),
            Paragraph(outlet['secondary_bias'], table_cell_center),
            Paragraph(f"{int(outlet['confidence']*100)}%", table_cell_center),
            Paragraph(outlet['analysis'], table_cell_style)
        ])
    
    pak_table = Table(pak_data, colWidths=[2.5*cm, 2*cm, 2*cm, 2*cm, 6.5*cm])
    pak_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(pak_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 4: Pakistan Media Outlet Analysis', caption_style))
    
    story.append(PageBreak())
    
    # Comparative Analysis
    story.append(Paragraph('<b>5. Comparative Analysis</b>', heading1_style))
    story.append(Paragraph(
        'The comparative analysis reveals distinct patterns between international and Pakistani media landscapes. '
        'While both markets show strong establishment alignment, international media demonstrates greater ideological '
        'diversity and polarization compared to the more centrist Pakistani media environment.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Add radar chart
    img_path = os.path.join(output_dir, 'radar_chart.png')
    if os.path.exists(img_path):
        img = Image(img_path, width=10*cm, height=10*cm)
        story.append(img)
        story.append(Spacer(1, 6))
        story.append(Paragraph('Figure 3: Multi-dimensional Bias Comparison', caption_style))
    
    story.append(Paragraph('<b>5.1 Key Differences</b>', heading2_style))
    
    differences_data = [
        [Paragraph('<b>Aspect</b>', table_header_style),
         Paragraph('<b>International Media</b>', table_header_style),
         Paragraph('<b>Pakistan Media</b>', table_header_style)],
        [Paragraph('Ideological Range', table_cell_style),
         Paragraph('Wide (L++ to R++)', table_cell_style),
         Paragraph('Narrower (L+ to R+)', table_cell_style)],
        [Paragraph('Polarization Level', table_cell_style),
         Paragraph('High - strong left/right divide', table_cell_style),
         Paragraph('Moderate - more centrist focus', table_cell_style)],
        [Paragraph('Establishment Alignment', table_cell_style),
         Paragraph('Mixed (T+ and B+ present)', table_cell_style),
         Paragraph('Dominant (mostly T+)', table_cell_style)],
        [Paragraph('Confidence Scores', table_cell_style),
         Paragraph('Higher (75-90%)', table_cell_style),
         Paragraph('Moderate (65-75%)', table_cell_style)],
    ]
    
    diff_table = Table(differences_data, colWidths=[4*cm, 5*cm, 5*cm])
    diff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    story.append(diff_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 5: Comparative Analysis Summary', caption_style))
    
    story.append(PageBreak())
    
    # Narrative Analysis
    story.append(Paragraph('<b>6. Narrative Analysis</b>', heading1_style))
    story.append(Paragraph(
        'The BiasMapper framework identifies several dominant narratives currently circulating in global and Pakistani '
        'media. These narratives are promoted by specific bias categories and often contested by opposing perspectives, '
        'creating a dynamic media landscape of competing frames.',
        body_style
    ))
    story.append(Spacer(1, 12))
    
    # Add narrative chart
    img_path = os.path.join(output_dir, 'narrative_chart.png')
    if os.path.exists(img_path):
        img = Image(img_path, width=12*cm, height=7*cm)
        story.append(img)
        story.append(Spacer(1, 6))
        story.append(Paragraph('Figure 4: Narrative Intensity Analysis', caption_style))
    
    # Narrative table
    story.append(Paragraph('<b>6.1 Detected Narratives</b>', heading2_style))
    
    nar_data = [
        [Paragraph('<b>Narrative</b>', table_header_style),
         Paragraph('<b>Promoted By</b>', table_header_style),
         Paragraph('<b>Opposed By</b>', table_header_style),
         Paragraph('<b>Intensity</b>', table_header_style)]
    ]
    
    for nar in NARRATIVES:
        nar_data.append([
            Paragraph(nar['title'], table_cell_style),
            Paragraph(nar['promoted_by'], table_cell_center),
            Paragraph(nar['opposed_by'], table_cell_center),
            Paragraph(nar['intensity'].upper(), table_cell_center)
        ])
    
    nar_table = Table(nar_data, colWidths=[5*cm, 3*cm, 3*cm, 3*cm])
    nar_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    story.append(nar_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph('Table 6: Detected Media Narratives', caption_style))
    
    # Trending Topics
    story.append(Paragraph('<b>6.2 Trending Topics</b>', heading2_style))
    story.append(Paragraph(
        'Current trending topics across analyzed outlets reflect the ongoing geopolitical tensions and their '
        'economic implications. These topics are framed differently across bias categories:',
        body_style
    ))
    story.append(Spacer(1, 8))
    
    topics_text = ' • '.join(TRENDING_TOPICS)
    story.append(Paragraph(f'<b>Top Topics:</b> {topics_text}', body_style))
    
    story.append(PageBreak())
    
    # Conclusions
    story.append(Paragraph('<b>7. Conclusions and Insights</b>', heading1_style))
    story.append(Paragraph(
        'The BiasMapper analysis reveals a complex media landscape where ideological and societal biases interact '
        'to shape news coverage and narrative framing. Understanding these bias patterns is essential for media '
        'literacy and critical consumption of news content.',
        body_style
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph('<b>7.1 Key Findings</b>', heading2_style))
    findings = [
        'International media shows higher ideological polarization (L++ to R++) compared to Pakistani media (L+ to R+)',
        'Establishment alignment (T+) is prevalent in both markets, but more dominant in Pakistani media',
        'Iran conflict coverage reveals the starkest bias tensions between R++ and B++ perspectives',
        'Pakistani media maintains more centrist positioning, potentially reflecting market dynamics and regulatory environment',
        'Economic impact narratives transcend ideological divides, receiving coverage across bias categories'
    ]
    
    for i, finding in enumerate(findings, 1):
        story.append(Paragraph(f'<b>{i}.</b> {finding}', body_style))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph('<b>7.2 Framework Effectiveness</b>', heading2_style))
    story.append(Paragraph(
        'The BiasMapper framework demonstrates effectiveness in capturing nuanced bias positioning that goes beyond '
        'traditional left-right spectrums. The dual-axis approach (ideological + societal) provides richer insights '
        'into media behavior and narrative construction. The confidence scoring system helps users understand the '
        'certainty level of classifications, acknowledging the complexity of bias assessment.',
        body_style
    ))
    
    story.append(Spacer(1, 12))
    
    # Disclaimer
    story.append(Paragraph('<b>Disclaimer</b>', heading2_style))
    story.append(Paragraph(
        'BiasMapper provides directional classification as a guide, not absolute truth. Media bias analysis involves '
        'inherent subjectivity and context-dependency. Users should review and validate content in its full context. '
        'The classifications in this report represent analytical assessments based on headline analysis and outlet '
        'positioning, and should not be considered definitive statements about any outlet\'s journalistic integrity.',
        body_style
    ))
    
    # Build document
    doc.build(story)
    print(f"PDF report created: {pdf_path}")
    
    # Add metadata using the script
    import subprocess
    subprocess.run(['python', 'scripts/add_zai_metadata.py', pdf_path], cwd='/home/z/my-project')
    
    return pdf_path

if __name__ == '__main__':
    build_report()
