'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';

export interface Template {
  id: string;
  name: string;
  file_path?: string;
}

type TemplateCarouselProps = {
  templates: Template[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export default function Carousel({
  templates,
  selectedId,
  onSelect,
}: TemplateCarouselProps) {
  return (
    <div className="relative w-full">
      <Swiper
        spaceBetween={24}
        slidesPerView="auto"
        centeredSlides={true}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="py-10"
      >
        {templates.map((t) => (
          <SwiperSlide
            key={t.id}
            style={{ width: 320 }} // 🔥 DIBESARIN dari 200 → 320
          >
            <div
              onClick={() => onSelect(t.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-2 transition shadow-sm hover:shadow-md ${
                selectedId === t.id
                  ? 'border-green-500'
                  : 'border-transparent'
              }`}
            >
              {t.file_path ? (
                <div className="relative w-full h-64"> {/* 🔥 160 → 256px */}
                  <Image
                    src={t.file_path}
                    alt={t.name}
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-400 rounded">
                  No Preview
                </div>
              )}

              <div className="text-sm mt-2 pb-2 text-center font-medium">
                {t.name}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination {
          bottom: 0px !important;
        }

        .swiper-pagination-bullet {
          width: 9px;
          height: 9px;
          background-color: #6b7280;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background-color: #FF7F11;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #FF7F11;
          width: 34px;
          height: 34px;
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 22px;
        }
      `}</style>
    </div>
  );
}