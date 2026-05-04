
document.getElementById("make-pdf").addEventListener("click", function () {
    makepdf();
});
 
function makepdf() {
    pdfMake.fonts = {
        Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            Italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
        },
        Sarabun: {
            normal: "Sarabun-Regular.ttf",
            bold: "Sarabun-Bold.ttf",
            Italics: "Sarabun-Italic.ttf",
            bolditalics: "Sarabun-MediumItalic.ttf",
        },
    };
 
    // ===== กำหนดสีตามระดับความเสี่ยง =====
    let riskColor = "#64748b";
    let riskBgColor = "#f1f5f9";
    let riskLabel = "ไม่ตรงเงื่อนไข";
    const stataNum = Number(stataCode);
 
    if (!isNaN(stataNum)) {
        if (stataNum < 5) {
            riskColor = "#15803d"; riskBgColor = "#dcfce7"; riskLabel = "เสี่ยงน้อยมาก (Very Low)";
        } else if (stataNum < 10) {
            riskColor = "#65a30d"; riskBgColor = "#ecfccb"; riskLabel = "เสี่ยงน้อย (Low)";
        } else if (stataNum < 20) {
            riskColor = "#d97706"; riskBgColor = "#fef3c7"; riskLabel = "เสี่ยงปานกลาง (Moderate)";
        } else if (stataNum < 30) {
            riskColor = "#c2410c"; riskBgColor = "#fed7aa"; riskLabel = "เสี่ยงสูง (High)";
        } else {
            riskColor = "#991b1b"; riskBgColor = "#fecaca"; riskLabel = "เสี่ยงสูงมาก (Very High)";
        }
    }
 
    // ===== วันที่ปัจจุบัน (ภาษาไทย) =====
    const today = new Date();
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const dateStr = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`;
 
    // ===== สร้าง array คำแนะนำเฉพาะบุคคล =====
    const personalRecs = [];
    if (ysmkp && ysmkp.trim() !== "") personalRecs.push(ysmkp.replace(/^-\s*/, ''));
    if (ydmp && ydmp.trim() !== "") personalRecs.push(ydmp.replace(/^-\s*/, ''));
    if (ysbpp && ysbpp.trim() !== "") personalRecs.push(ysbpp.replace(/^-\s*/, ''));
    if (ytcp && ytcp.trim() !== "") personalRecs.push(ytcp.replace(/^-\s*/, ''));
 
    const personalRecRows = personalRecs.length > 0
        ? personalRecs.map(rec => ({
            columns: [
                { text: '•', width: 14, color: '#0b6bcb', bold: true, fontSize: 12 },
                { text: rec, fontSize: 11, lineHeight: 1.4 }
            ],
            margin: [0, 4, 0, 4]
        }))
        : [{ text: 'ไม่มีคำแนะนำเฉพาะ — ดูคำแนะนำทั่วไปด้านล่าง', italics: true, color: '#64748b', fontSize: 10, margin: [14, 4, 0, 4] }];
 
    // ===== คำแนะนำทั่วไป =====
    const generalRecs = [
        "เพื่อลดความเสี่ยงต่อการเกิดโรคหัวใจและหลอดเลือด ควรออกกำลังกายอย่างสม่ำเสมอ อย่างน้อยสัปดาห์ละ 3 วัน วันละ 20-30 นาที ทั้งนี้ หากมีโรคประจำตัวหรืออาการเจ็บป่วย ควรปรึกษาบุคลากรทางการแพทย์ก่อน และไม่ควรหักโหมมากนัก",
        "หากท่านดื่มสุรา ให้ลด หรือ เลิก (สายด่วนเลิกสุรา 1413) หากไม่ได้ดื่มอยู่แล้ว ไม่แนะนำให้ดื่ม",
        "ควรรับการตรวจสุขภาพเพื่อประเมินความเสี่ยงของโรคหัวใจและหลอดเลือด อย่างน้อย ปีละ 1 ครั้ง",
        "ผลการประเมินเหล่านี้เป็นการประเมินความเสี่ยงต่อการเกิดโรคหัวใจและหลอดเลือดเบื้องต้น ควรเข้ารับคำปรึกษาและตรวจเพิ่มเติมตามคำแนะนำของแพทย์"
    ];
 
    const generalRecRows = generalRecs.map(rec => ({
        columns: [
            { text: '•', width: 14, color: '#10b981', bold: true, fontSize: 12 },
            { text: rec, fontSize: 11, lineHeight: 1.4 }
        ],
        margin: [0, 4, 0, 4]
    }));
 
    // ===== Helper: สร้าง info row =====
    const infoRow = (label, value, valueColor = '#0f172a') => ({
        columns: [
            { text: label, width: 160, fontSize: 10, color: '#64748b' },
            { text: value || '-', fontSize: 11, bold: true, color: valueColor }
        ],
        margin: [0, 3, 0, 3]
    });
 
    // ===== Document definition =====
    var docdefinition = {
        images: {},
 
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 70],
 
        // ===== HEADER =====
        header: function (currentPage, pageCount) {
            return {
                margin: [40, 20, 40, 0],
                columns: [
                    {
                        text: 'CVD Risk Assessment Report',
                        fontSize: 9,
                        color: '#64748b',
                        bold: true
                    },
                    {
                        text: `วันที่ออกรายงาน: ${dateStr}`,
                        fontSize: 9,
                        color: '#64748b',
                        alignment: 'right'
                    }
                ]
            };
        },
 
        // ===== FOOTER =====
        footer: function (currentPage, pageCount) {
            return {
                margin: [40, 10, 40, 0],
                stack: [
                    {
                        canvas: [{
                            type: 'line', x1: 0, y1: 0, x2: 515, y2: 0,
                            lineWidth: 0.5, lineColor: '#e2e8f0'
                        }]
                    },
                    {
                        columns: [
                            {
                                text: 'Phramongkutklao College of Medicine & Silpakorn University',
                                fontSize: 8,
                                color: '#94a3b8',
                                margin: [0, 6, 0, 0]
                            },
                            {
                                text: `หน้า ${currentPage} / ${pageCount}`,
                                fontSize: 8,
                                color: '#94a3b8',
                                alignment: 'right',
                                margin: [0, 6, 0, 0]
                            }
                        ]
                    }
                ]
            };
        },
 
        content: [
            // ===== TITLE =====
            {
                text: 'รายงานผลการประเมินความเสี่ยง',
                fontSize: 20,
                bold: true,
                color: '#0b6bcb',
                alignment: 'center',
                margin: [0, 0, 0, 4]
            },
            {
                text: 'โรคหัวใจและหลอดเลือด',
                fontSize: 18,
                bold: true,
                color: '#0b6bcb',
                alignment: 'center',
                margin: [0, 0, 0, 4]
            },
            {
                text: 'Cardiovascular Disease Risk Assessment Report',
                fontSize: 11,
                color: '#64748b',
                alignment: 'center',
                margin: [0, 0, 0, 4]
            },
            {
                text: '10-Year CVD Risk Prediction (WHO 2019, Southeast Asia)',
                fontSize: 9,
                italics: true,
                color: '#94a3b8',
                alignment: 'center',
                margin: [0, 0, 0, 16]
            },
 
            // เส้นคั่นด้านบน
            {
                canvas: [{
                    type: 'line', x1: 0, y1: 0, x2: 515, y2: 0,
                    lineWidth: 1.5, lineColor: '#0b6bcb'
                }],
                margin: [0, 0, 0, 16]
            },
 
            // ===== SECTION 1: HEALTH INFORMATION =====
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: '1. ข้อมูลสุขภาพ',
                            fontSize: 13,
                            bold: true,
                            color: '#ffffff',
                            fillColor: '#0b6bcb',
                            margin: [10, 6, 10, 6]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 8]
            },
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                infoRow('ชื่อ-นามสกุล (Name)', `${name1} ${lastname || ''}`),
                                infoRow('เพศ (Sex)', sex),
                                infoRow('อายุ (Age)', `${age} ปี`),
                                infoRow('โรคเบาหวาน (Diabetes)', dm,
                                    cvdm == 1 ? '#dc2626' : (cvdm == 0 ? '#10b981' : '#0f172a')),
                                infoRow('การสูบบุหรี่ (Smoking)', smk,
                                    cvsmk == 1 ? '#dc2626' : (cvsmk == 0 ? '#10b981' : '#0f172a')),
                                infoRow('ความดันโลหิตเฉลี่ย (Avg. SBP)', `${sbp} mmHg`),
                                infoRow('คอลเลสเตอรอลรวม (Total Cholesterol)', `${tc} mg/dL`)
                            ],
                            margin: [12, 10, 12, 10],
                            fillColor: '#f8fafc'
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0'
                },
                margin: [0, 0, 0, 18]
            },
 
            // ===== SECTION 2: RISK RESULT =====
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: '2. ผลการประเมินความเสี่ยง',
                            fontSize: 13,
                            bold: true,
                            color: '#ffffff',
                            fillColor: '#e11d48',
                            margin: [10, 6, 10, 6]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 8]
            },
            {
                table: {
                    widths: ['40%', '60%'],
                    body: [[
                        {
                            stack: [
                                {
                                    text: 'ความเสี่ยงรวม',
                                    fontSize: 9,
                                    color: '#64748b',
                                    alignment: 'center',
                                    margin: [0, 0, 0, 4]
                                },
                                {
                                    text: `${stataCode}%`,
                                    fontSize: 38,
                                    bold: true,
                                    color: '#0b6bcb',
                                    alignment: 'center',
                                    margin: [0, 0, 0, 4]
                                },
                                {
                                    text: 'ในระยะ 10 ปีข้างหน้า',
                                    fontSize: 9,
                                    color: '#64748b',
                                    alignment: 'center'
                                }
                            ],
                            fillColor: '#f8fafc',
                            margin: [10, 14, 10, 14]
                        },
                        {
                            stack: [
                                {
                                    text: 'ระดับความเสี่ยง',
                                    fontSize: 9,
                                    color: '#64748b',
                                    margin: [0, 0, 0, 6]
                                },
                                {
                                    table: {
                                        widths: ['*'],
                                        body: [[
                                            {
                                                text: riskLabel,
                                                fontSize: 13,
                                                bold: true,
                                                color: '#ffffff',
                                                fillColor: riskColor,
                                                alignment: 'center',
                                                margin: [8, 6, 8, 6]
                                            }
                                        ]]
                                    },
                                    layout: 'noBorders',
                                    margin: [0, 0, 0, 8]
                                },
                                {
                                    text: 'หมายถึง โอกาสที่จะเกิดเหตุการณ์โรคหัวใจและหลอดเลือดร้ายแรง เช่น กล้ามเนื้อหัวใจขาดเลือด หรือ โรคหลอดเลือดสมอง',
                                    fontSize: 9,
                                    color: '#475569',
                                    italics: true,
                                    lineHeight: 1.3
                                }
                            ],
                            margin: [12, 14, 12, 14]
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0'
                },
                margin: [0, 0, 0, 18]
            },
 
            // ===== SECTION 3: PERSONAL RECOMMENDATIONS =====
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: '3. คำแนะนำเฉพาะบุคคล',
                            fontSize: 13,
                            bold: true,
                            color: '#ffffff',
                            fillColor: '#0b6bcb',
                            margin: [10, 6, 10, 6]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 8]
            },
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                {
                                    text: 'คำแนะนำเพื่อลดความเสี่ยงการเกิดโรคหัวใจและหลอดเลือดในอนาคต ตามผลการประเมินของท่าน',
                                    fontSize: 10,
                                    italics: true,
                                    color: '#475569',
                                    margin: [0, 0, 0, 8]
                                },
                                ...personalRecRows
                            ],
                            margin: [12, 10, 12, 10],
                            fillColor: '#f8fafc'
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0'
                },
                margin: [0, 0, 0, 18]
            },
 
            // ===== SECTION 4: GENERAL RECOMMENDATIONS =====
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: '4. คำแนะนำทั่วไป',
                            fontSize: 13,
                            bold: true,
                            color: '#ffffff',
                            fillColor: '#10b981',
                            margin: [10, 6, 10, 6]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 8]
            },
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: generalRecRows,
                            margin: [12, 10, 12, 10],
                            fillColor: '#f8fafc'
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e2e8f0',
                    vLineColor: () => '#e2e8f0'
                },
                margin: [0, 0, 0, 18]
            },
 
            // ===== DISCLAIMER =====
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                {
                                    text: '⚠ ข้อควรทราบ',
                                    fontSize: 10,
                                    bold: true,
                                    color: '#92400e',
                                    margin: [0, 0, 0, 4]
                                },
                                {
                                    text: 'รายงานนี้เป็นการประเมินความเสี่ยงเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ ผู้ที่ได้รับผลควรปรึกษาแพทย์เพื่อรับคำแนะนำที่เหมาะสมกับสภาวะสุขภาพของแต่ละบุคคล',
                                    fontSize: 9,
                                    color: '#78350f',
                                    lineHeight: 1.4
                                }
                            ],
                            fillColor: '#fef3c7',
                            margin: [12, 8, 12, 8]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 14]
            },
 
            // ===== REFERENCE =====
            {
                text: 'อ้างอิง (Reference)',
                fontSize: 10,
                bold: true,
                color: '#64748b',
                margin: [0, 8, 0, 4]
            },
            {
                text: [
                    'WHO CVD Risk Chart Working Group (2019). World Health Organization cardiovascular disease risk charts: revised models to estimate risk in 21 global regions. ',
                    { text: 'The Lancet Global Health', italics: true },
                    ', 7(10), e1332–e1345.'
                ],
                fontSize: 8,
                color: '#94a3b8',
                lineHeight: 1.4
            },
            {
                text: 'https://doi.org/10.1016/S2214-109X(19)30318-3',
                fontSize: 8,
                color: '#0b6bcb',
                link: 'https://doi.org/10.1016/S2214-109X(19)30318-3',
                margin: [0, 2, 0, 0]
            }
        ],
 
        styles: {
            indent: {
                margin: [16, 4, 0, 4],
                fontSize: 11
            }
        },
 
        defaultStyle: {
            font: "Sarabun",
            fontSize: 11,
            color: '#0f172a',
            lineHeight: 1.4
        },
 
        info: {
            title: `CVD Risk Assessment - ${name1} ${lastname || ''}`,
            author: 'Phramongkutklao College of Medicine',
            subject: 'Cardiovascular Disease Risk Assessment Report',
            keywords: 'CVD, Risk Assessment, WHO, Cardiovascular'
        }
    };
 
    pdfMake.createPdf(docdefinition).print();
}
 
