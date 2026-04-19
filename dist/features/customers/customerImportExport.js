// features/customers/customerImportExport.js
// 고객 엑셀 내보내기 / 가져오기 (Phase F)
// SheetJS(전역 XLSX) 사용. 전화번호(정규화) 기준 upsert.

const ESC = s => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function normalizePhone(p) {
    return String(p || '').replace(/\D/g, '');
}

/**
 * 현재 로드된 전체 고객을 엑셀로 내보내기.
 * 파일명: 고객목록_YYYY-MM-DD.xlsx
 */
export function exportCustomersToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('XLSX 라이브러리가 로드되지 않았습니다.');
        return;
    }
    const list = window.customerDataManager?.farm_customers || [];
    if (list.length === 0) {
        alert('내보낼 고객이 없습니다.');
        return;
    }

    // 등급 코드 → 표시명
    const grades = window.settingsDataManager?.settings?.customerGrades || [];
    const gradeLabel = code => {
        if (!code) return '';
        const g = grades.find(x => (x.code || x.grade_code) === code);
        return g?.name || code;
    };

    const rows = [[
        '고객명', '전화번호', '이메일', '주소', '상세주소',
        '등급', '태그', '메모', '등록일', '가입일시'
    ]];

    for (const c of list) {
        rows.push([
            c.name || '',
            c.phone || '',
            c.email || '',
            c.address || '',
            c.address_detail || '',
            gradeLabel(c.grade),
            Array.isArray(c.tags) ? c.tags.join(', ') : '',
            c.memo || '',
            c.registration_date || '',
            c.created_at || ''
        ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    // 컬럼 폭 자동화 (데이터 길이 기반)
    ws['!cols'] = rows[0].map((_, i) => {
        const maxLen = rows.reduce((m, r) => Math.max(m, String(r[i] ?? '').length), 10);
        return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '고객목록');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `고객목록_${today}.xlsx`);
}

/**
 * 한글 헤더 → farm_customers 필드 매핑
 */
const HEADER_MAP = {
    '고객명': 'name',        '이름': 'name',
    '전화번호': 'phone',     '연락처': 'phone',     '휴대폰': 'phone',
    '이메일': 'email',       'email': 'email',
    '주소': 'address',
    '상세주소': 'address_detail',
    '등급': 'grade_label',   // 표시명 → code 로 변환 필요
    '태그': 'tags',
    '메모': 'memo',          '비고': 'memo',
    '등록일': 'registration_date',
};

/**
 * 엑셀 파일을 파싱해 배열 반환 (검증·미리보기용, DB 미반영)
 * @param {File} file
 * @returns {Promise<{headers:string[], rows:Array<Object>, rawRowCount:number}>}
 */
export async function parseCustomerExcelFile(file) {
    if (typeof XLSX === 'undefined') throw new Error('XLSX 라이브러리 없음');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (arr.length < 2) throw new Error('엑셀에 데이터가 없습니다 (헤더 포함 2행 이상 필요).');

    const rawHeaders = arr[0].map(h => String(h || '').trim());
    // 매핑 가능한 컬럼 인덱스
    const colIdx = {};
    rawHeaders.forEach((h, i) => {
        const field = HEADER_MAP[h];
        if (field) colIdx[field] = i;
    });
    if (colIdx.phone === undefined) {
        throw new Error('전화번호 컬럼을 찾을 수 없습니다. 헤더에 "전화번호" 또는 "연락처" 필요.');
    }
    if (colIdx.name === undefined) {
        throw new Error('고객명 컬럼을 찾을 수 없습니다. 헤더에 "고객명" 또는 "이름" 필요.');
    }

    // 등급 표시명 → code 매핑
    const grades = window.settingsDataManager?.settings?.customerGrades || [];
    const gradeLabelToCode = label => {
        if (!label) return null;
        const g = grades.find(x => x.name === label);
        return g ? (g.code || g.grade_code || 'GENERAL') : null;
    };

    const rows = [];
    for (let r = 1; r < arr.length; r++) {
        const row = arr[r];
        if (!row || row.every(cell => !String(cell || '').trim())) continue;

        const obj = {};
        for (const [field, i] of Object.entries(colIdx)) {
            let v = row[i];
            v = v == null ? '' : String(v).trim();
            if (field === 'tags') {
                obj.tags = v ? v.split(/[,·;]/).map(x => x.trim()).filter(Boolean) : [];
            } else if (field === 'grade_label') {
                const code = gradeLabelToCode(v);
                if (code) obj.grade = code;
            } else if (v) {
                obj[field] = v;
            }
        }

        // 필수 필드 검증 (이름·전화번호)
        if (!obj.name || !obj.phone) continue;

        rows.push(obj);
    }

    return {
        headers: rawHeaders,
        rows,
        rawRowCount: arr.length - 1
    };
}

/**
 * 파싱된 행을 DB 에 upsert (전화번호 기준).
 * @param {Array<Object>} rows  parseCustomerExcelFile().rows
 * @param {{ mergeStrategy?: 'overwrite'|'preserveEmpty', onProgress?: (done:number,total:number)=>void }} opts
 *   - overwrite: 엑셀 값이 비어있어도 빈값으로 덮어씀
 *   - preserveEmpty: 엑셀 값이 비어있으면 기존값 유지 (기본)
 * @returns {Promise<{added:number, updated:number, errors:Array}>}
 */
export async function importCustomerRows(rows, opts = {}) {
    const { mergeStrategy = 'preserveEmpty', onProgress } = opts;
    if (!window.customerDataManager) throw new Error('customerDataManager 없음');

    const existingByPhone = new Map();
    for (const c of (window.customerDataManager.farm_customers || [])) {
        const key = normalizePhone(c.phone);
        if (key) existingByPhone.set(key, c);
    }

    let added = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const phoneKey = normalizePhone(row.phone);
        if (!phoneKey) {
            errors.push({ row: row.name || '(무명)', error: '전화번호가 없습니다.' });
            continue;
        }

        const existing = existingByPhone.get(phoneKey);

        try {
            if (existing) {
                // 업데이트: mergeStrategy 적용
                const merged = { ...existing };
                for (const [k, v] of Object.entries(row)) {
                    if (mergeStrategy === 'preserveEmpty' && (v === '' || v == null || (Array.isArray(v) && v.length === 0))) {
                        continue;
                    }
                    // 태그는 기존 + 신규 합집합 (중복 제거)
                    if (k === 'tags' && Array.isArray(v)) {
                        const prev = Array.isArray(existing.tags) ? existing.tags : [];
                        merged.tags = Array.from(new Set([...prev, ...v]));
                    } else {
                        merged[k] = v;
                    }
                }
                await window.customerDataManager.updateCustomer(existing.id, merged);
                updated++;
            } else {
                // 신규 추가
                await window.customerDataManager.addCustomer(row);
                added++;
            }
        } catch (e) {
            errors.push({ row: row.name || row.phone, error: e.message || String(e) });
        }

        if (onProgress) onProgress(i + 1, rows.length);
    }

    return { added, updated, errors };
}

/**
 * 파일 선택 → 미리보기 모달 → 실행
 */
export async function openImportDialog(file) {
    try {
        const parsed = await parseCustomerExcelFile(file);
        if (parsed.rows.length === 0) {
            alert('가져올 유효한 행이 없습니다 (전화번호·고객명 필수).');
            return;
        }

        const existingByPhone = new Map();
        for (const c of (window.customerDataManager?.farm_customers || [])) {
            const key = normalizePhone(c.phone);
            if (key) existingByPhone.set(key, c);
        }

        let toUpdate = 0;
        let toAdd = 0;
        for (const r of parsed.rows) {
            if (existingByPhone.has(normalizePhone(r.phone))) toUpdate++;
            else toAdd++;
        }

        const skipped = parsed.rawRowCount - parsed.rows.length;
        const msg = [
            `엑셀 파일 분석 결과:`,
            ``,
            `• 파일 행 수: ${parsed.rawRowCount}`,
            `• 유효한 행: ${parsed.rows.length}`,
            `  - 신규 추가: ${toAdd}명`,
            `  - 기존 업데이트: ${toUpdate}명 (전화번호 일치)`,
            skipped > 0 ? `• 건너뜀: ${skipped} (빈 행 또는 필수 필드 누락)` : '',
            ``,
            `※ 기존 고객 업데이트 시 엑셀의 빈 값은 기존 데이터 유지`,
            `※ 태그는 기존 태그와 합쳐집니다 (중복 제거)`,
            ``,
            `실행하시겠습니까?`
        ].filter(Boolean).join('\n');

        if (!confirm(msg)) return;

        const result = await importCustomerRows(parsed.rows, {
            mergeStrategy: 'preserveEmpty',
            onProgress: (done, total) => {
                if (window.showToast && done % 10 === 0) {
                    window.showToast(`가져오는 중… ${done}/${total}`, 1500);
                }
            }
        });

        const errMsg = result.errors.length > 0
            ? `\n\n실패 상세 (상위 5건):\n${result.errors.slice(0, 5).map(e => `• ${e.row}: ${e.error}`).join('\n')}${result.errors.length > 5 ? `\n• … 외 ${result.errors.length - 5}건` : ''}`
            : '';

        alert(
            `📥 고객 가져오기 완료\n\n` +
            `신규 추가: ${result.added}명\n` +
            `기존 업데이트: ${result.updated}명\n` +
            `실패: ${result.errors.length}건` +
            errMsg
        );

        if (window.renderCustomersTable) window.renderCustomersTable('all');
    } catch (e) {
        console.error('❌ 가져오기 실패:', e);
        alert('가져오기 실패: ' + (e.message || e));
    }
}

// 전역 노출
window.customerImportExport = {
    exportCustomersToExcel,
    parseCustomerExcelFile,
    importCustomerRows,
    openImportDialog,
};
window.exportCustomersToExcel = exportCustomersToExcel;
