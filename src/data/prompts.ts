export interface StarterPrompt {
  id: string;
  category: string;
  simpleSentence: string;
  recommendedSense: 'Thị giác' | 'Thính giác' | 'Khứu giác' | 'Xúc giác' | 'Vị giác';
  planet: 'Không gian' | 'Tâm trạng' | 'Hành động' | 'Thời tiết';
  emoji: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const DEFAULT_CATEGORIES = [
  'Tất cả',
  'Của riêng em',
  'Thiên nhiên',
  'Động vật',
  'Gia đình',
  'Trường lớp',
  'Cảm xúc',
  'Đồ vật & Kỷ niệm',
] as const;

export const STARTER_PROMPTS: StarterPrompt[] = [
  // Thiên nhiên & Thời tiết
  {
    id: 'rain-1',
    category: 'Thiên nhiên',
    simpleSentence: 'Trời mưa to.',
    recommendedSense: 'Thính giác',
    planet: 'Thời tiết',
    emoji: '🌧️',
  },
  {
    id: 'sun-1',
    category: 'Thiên nhiên',
    simpleSentence: 'Mặt trời mọc vào buổi sớm.',
    recommendedSense: 'Thị giác',
    planet: 'Không gian',
    emoji: '🌅',
  },
  {
    id: 'wind-1',
    category: 'Thiên nhiên',
    simpleSentence: 'Gió mùa thu thổi nhẹ qua ngọn cây.',
    recommendedSense: 'Xúc giác',
    planet: 'Thời tiết',
    emoji: '🍂',
  },
  {
    id: 'sea-1',
    category: 'Thiên nhiên',
    simpleSentence: 'Bãi biển buổi chiều rất đẹp.',
    recommendedSense: 'Thị giác',
    planet: 'Không gian',
    emoji: '🌊',
  },

  // Động vật
  {
    id: 'cat-1',
    category: 'Động vật',
    simpleSentence: 'Con mèo đang ngủ trên chiếc ghế nhỏ.',
    recommendedSense: 'Xúc giác',
    planet: 'Hành động',
    emoji: '🐱',
  },
  {
    id: 'dog-1',
    category: 'Động vật',
    simpleSentence: 'Chú cún con chạy ra đón em về nhà.',
    recommendedSense: 'Thính giác',
    planet: 'Hành động',
    emoji: '🐶',
  },
  {
    id: 'bird-1',
    category: 'Động vật',
    simpleSentence: 'Đàn chim hót ríu rít trên cành bàng.',
    recommendedSense: 'Thính giác',
    planet: 'Hành động',
    emoji: '🐦',
  },

  // Gia đình & Tình thân
  {
    id: 'kitchen-1',
    category: 'Gia đình',
    simpleSentence: 'Mẹ đang nấu món canh ngon trong bếp.',
    recommendedSense: 'Khứu giác',
    planet: 'Không gian',
    emoji: '🍲',
  },
  {
    id: 'grandma-1',
    category: 'Gia đình',
    simpleSentence: 'Bà ngồi kể chuyện cổ tích cho em nghe.',
    recommendedSense: 'Thính giác',
    planet: 'Tâm trạng',
    emoji: '👵',
  },
  {
    id: 'father-1',
    category: 'Gia đình',
    simpleSentence: 'Bố sửa lại chiếc xe đạp cho em.',
    recommendedSense: 'Xúc giác',
    planet: 'Hành động',
    emoji: '🚲',
  },

  // Trường lớp & Bạn bè
  {
    id: 'school-1',
    category: 'Trường lớp',
    simpleSentence: 'Giờ ra chơi sân trường rất đông vui.',
    recommendedSense: 'Thính giác',
    planet: 'Hành động',
    emoji: '🏫',
  },
  {
    id: 'classroom-1',
    category: 'Trường lớp',
    simpleSentence: 'Cô giáo mỉm cười bước vào lớp học.',
    recommendedSense: 'Thị giác',
    planet: 'Tâm trạng',
    emoji: '👩‍🏫',
  },
  {
    id: 'friends-1',
    category: 'Trường lớp',
    simpleSentence: 'Em cùng bạn bè đọc sách dưới bóng râm.',
    recommendedSense: 'Thị giác',
    planet: 'Không gian',
    emoji: '📚',
  },

  // Cảm xúc & Tâm trạng
  {
    id: 'happy-1',
    category: 'Cảm xúc',
    simpleSentence: 'Em rất vui khi được điểm mười.',
    recommendedSense: 'Xúc giác',
    planet: 'Tâm trạng',
    emoji: '😊',
  },
  {
    id: 'nervous-1',
    category: 'Cảm xúc',
    simpleSentence: 'Em hơi hồi hộp trước khi bước lên sân khấu biểu diễn.',
    recommendedSense: 'Xúc giác',
    planet: 'Tâm trạng',
    emoji: '💓',
  },
  {
    id: 'excited-1',
    category: 'Cảm xúc',
    simpleSentence: 'Cả nhà em hào hứng chuẩn bị đi cắm trại.',
    recommendedSense: 'Thính giác',
    planet: 'Tâm trạng',
    emoji: '⛺',
  },

  // Đồ vật & Kỷ niệm
  {
    id: 'pen-1',
    category: 'Đồ vật & Kỷ niệm',
    simpleSentence: 'Cây bút mực màu tím là món quà sinh nhật của em.',
    recommendedSense: 'Thị giác',
    planet: 'Không gian',
    emoji: '✒️',
  },
  {
    id: 'backpack-1',
    category: 'Đồ vật & Kỷ niệm',
    simpleSentence: 'Chiếc cặp sách đồng hành cùng em mỗi ngày tới trường.',
    recommendedSense: 'Xúc giác',
    planet: 'Không gian',
    emoji: '🎒',
  },
];
