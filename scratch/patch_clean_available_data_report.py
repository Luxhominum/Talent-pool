def patch_report_card_clean_data():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    old_section_marker = "    <!-- Digital Portfolio Bridge (QR Codes) -->"
    end_section_marker = "    <!-- Structured Live Interview Rubric (Role Adaptive) -->"

    start_idx = content.find(old_section_marker)
    end_idx = content.find(end_section_marker)

    if start_idx == -1 or end_idx == -1:
        print("Error: section markers not found in index.html")
        return

    new_sections_html = """    <!-- Digital Portfolio & Document Bridge (Only Show Available Data) -->
    ${(function() {
      const hasPorto = Boolean(primaryPortoUrl && isValidDisplayUrl(primaryPortoUrl));
      const hasCv = Boolean(cvUrl && isValidDisplayUrl(cvUrl));
      const hasContact = Boolean(phoneClean);

      if (!hasPorto && !hasCv && !hasContact) return '';

      const portoCardHtml = hasPorto ? `
        <div class="qr-card">
          <img src="${portoQr}" alt="QR Portfolio" class="qr-img" />
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 11px; color: #0F172A; display: flex; align-items: center; gap: 4px;">
              <span>📁</span> Portofolio Kreatif &amp; Media
            </div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px; word-break: break-all; font-family: 'Geist Mono', monospace; line-height: 1.3;">
              ${escapeHtml(primaryPortoUrl.length > 55 ? primaryPortoUrl.slice(0, 52) + '...' : primaryPortoUrl)}
            </div>
            <div style="font-size: 8.5px; color: #059669; font-weight: 600; margin-top: 4px;">
              ✓ Siap scan langsung via smartphone
            </div>
          </div>
        </div>
      ` : '';

      const docCardHtml = (hasCv || hasContact) ? `
        <div class="qr-card">
          ${cvOrWaQr ? `<img src="${cvOrWaQr}" alt="QR CV" class="qr-img" />` : ''}
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 11px; color: #0F172A; display: flex; align-items: center; gap: 4px;">
              <span>📄</span> ${hasCv ? 'Curriculum Vitae (PDF)' : 'Kontak WhatsApp'}
            </div>
            <div style="margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
              ${skills.slice(0, 4).map(s => `
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 2px 5px; border-radius: 3px; display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">${s.name}:</span>
                  <strong style="color: #D97706;">★ ${s.rating}</strong>
                </div>
              `).join('')}
            </div>
            <div style="font-size: 9px; color: #1E40AF; font-weight: 700; margin-top: 4px;">
              Rating Baseline: ★ ${(talent.overallRating || 3).toFixed(1)} / 5.0
            </div>
          </div>
        </div>
      ` : '';

      const gridCols = (hasPorto && (hasCv || hasContact)) ? '1fr 1fr' : '1fr';

      return `
        <div class="section-card">
          <div class="section-card-title">
            <span>🌐 Dokumen Kandidat (Scan via Kamera HP)</span>
            <span style="font-size: 9px; color: #64748B; font-weight: 500;">Arahkan kamera smartphone untuk membuka berkas</span>
          </div>
          <div class="qr-grid" style="grid-template-columns: ${gridCols};">
            ${portoCardHtml}
            ${docCardHtml}
          </div>
        </div>
      `;
    })()}

    <!-- Team Discussion & Prior Screener Comments (Cleaned Human Notes Only) -->
    ${(function() {
      const cleanHumanNotes = (function(raw) {
        if (!raw || typeof raw !== 'string') return '';
        return raw
          .replace(/\\[Status:\\s*[^\\\\\\]]+\\]/gi, '')
          .replace(/\\[Interview Scheduled:\\s*[^\\\\\\]]+\\]/gi, '')
          .replace(/\\[Interview Result:\\s*[^\\\\\\]]+\\]/gi, '')
          .replace(/^Domisili:\\s*[^\\n\\r]+/gim, '')
          .replace(/^Pendidikan:\\s*[^\\n\\r]+/gim, '')
          .trim();
      })(talent.notes || '');

      const hasReviewerComments = discussList.length > 0;
      const hasCleanNotes = Boolean(cleanHumanNotes);

      return `
        <div class="section-card">
          <div class="section-card-title">
            <span>💬 Catatan Tim Reviewer &amp; Riwayat Evaluasi Awal</span>
            <span style="font-size: 9px; color: #64748B; font-weight: 500;">
              ${hasReviewerComments ? discussList.length + ' Catatan Internal' : (hasCleanNotes ? 'Catatan Awal' : '0 Catatan')}
            </span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            ${hasReviewerComments ? discussList.slice(0, 3).map(m => `
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 5px 8px; font-size: 9.5px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <strong style="color: #0F172A;">${escapeHtml(m.senderName || m.senderEmail || 'Evaluator')}:</strong>
                  <span style="color: #334155; margin-left: 4px;">${escapeHtml(m.text || '')}</span>
                </div>
                ${m.tag ? `<span style="font-size: 8.5px; font-weight: 700; background: #DBEAFE; color: #1E40AF; padding: 1px 5px; border-radius: 3px; white-space: nowrap; margin-left: 8px;">${escapeHtml(m.tag)}</span>` : ''}
              </div>
            `).join('') : (hasCleanNotes ? `
              <div style="font-size: 9.5px; color: #334155; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 6px 9px; border-radius: 4px; line-height: 1.4;">
                ${escapeHtml(cleanHumanNotes)}
              </div>
            ` : `
              <div style="font-size: 9px; color: #94A3B8; font-style: italic; background: #F8FAFC; border: 1px dashed #E2E8F0; padding: 6px 10px; border-radius: 4px;">
                Belum ada catatan khusus sebelum wawancara. Silakan catat poin observasi langsung pada lembar rubrik di bawah.
              </div>
            `)}
          </div>
        </div>
      `;
    })()}
"""

    content = content[:start_idx] + new_sections_html + "\n\n" + content[end_idx:]

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched printCandidateReportCard successfully!")

if __name__ == '__main__':
    patch_report_card_clean_data()
