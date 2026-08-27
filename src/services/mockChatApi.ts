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
