import React from 'react';
import { Target, Award, Compass, CheckCircle2 } from 'lucide-react';

const AboutPage = () => {
  return (
    <main className="min-h-[70vh] bg-[#FFFDF2] text-[#111111] pb-16">
      {/* Page Header Banner */}
      <section className="border-b-[3px] border-[#111111] bg-[#FFE600] px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-block border-2 border-[#111111] bg-white px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_#111111] mb-3">
            Về chúng tôi
          </span>
          <h1 className="text-3xl font-black sm:text-4xl md:text-5xl leading-tight">
            Hệ Thống Luyện Thi TOEIC Trực Tuyến ToeicElearning
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold sm:text-lg">
            Dự án phát triển bởi sinh viên Trần Anh Vũ (Email: trananhvu314159@gmail.com | SĐT: 0359906510) - Trường Đại Học Cần Thơ.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-[3px] border-[#111111] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#111111]">
          <div className="md:col-span-7">
            <span className="inline-block border-2 border-[#111111] bg-[#FF5B93] px-3 py-1 text-xs font-black uppercase tracking-wide text-white mb-2 shadow-[2px_2px_0_#111111]">
              Sứ mệnh &amp; Tầm nhìn
            </span>
            <h2 className="text-2xl font-black sm:text-3xl mt-2 mb-4">
              Đồng Hành Chinh Phục Điểm Số TOEIC
            </h2>
            <p className="font-medium text-[#333333] leading-relaxed mb-4">
              Tiếng Anh TOEIC là chuẩn đầu ra thiết yếu đối với sinh viên các trường đại học và là tấm vé thông hành quan trọng khi gia nhập thị trường lao động công nghệ.
            </p>
            <p className="font-medium text-[#333333] leading-relaxed mb-6">
              Hệ thống ToeicElearning được xây dựng nhằm cung cấp giải pháp tự học, tự ôn luyện toàn diện, trực quan và dễ tiếp cận nhất. Chúng tôi số hóa các bài tập, phân tích cấu trúc 7 phần thi TOEIC, cung cấp môi trường luyện đề chuẩn xác giúp học viên phát triển toàn diện cả hai kỹ năng Listening và Reading.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 border-2 border-[#111111] bg-[#FFFDF2] p-3 shadow-[2px_2px_0_#111111]">
                <CheckCircle2 size={20} className="text-[#111111] mt-0.5 shrink-0" />
                <span className="font-bold text-sm">Kho bài tập bám sát format đề thi ETS mới nhất</span>
              </div>
              <div className="flex items-start gap-3 border-2 border-[#111111] bg-[#FFFDF2] p-3 shadow-[2px_2px_0_#111111]">
                <CheckCircle2 size={20} className="text-[#111111] mt-0.5 shrink-0" />
                <span className="font-bold text-sm">Giao diện hiện đại, tối ưu trải nghiệm học trên máy tính và điện thoại</span>
              </div>
              <div className="flex items-start gap-3 border-2 border-[#111111] bg-[#FFFDF2] p-3 shadow-[2px_2px_0_#111111]">
                <CheckCircle2 size={20} className="text-[#111111] mt-0.5 shrink-0" />
                <span className="font-bold text-sm">Nền tảng được bảo chứng kỹ thuật với Spring Boot và ReactJS</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="w-full border-[3px] border-[#111111] bg-[#FFE600] p-2 shadow-[5px_5px_0_#111111]">
              <img
                src="/images/students-7.webp"
                alt="Học nhóm TOEIC"
                className="w-full h-72 sm:h-80 object-cover border-2 border-[#111111]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/education-square-7.webp';
                }}
              />
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mt-14">
          <div className="text-center mb-8">
            <span className="inline-block border-2 border-[#111111] bg-[#FFE600] px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#111111]">
              GIÁ TRỊ CỐT LÕI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Cam Kết Chất Lượng Đào Tạo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-[3px] border-[#111111] bg-white p-6 shadow-[5px_5px_0_#111111] transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
              <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#111111] bg-[#FFE600] shadow-[2px_2px_0_#111111] mb-4">
                <Target size={24} className="text-[#111111]" />
              </div>
              <h3 className="text-lg font-black mb-2">Định hướng mục tiêu rõ ràng</h3>
              <p className="text-sm font-semibold text-[#444444] leading-relaxed">
                Cung cấp lộ trình luyện thi theo từng thang điểm từ 450, 650 đến 850+, giúp bạn định hình rõ năng lực hiện tại.
              </p>
            </div>

            <div className="border-[3px] border-[#111111] bg-white p-6 shadow-[5px_5px_0_#111111] transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
              <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#111111] bg-[#FF5B93] text-white shadow-[2px_2px_0_#111111] mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-black mb-2">Chuẩn chất lượng học thuật</h3>
              <p className="text-sm font-semibold text-[#444444] leading-relaxed">
                Nội dung câu hỏi, audio và giải thích được biên soạn cẩn thận, sát với thực tế đề thi tại IIG Việt Nam.
              </p>
            </div>

            <div className="border-[3px] border-[#111111] bg-white p-6 shadow-[5px_5px_0_#111111] transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#111111]">
              <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[#111111] bg-[#d7f36b] shadow-[2px_2px_0_#111111] mb-4">
                <Compass size={24} className="text-[#111111]" />
              </div>
              <h3 className="text-lg font-black mb-2">Tiện lợi &amp; Linh hoạt</h3>
              <p className="text-sm font-semibold text-[#444444] leading-relaxed">
                Học mọi lúc mọi nơi trên mọi thiết bị. Giao diện được tối ưu hóa cho tốc độ tải cực nhanh và mượt mà.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
