import type { ChatRequest, ChatResponse } from '../types/chat';

export async function mockChatRequest(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  // Simulate network latency between 800ms and 1300ms
  const latency = Math.floor(Math.random() * 500) + 800;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve();
    }, latency);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });

  const q = (request.query || '').trim().toLowerCase();
  const historyText = (request.history || [])
    .map((h) => h.content.toLowerCase())
    .join(' ');

  // 1. Insufficient evidence trigger for testing
  if (
    q.includes('chiêm tinh') ||
    q.includes('bài thuốc dân gian truyền miệng') ||
    q.includes('lá đu đủ chữa ung thư') ||
    q.includes('bói toán') ||
    q.includes('ngoài danh mục')
  ) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'insufficient_evidence',
      query: request.query,
      answer: 'INSUFFICIENT_EVIDENCE',
      citations: [],
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 2. Ivabradine Follow-up (e.g. "Thế liều bao nhiêu?") based on recent conversation history or direct query
  if (
    (q.includes('liều') && (q.includes('thế') || q.includes('bao nhiêu') || q.includes('dùng') || q.includes('ivabradine'))) &&
    (historyText.includes('ivabradine') || q.includes('ivabradine'))
  ) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Liều dùng khuyến cáo của Ivabradine trong điều trị suy tim phân suất tống máu giảm (HFrEF):

- **Liều khởi đầu**: 5 mg x 2 lần/ngày, uống trong bữa ăn. [E1]
- **Bệnh nhân cao tuổi (≥ 75 tuổi)** hoặc có tiền sử nhạy cảm: xem xét khởi đầu liều thấp hơn 2.5 mg x 2 lần/ngày trước khi tăng liều. [E1]
- **Điều chỉnh liều (chuẩn độ sau 2-4 tuần)** theo nhịp tim lúc nghỉ:
  + Nếu tần số tim **> 60 lần/phút**: tăng liều lên 7.5 mg x 2 lần/ngày (liều tối đa). [E2]
  + Nếu tần số tim **50 - 60 lần/phút**: duy trì liều 5 mg x 2 lần/ngày. [E2]
  + Nếu tần số tim **< 50 lần/phút** hoặc có triệu chứng nhịp chậm: giảm liều xuống 2.5 mg x 2 lần/ngày (hoặc ngừng thuốc nếu đang dùng 2.5 mg). [E2]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_vnha_hf_2022',
          document_title: 'Khuyến cáo chẩn đoán và điều trị suy tim cấp và mạn – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 38,
          section_id: 'sec_ivabradine_dosing',
          breadcrumb: 'PHÁC ĐỒ VÀ LIỀU LƯỢNG IVABRADINE TRONG HFrEF',
          source_unit_id: 'unit_vnha_hf_p38_01',
          quote: 'Khởi đầu Ivabradine 5mg 2 lần mỗi ngày cùng bữa ăn. Với người bệnh ≥ 75 tuổi hoặc có nguy cơ rối loạn huyết động do nhịp chậm, khởi đầu với 2.5mg x 2 lần/ngày.',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_vnha_hf_2022',
          document_title: 'Khuyến cáo chẩn đoán và điều trị suy tim cấp và mạn – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 39,
          section_id: 'sec_ivabradine_titration',
          breadcrumb: 'CHUẨN ĐỘ LIỀU DỰA TRÊN TẦN SỐ TIM LÚC NGHỈ',
          source_unit_id: 'unit_vnha_hf_p39_02',
          quote: 'Đánh giá tần số tim lúc nghỉ sau 2 - 4 tuần. Tăng liều lên tối đa 7.5mg x 2 lần/ngày nếu HR > 60 bpm. Giảm liều hoặc tạm ngừng nếu HR < 50 bpm hoặc xuất hiện triệu chứng liên quan đến nhịp chậm.',
        },
      ],
      evidence: {
        pack_version: 'PACK_CARDIO_2024_Q3',
        retrieval_count: 4,
        primary_count: 2,
        supporting_count: 2,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 3. Ivabradine Indication (e.g. "Ivabradine dùng khi nào?")
  if (q.includes('ivabradine') || (q.includes('iva') && (q.includes('khi nào') || q.includes('chỉ định')))) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Ivabradine (thuốc ức chế chọn lọc dòng If tại nút xoang) được chỉ định trong điều trị suy tim mạn tính theo các tiêu chí sau:

1. **Phân loại suy tim**: Bệnh nhân suy tim có phân suất tống máu giảm (HFrEF với EF ≤ 35%) và còn triệu chứng (NYHA II–IV). [E1]
2. **Nhịp tim và nhịp xoang**: Bệnh nhân đang ở **nhịp xoang** và có tần số tim lúc nghỉ **≥ 70 chu kỳ/phút**. [E1]
3. **Phối hợp điều trị nền tảng**: Đã được điều trị tối ưu bằng liều chẹn beta giao cảm dung nạp được (hoặc chống chỉ định/không dung nạp chẹn beta) phối hợp cùng nhóm thuốc ức chế hệ RAA (ACEi/ARB/ARNI) và thuốc kháng aldosterone (MRA). [E2]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_vnha_hf_2022',
          document_title: 'Khuyến cáo chẩn đoán và điều trị suy tim cấp và mạn – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 37,
          section_id: 'sec_ivabradine_ind',
          breadcrumb: 'CHỈ ĐỊNH IVABRADINE TRONG SUY TIM PHÂN SUẤT TỐNG MÁU GIẢM',
          source_unit_id: 'unit_vnha_hf_p37_01',
          quote: 'Ivabradine được khuyến cáo nhằm giảm nguy cơ tái nhập viện do suy tim và tử vong tim mạch ở bệnh nhân HFrEF có triệu chứng, EF ≤ 35%, nhịp xoang với tần số tim nghỉ ≥ 70 bpm dù đã điều trị chẹn beta liều tối ưu.',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_byt_hf_2020',
          document_title: 'Hướng dẫn chẩn đoán và điều trị suy tim mạn tính – Bộ Y tế 2020',
          page_number: 22,
          section_id: 'sec_byt_hf_drugs',
          breadcrumb: 'CÁC THUỐC PHỐI HỢP TRONG PHÁC ĐỒ ĐIỀU TRỊ SUY TIM',
          source_unit_id: 'unit_byt_hf_p22_02',
          quote: 'Chỉ định Ivabradine phối hợp khi người bệnh không đạt mục tiêu nhịp tim dù đã dùng chẹn beta tối đa dung nạp, hoặc dùng thay thế khi có chống chỉ định tuyệt đối với chẹn beta giao cảm.',
        },
      ],
      evidence: {
        pack_version: 'PACK_CARDIO_2024_Q3',
        retrieval_count: 4,
        primary_count: 2,
        supporting_count: 2,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 4. Spironolactone in HFrEF (e.g. "Liều spironolacton trong HFrEF?" / "spironolactone")
  if (
    q.includes('spironolacton') ||
    q.includes('spironolactone') ||
    (q.includes('mra') && q.includes('hfref')) ||
    (q.includes('kháng aldosterone') && q.includes('liều'))
  ) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Liều dùng của Spironolacton (thuốc kháng thụ thể Mineralocorticoid - MRA) trong điều trị suy tim phân suất tống máu giảm (HFrEF):

- **Liều khởi đầu**: 25 mg x 1 lần/ngày. [E1]
  *(Nếu eGFR từ 30 – 49 mL/phút/1.73 m² hoặc Kali huyết thanh 4.5 – 5.0 mmol/L, nên khởi đầu liều 12.5 mg/ngày hoặc 25 mg cách ngày).* [E1]
- **Liều mục tiêu (đích)**: 50 mg x 1 lần/ngày, chuẩn độ tăng liều sau mỗi 4 – 8 tuần nếu dung nạp tốt và chức năng thận ổn định. [E1]
- **Quy trình theo dõi an toàn bắt buộc**:
  + Kiểm tra Kali máu và Creatinine (eGFR) tại các thời điểm: 1 tuần, 4 tuần sau khởi trị/tăng liều, sau đó định kỳ mỗi 3 – 6 tháng. [E2]
  + Giảm liều xuống 25 mg cách ngày (hoặc 12.5 mg/ngày) nếu Kali máu tăng > 5.0 mmol/L hoặc eGFR giảm đáng kể. [E2]
  + Tạm ngưng thuốc nếu Kali máu ≥ 5.5 mmol/L hoặc eGFR < 30 mL/phút/1.73 m². [E2]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_vnha_hf_2022',
          document_title: 'Khuyến cáo chẩn đoán và điều trị suy tim cấp và mạn – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 31,
          section_id: 'sec_mra_dosing',
          breadcrumb: 'PHÁC ĐỒ SỬ DỤNG THUỐC KHÁNG ALDOSTERONE TRONG HFrEF',
          source_unit_id: 'unit_vnha_hf_p31_01',
          quote: 'Spironolacton khởi đầu 25mg/ngày, tăng liều lên 50mg/ngày sau 4-8 tuần. Là 1 trong 4 nhóm thuốc nền tảng trụ cột bắt buộc trong điều trị HFrEF nhằm giảm tỷ lệ tử vong và tái nhập viện.',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_vnha_hf_2022',
          document_title: 'Khuyến cáo chẩn đoán và điều trị suy tim cấp và mạn – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 32,
          section_id: 'sec_mra_safety',
          breadcrumb: 'THEO DÕI NỒNG ĐỘ KALI MÁU VÀ CHỨC NĂNG THẬN KHI DÙNG MRA',
          source_unit_id: 'unit_vnha_hf_p32_02',
          quote: 'Định lượng ion đồ (K+) và chức năng thận (Creatinine/eGFR) tại thời điểm 1 tuần và 4 tuần sau bắt đầu điều trị hoặc sau mỗi lần điều chỉnh liều. Tạm ngưng nếu K+ > 5.5 mmol/l.',
        },
      ],
      evidence: {
        pack_version: 'PACK_CARDIO_2024_Q3',
        retrieval_count: 5,
        primary_count: 2,
        supporting_count: 3,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 2. Hen phế quản
  if (q.includes('hạ bậc') || (q.includes('hen') && q.includes('điều trị'))) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Việc hạ bậc điều trị được xem xét khi triệu chứng hen đã được kiểm soát tốt và chức năng phổi ổn định trong thời gian từ 3 tháng trở lên (≥ 3 tháng). [E1]

Trước khi thực hiện hạ bậc, cần đánh giá các yếu tố dự báo mất kiểm soát hen, và nếu có các yếu tố này thì việc hạ bậc phải được theo dõi chặt chẽ. [E2]

Trước khi hạ bậc điều trị, cần cung cấp cho người bệnh một bản kế hoạch hành động đồng thời hướng dẫn phương pháp và thời điểm quay lại mức điều trị trước đó nếu triệu chứng nặng lên. [E3]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_hohap_hen_2021',
          document_title: 'Hướng dẫn chẩn đoán và điều trị hen phế quản – BYT 2021',
          page_number: 13,
          section_id: 'sec_ha_bac_01',
          breadcrumb: 'HẠ BẬC ĐIỀU TRỊ KHI HEN ĐƯỢC KIỂM SOÁT TỐT',
          source_unit_id: 'unit_byt_hen_p13_01',
          quote: 'Khi hen đã được kiểm soát tốt và ổn định chức năng phổi trong thời gian ≥ 3 tháng, có thể xem xét hạ bậc điều trị để tìm liều thuốc duy trì thấp nhất có hiệu quả kiểm soát triệu chứng và giảm đợt cấp.',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_hohap_hen_2021',
          document_title: 'Hướng dẫn chẩn đoán và điều trị hen phế quản – BYT 2021',
          page_number: 13,
          section_id: 'sec_ha_bac_02',
          breadcrumb: 'ĐÁNH GIÁ YẾU TỐ NGUY CƠ TRƯỚC KHI HẠ BẬC',
          source_unit_id: 'unit_byt_hen_p13_02',
          quote: 'Đánh giá các yếu tố nguy cơ đợt cấp trước khi giảm liều: tiền sử đợt cấp nặng trong 12 tháng qua, FEV1 < 60%, hút thuốc lá, tiếp xúc dị nguyên liên tục, tuân thủ điều trị kém hoặc kỹ thuật dùng bình hít/xịt không chuẩn xác.',
        },
        {
          evidence_id: 'E3',
          document_id: 'doc_hohap_hen_2021',
          document_title: 'Hướng dẫn chẩn đoán và điều trị hen phế quản – BYT 2021',
          page_number: 14,
          section_id: 'sec_ke_hoach_01',
          breadcrumb: 'KẾ HOẠCH HÀNH ĐỘNG VÀ THEO DÕI',
          source_unit_id: 'unit_byt_hen_p14_01',
          quote: 'Cung cấp cho người bệnh bản kế hoạch hành động kiểm soát hen bằng văn bản, hướng dẫn cụ thể cách nhận biết sớm dấu hiệu mất kiểm soát và liều thuốc cần tăng lại ngay lập tức.',
        },
      ],
      evidence: {
        pack_version: 'PACK_RESPIRATORY_2024_Q1',
        retrieval_count: 6,
        primary_count: 3,
        supporting_count: 3,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
        usage: { prompt_tokens: 1450, completion_tokens: 280 },
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2', 'E3'],
      },
      grounding_validation: {
        version: 'CLAIM_GROUNDING_VALIDATOR_V1',
        valid: true,
        claim_count: 3,
        validated_claims: [],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 3. Kháng đông rung nhĩ
  if (q.includes('kháng đông') || (q.includes('rung nhĩ') && (q.includes('chỉ định') || q.includes('thuốc')))) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Chỉ định điều trị kháng đông dự phòng đột quỵ và thuyên tắc mạch ở bệnh nhân rung nhĩ không do bệnh van tim dựa trên phân tầng nguy cơ theo thang điểm CHA₂DS₂-VASc:

1. **Nam giới ≥ 2 điểm hoặc Nữ giới ≥ 3 điểm**: Khuyến cáo chỉ định kháng đông đường uống (chỉ định nhóm I). Trong đó, thuốc kháng đông đường uống trực tiếp (DOAC/NOAC) được ưu tiên hơn kháng vitamin K (VKA). [E1]
2. **Nam giới 1 điểm hoặc Nữ giới 2 điểm**: Cân nhắc chỉ định kháng đông (chỉ định nhóm IIa) dựa trên việc cá thể hóa nguy cơ chảy máu (thang điểm HAS-BLED) và nguyện vọng của bệnh nhân. [E2]
3. **Nam giới 0 điểm hoặc Nữ giới 1 điểm**: Không khuyến cáo dùng thuốc kháng đông hoặc thuốc chống kết tập tiểu cầu đơn thuần (chỉ định nhóm III). [E1]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_vnha_afib_2022',
          document_title: 'Khuyến cáo chẩn đoán và xử trí rung nhĩ – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 24,
          section_id: 'sec_anticoag_01',
          breadcrumb: 'CHỈ ĐỊNH KHÁNG ĐÔNG DỰA TRÊN THANG ĐIỂM CHA2DS2-VASc',
          source_unit_id: 'unit_vnha_afib_p24_01',
          quote: 'Chỉ định điều trị kháng đông đường uống lâu dài nhằm giảm nguy cơ đột quỵ thiếu máu não cục bộ và tắc mạch hệ thống cho tất cả bệnh nhân rung nhĩ có CHA2DS2-VASc ≥ 2 (nam) hoặc ≥ 3 (nữ).',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_vnha_afib_2022',
          document_title: 'Khuyến cáo chẩn đoán và xử trí rung nhĩ – Hội Tim mạch học Việt Nam (VNHA) 2022',
          page_number: 25,
          section_id: 'sec_anticoag_hasbled',
          breadcrumb: 'ĐÁNH GIÁ NGUY CƠ XUẤT HUYẾT VỚI THANG ĐIỂM HAS-BLED',
          source_unit_id: 'unit_vnha_afib_p25_02',
          quote: 'Đánh giá nguy cơ xuất huyết bằng thang điểm HAS-BLED nhằm phát hiện và điều chỉnh các yếu tố nguy cơ có thể can thiệp được; điểm HAS-BLED cao (≥ 3) không phải là chống chỉ định tuyệt đối của kháng đông mà là chỉ dấu cần theo dõi sát hơn.',
        },
      ],
      evidence: {
        pack_version: 'PACK_CARDIO_2024_Q2',
        retrieval_count: 5,
        primary_count: 2,
        supporting_count: 3,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 4. Hội chứng thận hư
  if (q.includes('thận hư') || (q.includes('tiêu chuẩn') && q.includes('thận'))) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Hội chứng thận hư là một hội chứng lâm sàng và sinh hóa với 2 tiêu chuẩn bắt buộc:

1. **Protein niệu cao**: Định lượng protein niệu 24 giờ ≥ 3.5 g/24h (hoặc tỷ lệ Protein/Creatinine nước tiểu ngẫu nhiên > 3000 mg/g). [E1]
2. **Giảm protein và albumin huyết tương**: Protid máu toàn phần < 60 g/L và Albumin máu < 30 g/L. [E2]

Các triệu chứng lâm sàng và cận lâm sàng phối hợp (không bắt buộc nhưng có giá trị củng cố chẩn đoán):
- Phù nhiều, phù trắng, mềm, ấn lõm, đối xứng hai bên, có thể kèm tràn dịch đa màng. [E2]
- Rối loạn lipid máu: Tăng Cholesterol toàn phần (> 6.5 mmol/L) và tăng Triglyceride máu. [E3]
- Có thể thấy cặn lắng nước tiểu có trụ mỡ, thể chiết quang (hạt mỡ lưỡng chiết). [E3]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_nephro_ns_2020',
          document_title: 'Hướng dẫn chẩn đoán và điều trị bệnh Thận - Tiết niệu – Bộ Y tế 2020',
          page_number: 8,
          section_id: 'sec_ns_criteria_01',
          breadcrumb: 'TIÊU CHUẨN CHẨN ĐOÁN VÀ PHÂN LOẠI HỘI CHỨNG THẬN HƯ',
          source_unit_id: 'unit_byt_nephro_p8_01',
          quote: 'Tiêu chuẩn chẩn đoán xác định: Protein niệu 24 giờ ≥ 3,5g (ở trẻ em > 50mg/kg/ngày hoặc > 40mg/m2 da/giờ). Đây là tiêu chuẩn tiên quyết.',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_nephro_ns_2020',
          document_title: 'Hướng dẫn chẩn đoán và điều trị bệnh Thận - Tiết niệu – Bộ Y tế 2020',
          page_number: 9,
          section_id: 'sec_ns_criteria_02',
          breadcrumb: 'BIẾN ĐỔI SINH HÓA VÀ LÂM SÀNG ĐẶC TRƯNG',
          source_unit_id: 'unit_byt_nephro_p9_02',
          quote: 'Protein máu giảm dưới 60g/l và Albumin máu giảm dưới 30g/l. Phù là triệu chứng lâm sàng nổi bật do giảm áp lực keo huyết tương.',
        },
        {
          evidence_id: 'E3',
          document_id: 'doc_nephro_ns_2020',
          document_title: 'Hướng dẫn chẩn đoán và điều trị bệnh Thận - Tiết niệu – Bộ Y tế 2020',
          page_number: 10,
          section_id: 'sec_ns_lipid',
          breadcrumb: 'RỐI LOẠN CHUYỂN HÓA LIPID TRONG THẬN HƯ',
          source_unit_id: 'unit_byt_nephro_p10_01',
          quote: 'Tăng lipid máu: Cholesterol toàn phần tăng trên 6.5 mmol/l, Triglycerid tăng, tăng LDL-C do gan tăng tổng hợp lipoprotein thứ phát sau giảm albumin.',
        },
      ],
      evidence: {
        pack_version: 'PACK_NEPHROLOGY_2024_V1',
        retrieval_count: 4,
        primary_count: 3,
        supporting_count: 1,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2', 'E3'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 5. HFNC
  if (q.includes('hfnc') || (q.includes('oxy dòng cao') || q.includes('canula'))) {
    return {
      version: 'REASONING_GATEWAY_V1',
      status: 'ok',
      query: request.query,
      answer: `Thở oxy dòng cao qua canula mũi (High-Flow Nasal Cannula - HFNC) được chỉ định trong các tình huống lâm sàng chính sau:

1. **Suy hô hấp giảm oxy máu cấp tính**:
   - Bệnh nhân suy hô hấp cấp (PaO₂/FiO₂ từ 150 – 300 mmHg) không đáp ứng đủ với liệu pháp oxy qua kính mũi hoặc mặt nạ thông thường. [E1]
   - Giúp tạo áp lực dương nhẹ cuối thì thở ra (PEEP động), rửa sạch khoảng chết giải phẫu ở hầu họng và cung cấp dòng khí ấm ẩm ổn định. [E1]

2. **Dự phòng và hỗ trợ sau rút ống nội khí quản**:
   - Chỉ định cho bệnh nhân có nguy cơ cao thất bại sau rút ống (tuổi > 65, suy tim sung huyết kèm theo, BMI > 30, hoặc thông khí nhân tạo kéo dài > 48h). [E2]

3. **Chăm sóc giảm nhẹ hoặc hỗ trợ trước can thiệp nội soi**:
   - Duy trì oxy hóa máu tối ưu trong các thủ thuật nội soi phế quản ở bệnh nhân suy hô hấp. [E2]`,
      citations: [
        {
          evidence_id: 'E1',
          document_id: 'doc_icu_hfnc_2021',
          document_title: 'Hướng dẫn hồi sức cấp cứu và thông khí nhân tạo – Bộ Y tế 2021',
          page_number: 19,
          section_id: 'sec_hfnc_indication',
          breadcrumb: 'CHỈ ĐỊNH VÀ CHỐNG CHỈ ĐỊNH THỞ OXY DÒNG CAO QUA CANULA MŨI',
          source_unit_id: 'unit_byt_icu_p19_01',
          quote: 'Chỉ định HFNC trong suy hô hấp giảm oxy máu mức độ nhẹ đến trung bình khi SpO2 < 92% dù đã thở oxy qua mask thường, nhịp thở > 25 lần/phút và không có tăng CO2 máu mức độ nặng (pH ≥ 7.30).',
        },
        {
          evidence_id: 'E2',
          document_id: 'doc_icu_hfnc_2021',
          document_title: 'Hướng dẫn hồi sức cấp cứu và thông khí nhân tạo – Bộ Y tế 2021',
          page_number: 20,
          section_id: 'sec_hfnc_post_extubation',
          breadcrumb: 'SỬ DỤNG HFNC TRONG CAI THỞ MÁY VÀ HẬU PHẪU',
          source_unit_id: 'unit_byt_icu_p20_02',
          quote: 'Áp dụng HFNC ngay sau khi rút ống nội khí quản ở nhóm bệnh nhân có nguy cơ cao giúp giảm tỷ lệ đặt lại nội khí quản trong 72 giờ đầu so với thở oxy thông thường.',
        },
      ],
      evidence: {
        pack_version: 'PACK_ICU_2024_V2',
        retrieval_count: 4,
        primary_count: 2,
        supporting_count: 2,
        source_of_truth: 'retrieved_source_text',
        must_cite_evidence_ids: true,
      },
      provider: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        llm_calls: 1,
      },
      citation_validation: {
        valid: true,
        cited_ids: ['E1', 'E2'],
      },
      service_meta: {
        service_version: 'REASONING_GATEWAY_V1',
        elapsed_ms: latency,
        llm_calls: 1,
      },
    };
  }

  // 6. Generic Medical query fallback
  return {
    version: 'REASONING_GATEWAY_V1',
    status: 'ok',
    query: request.query,
    answer: `Dựa trên tài liệu hướng dẫn thực hành lâm sàng hiện hành:

Đối với vấn đề **"${request.query.trim()}"**, nguyên tắc xử trí ưu tiên đánh giá toàn diện tình trạng lâm sàng, phân tầng mức độ nghiêm trọng và loại trừ các dấu hiệu nguy cơ khẩn cấp. [E1]

Phác đồ điều trị khuyến cáo cần dựa trên căn nguyên bệnh học, tuân thủ đúng liều lượng, đường dùng và theo dõi sát đáp ứng cũng như tác dụng không mong muốn của thuốc. [E2]

Trong trường hợp bệnh nhân không đáp ứng hoặc có diễn biến bất thường, cần chỉ định các thăm dò cận lâm sàng chuyên sâu bổ sung và hội chẩn chuyên khoa kịp thời. [E3]`,
    citations: [
      {
        evidence_id: 'E1',
        document_id: 'doc_byt_general_guidelines_2023',
        document_title: 'Hướng dẫn chẩn đoán và xử trí các bệnh lý nội khoa thường gặp – Bộ Y tế',
        page_number: 45,
        section_id: 'sec_clinical_eval_01',
        breadcrumb: 'NGUYÊN TẮC ĐÁNH GIÁ VÀ XỬ TRÍ LÂM SÀNG',
        source_unit_id: 'unit_byt_gen_p45_01',
        quote: 'Luôn tiến hành đánh giá ban đầu gồm các dấu hiệu sinh tồn, tri giác và phân độ nặng của bệnh theo các thang điểm lâm sàng chuẩn hóa.',
      },
      {
        evidence_id: 'E2',
        document_id: 'doc_byt_general_guidelines_2023',
        document_title: 'Hướng dẫn chẩn đoán và xử trí các bệnh lý nội khoa thường gặp – Bộ Y tế',
        page_number: 48,
        section_id: 'sec_clinical_treat_02',
        breadcrumb: 'PHÁC ĐỒ ĐIỀU TRỊ VÀ THEO DÕI ĐÁP ỨNG',
        source_unit_id: 'unit_byt_gen_p48_02',
        quote: 'Điều trị cá thể hóa trên từng bệnh nhân, lưu ý điều chỉnh liều theo chức năng gan, thận và tiền sử dị ứng thuốc.',
      },
      {
        evidence_id: 'E3',
        document_id: 'doc_byt_general_guidelines_2023',
        document_title: 'Hướng dẫn chẩn đoán và xử trí các bệnh lý nội khoa thường gặp – Bộ Y tế',
        page_number: 52,
        section_id: 'sec_clinical_monitoring_03',
        breadcrumb: 'TIÊU CHUẨN THEO DÕI VÀ CHUYỂN TUYẾN',
        source_unit_id: 'unit_byt_gen_p52_01',
        quote: 'Thiết lập kế hoạch theo dõi định kỳ, hướng dẫn bệnh nhân các dấu hiệu cảnh báo cần tái khám ngay.',
      },
    ],
    evidence: {
      pack_version: 'PACK_GENERAL_MED_2024',
      retrieval_count: 5,
      primary_count: 3,
      supporting_count: 2,
      source_of_truth: 'retrieved_source_text',
      must_cite_evidence_ids: true,
    },
    provider: {
      provider: 'gemini',
      model: 'gemini-3.7-flash',
      llm_calls: 1,
    },
    citation_validation: {
      valid: true,
      cited_ids: ['E1', 'E2', 'E3'],
    },
    service_meta: {
      service_version: 'REASONING_GATEWAY_V1',
      elapsed_ms: latency,
      llm_calls: 1,
    },
  };
}
