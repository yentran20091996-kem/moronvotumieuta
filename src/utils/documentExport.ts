import { ExplorerProfile } from '../types';

export function exportToWordDocument(profile: ExplorerProfile) {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Phiếu Học Tập - Sổ Tay Tinh Tú</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #1e293b; padding: 20px; }
        .header-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .header-table td { padding: 4px; vertical-align: top; }
        .school-info { text-align: left; font-size: 11pt; font-weight: bold; }
        .student-info { text-align: right; font-size: 11pt; }
        .title { text-align: center; font-size: 18pt; font-weight: bold; color: #b91c1c; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
        .subtitle { text-align: center; font-size: 12pt; font-style: italic; color: #475569; margin-bottom: 25px; }
        h2 { font-size: 14pt; color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin-top: 25px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
        table.data-table th { background-color: #f1f5f9; border: 1px solid #94a3b8; padding: 8px; font-weight: bold; text-align: left; }
        table.data-table td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        .original-sentence { color: #64748b; font-style: italic; }
        .upgraded-sentence { color: #047857; font-weight: bold; }
        .exercise-box { border: 1px dashed #64748b; border-radius: 8px; padding: 15px; margin-top: 15px; background-color: #fafaf9; }
        .dotted-line { border-bottom: 1px dotted #94a3b8; height: 26px; width: 100%; }
        .footer-table { width: 100%; margin-top: 40px; border-collapse: collapse; text-align: center; }
        .footer-table td { width: 50%; vertical-align: top; font-size: 12pt; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td class="school-info">
            TRƯỜNG TIỂU HỌC: ............................................<br>
            LỚP: .....................................................................
          </td>
          <td class="student-info">
            Họ và tên học sinh: <strong>${profile.name}</strong><br>
            Cấp bậc: <strong>${profile.rankTitle}</strong><br>
            Ngày in: ${dateStr}
          </td>
        </tr>
      </table>

      <div class="title">PHIẾU BÀI TẬP & SỔ TAY TINH TÚ</div>
      <div class="subtitle">Chương trình Mở Rộng Vốn Từ & Kỹ Thuật Viết Văn "Show, Don't Tell"</div>

      <h2>Phần I: BỘ SƯU TẬP CÂU VĂN GỢI TẢ (SHOW, DON'T TELL)</h2>
      <p><em>Hãy đọc lại các câu văn đã được nâng cấp bằng giác quan và cảm xúc:</em></p>
      
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">STT</th>
            <th style="width: 35%;">Câu Kể Ban Đầu (Tell)</th>
            <th style="width: 45%;">Câu Gợi Tả Sinh Động (Show)</th>
            <th style="width: 15%;">Giác Quan</th>
          </tr>
        </thead>
        <tbody>
          ${profile.savedSentences.length > 0 ? profile.savedSentences.map((s, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td class="original-sentence">"${s.original}"</td>
              <td class="upgraded-sentence">"${s.upgraded}"</td>
              <td>${s.senses.join(', ') || s.technique}</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="4" style="text-align: center; color: #64748b;">Chưa có câu văn nào được lưu. Hãy mở Xưởng Chế Tác để thêm câu văn nhé!</td>
            </tr>
          `}
        </tbody>
      </table>

      <h2>Phần II: TÚI THẦN KỲ TỪ VỰNG ĐA VŨ TRỤ</h2>
      <p><em>Các từ ngữ tinh tú giàu hình ảnh và nhạc điệu con đã thu thập được:</em></p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">STT</th>
            <th style="width: 20%;">Từ Ngữ</th>
            <th style="width: 15%;">Hành Tinh</th>
            <th style="width: 30%;">Giải Nghĩa</th>
            <th style="width: 30%;">Câu Ví Dụ</th>
          </tr>
        </thead>
        <tbody>
          ${profile.savedWords.length > 0 ? profile.savedWords.map((w, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td style="font-weight: bold; color: #7e22ce;">${w.word}</td>
              <td>${w.planet}</td>
              <td>${w.meaning}</td>
              <td style="font-style: italic;">"${w.example}"</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="5" style="text-align: center; color: #64748b;">Chưa có từ vựng nào được lưu. Hãy mở Bản Đồ Hành Tinh Từ Vựng để thu thập nhé!</td>
            </tr>
          `}
        </tbody>
      </table>

      <h2>Phần III: GÓC THỰC HÀNH & SÁNG TẠO CỦA EM</h2>
      <div class="exercise-box">
        <p><strong>Đề bài tự luyện:</strong> Hãy chọn 1 từ vựng ở Phần II hoặc viết tiếp 1 câu văn gợi tả cảnh thiên nhiên hoặc người thân theo kỹ thuật Show, Don't Tell:</p>
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
      </div>

      <table class="footer-table">
        <tr>
          <td>
            <strong>Ý KIẾN CỦA PHỤ HUYNH</strong><br>
            <em>(Ký và ghi rõ họ tên)</em>
            <div style="height: 60px;"></div>
          </td>
          <td>
            <strong>LỜI PHÊ CỦA THẦY / CÔ GIÁO</strong><br>
            <em>(Khen ngợi và động viên bạn nhỏ)</em>
            <div style="height: 60px;"></div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Phieu_Bai_Tap_${profile.name.replace(/\s+/g, '_')}_${Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPowerPoint(profile: ExplorerProfile) {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bài Giảng Vũ Trụ Ngôn Từ</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .slide { width: 960px; height: 540px; margin: 20px auto; padding: 40px; background: white; border: 2px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); page-break-after: always; position: relative; }
        .slide-title { font-size: 28pt; font-weight: bold; color: #4338ca; margin-bottom: 20px; border-bottom: 3px solid #818cf8; padding-bottom: 10px; }
        .slide-content { font-size: 16pt; color: #334155; line-height: 1.6; }
        .card { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .card-title { font-weight: bold; color: #166534; font-size: 18pt; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="slide" style="background: linear-gradient(135deg, #fdf2f8, #ede9fe); text-align: center; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 36pt; color: #be185d; margin-bottom: 10px;">🌟 BÀI GIẢNG VŨ TRỤ NGÔN TỪ</h1>
        <h2 style="font-size: 22pt; color: #6b21a8; font-weight: normal;">Bí Quyết Viết Văn Sống Động Bằng Phương Pháp "Show, Don't Tell"</h2>
        <p style="font-size: 16pt; color: #475569; margin-top: 30px;">Học sinh: <strong>${profile.name}</strong> • Cấp bậc: <strong>${profile.rankTitle}</strong></p>
      </div>

      <div class="slide">
        <div class="slide-title">1. Kỹ Thuật "Show, Don't Tell" Là Gì?</div>
        <div class="slide-content">
          <div class="card" style="background: #fff1f2; border-color: #fecdd3;">
            <div class="card-title" style="color: #9f1239;">❌ Câu kể đơn giản (Tell):</div>
            <div>"Trời mưa to." - Người đọc chỉ biết sự việc nhưng chưa cảm nhận được cảnh tượng.</div>
          </div>
          <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
            <div class="card-title" style="color: #166534;">✨ Câu gợi tả sinh động (Show):</div>
            <div>"Những hạt mưa rào rào gõ nhịp trên mái tôn, gió lạnh khẽ luồn qua ô cửa sổ làm rèm lay nhẹ."</div>
          </div>
          <p style="margin-top: 20px; font-weight: bold; color: #4338ca;">👉 Bài học: Hãy đưa ít nhất 2 giác quan (Thị giác, Thính giác, Xúc giác...) vào từng câu văn!</p>
        </div>
      </div>

      <div class="slide">
        <div class="slide-title">2. Bộ Sưu Tập Câu Văn Mẫu Của Học Sinh</div>
        <div class="slide-content">
          ${profile.savedSentences.slice(0, 3).map((s, idx) => `
            <div class="card">
              <div class="card-title">${idx + 1}. Kỹ thuật: ${s.technique}</div>
              <div><strong>Gốc:</strong> "${s.original}"</div>
              <div style="color: #047857; margin-top: 4px;"><strong>Nâng cấp:</strong> "${s.upgraded}"</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="slide">
        <div class="slide-title">3. Bản Đồ 4 Hành Tinh Từ Vựng</div>
        <div class="slide-content">
          <ul style="line-height: 2;">
            <li>🪐 <strong>Hành tinh Không Gian:</strong> Miêu tả màu sắc, ánh sáng, quang cảnh bao la.</li>
            <li>💖 <strong>Hành tinh Tâm Trạng:</strong> Khắc họa niềm vui, sự bỡ ngỡ, hân hoan, rạo rực.</li>
            <li>⚡ <strong>Hành tinh Hành Động:</strong> Tả những cử chỉ nhanh nhẹn, rộn ràng, uyển chuyển.</li>
            <li>🌧️ <strong>Hành tinh Thời Tiết:</strong> Gợi tả sương sớm bảng lảng, mưa tí tách, gió heo may.</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], {
    type: 'application/vnd.ms-powerpoint;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bai_Giang_Vu_Tru_${profile.name.replace(/\s+/g, '_')}_${Date.now()}.ppt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
