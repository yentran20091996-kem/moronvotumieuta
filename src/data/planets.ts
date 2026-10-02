import { MindMapData, PlanetType } from '../types';

export interface PlanetInfo {
  id: PlanetType;
  name: string;
  tagline: string;
  emoji: string;
  colorScheme: {
    bgLight: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    gradient: string;
  };
  sampleWords: string[];
}

export const PLANETS_INFO: Record<PlanetType, PlanetInfo> = {
  'Không gian': {
    id: 'Không gian',
    name: 'Hành Tinh Không Gian',
    tagline: 'Mở rộng khung cảnh bao la, từ góc học tập đến dải ngân hà',
    emoji: '🪐',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      accent: 'emerald',
      gradient: 'from-emerald-400 to-teal-500',
    },
    sampleWords: ['Bầu trời', 'Khu vườn', 'Góc nhỏ', 'Dải ngân hà', 'Biển cả'],
  },
  'Tâm trạng': {
    id: 'Tâm trạng',
    name: 'Hành Tinh Tâm Trạng',
    tagline: 'Khai phá ngàn cung bậc cảm xúc tinh khôi trong tim',
    emoji: '💖',
    colorScheme: {
      bgLight: 'bg-rose-50',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      accent: 'rose',
      gradient: 'from-rose-400 to-pink-500',
    },
    sampleWords: ['Vui vẻ', 'Buồn bã', 'Ngạc nhiên', 'Hồi hộp', 'Yêu thương'],
  },
  'Hành động': {
    id: 'Hành động',
    name: 'Hành Tinh Hành Động',
    tagline: 'Thổi sức sống vào từng cử chỉ, bước đi, nụ cười',
    emoji: '🚀',
    colorScheme: {
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      accent: 'purple',
      gradient: 'from-purple-400 to-indigo-500',
    },
    sampleWords: ['Chạy', 'Nói chuyện', 'Ăn uống', 'Nhìn ngắm', 'Cười đùa'],
  },
  'Thời tiết': {
    id: 'Thời tiết',
    name: 'Hành Tinh Thời Tiết',
    tagline: 'Hòa mình vào âm vang của mây trời, mưa nắng, gió sương',
    emoji: '🌦️',
    colorScheme: {
      bgLight: 'bg-sky-50',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      accent: 'sky',
      gradient: 'from-sky-400 to-cyan-500',
    },
    sampleWords: ['Mưa rơi', 'Nắng ấm', 'Gió thổi', 'Sương mù', 'Sấm chớp'],
  },
};

export const PRESET_MINDMAPS: Record<string, MindMapData> = {
  'Vui vẻ': {
    rootWord: 'Vui vẻ',
    planet: 'Tâm trạng',
    nearOrbit: [
      {
        word: 'Tươi cười',
        level: 'Hành tinh gần',
        explanation: 'Khuôn mặt rạng rỡ và miệng hé nụ cười',
        sampleSentence: 'Bé tươi cười khoe bức tranh vừa vẽ với ông bà.',
      },
      {
        word: 'Hớn hở',
        level: 'Hành tinh gần',
        explanation: 'Vui vẻ lộ rõ ra từng nét mặt và dáng điệu',
        sampleSentence: 'Cả nhóm hớn hở chuẩn bị cho buổi dã ngoại.',
      },
    ],
    midOrbit: [
      {
        word: 'Hân hoan',
        level: 'Quỹ đạo giữa',
        explanation: 'Niềm vui sướng tràn ngập và rộn rã trong lòng',
        sampleSentence: 'Tiếng cười hân hoan rộn vang khắp sân trường ngày khai giảng.',
      },
      {
        word: 'Phấn chấn',
        level: 'Quỹ đạo giữa',
        explanation: 'Tâm trạng sảng khoái, tràn đầy hứng khởi làm việc tốt',
        sampleSentence: 'Nghe lời khen của cô giáo, tinh thần em phấn chấn hẳn lên.',
      },
    ],
    outerOrbit: [
      {
        word: 'Rạo rực',
        level: 'Hành tinh xa xôi',
        explanation: 'Cảm xúc vui sướng nồng nàn dâng trào khó tả',
        sampleSentence: 'Mùa hè gõ cửa khiến lòng các bạn nhỏ rạo rực bao ước mơ phiêu lưu.',
      },
      {
        word: 'Ngập tràn ánh sáng',
        level: 'Hành tinh xa xôi',
        explanation: 'Hình ảnh ẩn dụ cho niềm hạnh phúc ngời ngợi, ấm áp',
        sampleSentence: 'Ánh mắt mẹ nhìn em như ngập tràn ánh sáng của tình yêu bao la.',
      },
    ],
  },
  'Mưa rơi': {
    rootWord: 'Mưa rơi',
    planet: 'Thời tiết',
    nearOrbit: [
      {
        word: 'Mưa rào',
        level: 'Hành tinh gần',
        explanation: 'Cơn mưa rơi nhanh, nước tuôn ào ạt',
        sampleSentence: 'Một cơn mưa rào bất chợt làm dịu đi cái nóng oi ả.',
      },
      {
        word: 'Tí tách',
        level: 'Hành tinh gần',
        explanation: 'Tiếng hạt mưa rơi từng giọt trên mái ngói',
        sampleSentence: 'Những giọt mưa tí tách rơi như đang gõ nhịp bài ca.',
      },
    ],
    midOrbit: [
      {
        word: 'Xối xả',
        level: 'Quỹ đạo giữa',
        explanation: 'Nước mưa trút xuống mạnh mẽ thành từng dòng liên tiếp',
        sampleSentence: 'Mưa xối xả làm những vòm cây ngả nghiêng đùa giỡn trong gió.',
      },
      {
        word: 'Lất phất',
        level: 'Quỹ đạo giữa',
        explanation: 'Mưa hạt nhỏ li ti, bay nhẹ nhàng trong không trung',
        sampleSentence: 'Mưa xuân lất phất đọng trên chồi non những hạt ngọc lóng lánh.',
      },
    ],
    outerOrbit: [
      {
        word: 'Bản giao hưởng của mây trời',
        level: 'Hành tinh xa xôi',
        explanation: 'Nhân hóa và ẩn dụ cho khúc ca rộn rã của thiên nhiên khi mưa',
        sampleSentence: 'Mưa rơi tấu lên bản giao hưởng rộn ràng đánh thức hạt mầm ngủ quên.',
      },
      {
        word: 'Màn the trắng mỏng',
        level: 'Hành tinh xa xôi',
        explanation: 'Hình ảnh so sánh hạt mưa giăng khắp không gian mờ ảo',
        sampleSentence: 'Cơn mưa phủ lên mặt hồ một màn the trắng mỏng lung linh kỳ ảo.',
      },
    ],
  },
  'Chạy': {
    rootWord: 'Chạy',
    planet: 'Hành động',
    nearOrbit: [
      {
        word: 'Chạy nhanh',
        level: 'Hành tinh gần',
        explanation: 'Di chuyển bước chân thật nhanh về phía trước',
        sampleSentence: 'Bé chạy nhanh về phía vòng tay dang rộng của bố.',
      },
      {
        word: 'Tung tăng',
        level: 'Hành tinh gần',
        explanation: 'Vừa đi vừa chạy nhẹ nhàng đầy vui vẻ',
        sampleSentence: 'Đàn chim non tung tăng nhảy nhót trên thảm cỏ xanh.',
      },
    ],
    midOrbit: [
      {
        word: 'Rảo bước',
        level: 'Quỹ đạo giữa',
        explanation: 'Bước đi nhanh và dứt khoát với mục đích rõ ràng',
        sampleSentence: 'Các bạn nhỏ rảo bước đến lớp để kịp giờ trực nhật.',
      },
      {
        word: 'Thoăn thoắt',
        level: 'Quỹ đạo giữa',
        explanation: 'Động tác chân rất nhanh nhẹn, đều đặn và nhịp nhàng',
        sampleSentence: 'Đôi chân thoăn thoắt vượt qua từng bậc cầu thang rợp bóng cây.',
      },
    ],
    outerOrbit: [
      {
        word: 'Lướt như cơn gió',
        level: 'Hành tinh xa xôi',
        explanation: 'So sánh bước chạy bay bổng, êm ái và tốc độ nhẹ tênh',
        sampleSentence: 'Chú cún nhỏ lướt như cơn gió qua thảm cỏ vàng rực nắng.',
      },
      {
        word: 'Sải cánh tự do',
        level: 'Hành tinh xa xôi',
        explanation: 'Ẩn dụ cho những bước chạy khát khao, ngập tràn tự do',
        sampleSentence: 'Em như được sải cánh tự do giữa bầu trời mênh mông lộng gió.',
      },
    ],
  },
  'Bầu trời': {
    rootWord: 'Bầu trời',
    planet: 'Không gian',
    nearOrbit: [
      {
        word: 'Trong xanh',
        level: 'Hành tinh gần',
        explanation: 'Màu xanh biếc trong trẻo không gợn bóng mây',
        sampleSentence: 'Bầu trời mùa thu trong xanh văn vắt như mặt gương soi.',
      },
      {
        word: 'Rộng lớn',
        level: 'Hành tinh gần',
        explanation: 'Không gian bao la, trải dài đến tận chân trời',
        sampleSentence: 'Bầu trời rộng lớn ôm trọn những cánh diều tuổi thơ.',
      },
    ],
    midOrbit: [
      {
        word: 'Mênh mông',
        level: 'Quỹ đạo giữa',
        explanation: 'Rộng đến mức dường như không thấy bến bờ giới hạn',
        sampleSentence: 'Giữa khoảng trời mênh mông, đàn chim én ríu rít tìm đường về tổ.',
      },
      {
        word: 'Khoáng đạt',
        level: 'Quỹ đạo giữa',
        explanation: 'Không gian thoáng đãng, mang lại cảm giác nhẹ nhõm, bao la',
        sampleSentence: 'Khí trời buổi sớm khoáng đạt khiến lòng người thêm sảng khoái.',
      },
    ],
    outerOrbit: [
      {
        word: 'Tấm thảm nhung huyền bí',
        level: 'Hành tinh xa xôi',
        explanation: 'Ẩn dụ bầu trời đêm đính ngàn vì sao như đá quý',
        sampleSentence: 'Đêm nay, vũ trụ trải ra tấm thảm nhung đen tuyền lấp lánh ngọc ngà.',
      },
      {
        word: 'Vòm ngọc bích',
        level: 'Hành tinh xa xôi',
        explanation: 'So sánh trời xanh ngọc với loại đá quý trong veo tuyệt mỹ',
        sampleSentence: 'Vòm ngọc bích cao vút chở che cho bao ước mơ non nớt bay cao.',
      },
    ],
  },
};
