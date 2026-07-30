/* ============================================
   郑圆玲的工作台 - 业务逻辑
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     1. CONFIG - 全局配置
     ============================================ */
  const CONFIG = {
    STORAGE_PREFIX: 'zhyl_',
    COUNTDOWN_TARGET: '2026-12-19', // 倒计时目标日
    COUNTDOWN_LABEL: '目标日',
    CAT_NAME: '团团',
    CAT_FEED_DAILY_LIMIT: 5, // 每日喂食上限

    // 小尺寸橘猫头像（用于卡片标题图标，28x28 视图）
    CAT_SVG: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="cat-svg" width="28" height="28">
  <!-- 左耳 -->
  <path d="M 14 22 L 10 6 L 26 18 Z" fill="#F0AC5C" stroke="#B8763A" stroke-width="1.5"/>
  <path d="M 16 19 L 14 11 L 22 16 Z" fill="#FFB6B6"/>
  <!-- 右耳 -->
  <path d="M 50 22 L 54 6 L 38 18 Z" fill="#F0AC5C" stroke="#B8763A" stroke-width="1.5"/>
  <path d="M 48 19 L 50 11 L 42 16 Z" fill="#FFB6B6"/>
  <!-- 头 -->
  <circle cx="32" cy="34" r="20" fill="#F0AC5C" stroke="#B8763A" stroke-width="1.5"/>
  <!-- 白色脸 -->
  <ellipse cx="32" cy="44" rx="10" ry="7" fill="#FFFFFF"/>
  <!-- 条纹 -->
  <path d="M 18 26 Q 32 22 46 26" stroke="#D89048" stroke-width="1.5" fill="none" opacity="0.5"/>
  <!-- 眼睛 -->
  <ellipse cx="25" cy="34" rx="2.5" ry="4" fill="#4A8B3A"/>
  <ellipse cx="39" cy="34" rx="2.5" ry="4" fill="#4A8B3A"/>
  <ellipse cx="25" cy="33" rx="1" ry="2" fill="#000"/>
  <ellipse cx="39" cy="33" rx="1" ry="2" fill="#000"/>
  <!-- 鼻子 -->
  <path d="M 29 41 L 35 41 L 32 44 Z" fill="#FF9999"/>
  <!-- 嘴 -->
  <path d="M 32 44 Q 28 47 26 46" stroke="#5C3317" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M 32 44 Q 36 47 38 46" stroke="#5C3317" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`,

    // 团团养成阶段（5 阶段，按累计喂食次数 totalFeed 升级）
    CAT_STAGES: [
      { stage: 0, min: 0,   max: 30,       emoji: '🍼', name: '幼猫',   desc: '团团刚出生，软软糯糯的小奶猫~' },
      { stage: 1, min: 31,  max: 90,       emoji: '🐱', name: '小猫',   desc: '团团开始活泼好动了！' },
      { stage: 2, min: 91,  max: 370,      emoji: '😼', name: '青年猫', desc: '团团精力旺盛，虎斑清晰~' },
      { stage: 3, min: 371, max: 730,      emoji: '😺', name: '中年猫', desc: '团团沉稳温柔，毛色饱满~' },
      { stage: 4, min: 731, max: Infinity, emoji: '😻', name: '成年猫', desc: '团团圆润华丽，气场全开！' }
    ],

    // 6 阶段猫咪 SVG（每阶段一个独立 SVG，体型/毛色/表情随成长变化）
    CAT_STAGE_SVGS: [
      // ===== 阶段0：幼猫（奶橘色、大头小身、眯眼〰、短耳无虎斑） =====
      `<svg viewBox="0 0 200 200" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="150" rx="36" ry="34" fill="#FFD9B0" stroke="#C98860" stroke-width="2"/>
        <ellipse cx="100" cy="158" rx="18" ry="24" fill="#FFF8EE" stroke="#E8D0B8" stroke-width="0.8"/>
        <ellipse cx="86" cy="182" rx="10" ry="6" fill="#FFF8EE" stroke="#C98860" stroke-width="1.5"/>
        <ellipse cx="114" cy="182" rx="10" ry="6" fill="#FFF8EE" stroke="#C98860" stroke-width="1.5"/>
        <circle cx="100" cy="85" r="48" fill="#FFD9B0" stroke="#C98860" stroke-width="2"/>
        <path d="M 64 60 L 58 36 L 84 52 Z" fill="#FFD9B0" stroke="#C98860" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 68 56 L 64 42 L 80 50 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 136 60 L 142 36 L 116 52 Z" fill="#FFD9B0" stroke="#C98860" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 132 56 L 136 42 L 120 50 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 78 88 Q 85 84 92 88" stroke="#8B5A2B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 108 88 Q 115 84 122 88" stroke="#8B5A2B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="66" cy="100" rx="7" ry="4" fill="#FFC4D4" opacity="0.5"/>
        <ellipse cx="134" cy="100" rx="7" ry="4" fill="#FFC4D4" opacity="0.5"/>
        <path d="M 94 98 L 106 98 L 100 104 Z" fill="#FF9AA8"/>
        <path d="M 100 104 Q 95 108 91 106" stroke="#8B5A2B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M 100 104 Q 105 108 109 106" stroke="#8B5A2B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>`,

      // ===== 阶段1：小猫（浅橘、大圆眼好奇、短尾、少量条纹） =====
      `<svg viewBox="0 0 200 200" width="170" height="170" xmlns="http://www.w3.org/2000/svg">
        <path d="M 140 140 Q 162 135 160 110 Q 159 100 152 104 Q 152 122 138 134 Z" fill="#F5C088" stroke="#B07840" stroke-width="2"/>
        <ellipse cx="100" cy="150" rx="46" ry="42" fill="#F5C088" stroke="#B07840" stroke-width="2"/>
        <ellipse cx="100" cy="158" rx="24" ry="32" fill="#FFF8EE" stroke="#E8D0B8" stroke-width="0.8"/>
        <path d="M 62 138 Q 66 158 62 178" stroke="#D49850" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 138 138 Q 134 158 138 178" stroke="#D49850" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <ellipse cx="80" cy="188" rx="12" ry="7" fill="#FFF8EE" stroke="#B07840" stroke-width="1.5"/>
        <ellipse cx="120" cy="188" rx="12" ry="7" fill="#FFF8EE" stroke="#B07840" stroke-width="1.5"/>
        <circle cx="100" cy="80" r="42" fill="#F5C088" stroke="#B07840" stroke-width="2"/>
        <path d="M 68 56 L 62 30 L 86 48 Z" fill="#F5C088" stroke="#B07840" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 72 52 L 68 38 L 82 46 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 132 56 L 138 30 L 114 48 Z" fill="#F5C088" stroke="#B07840" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 128 52 L 132 38 L 118 46 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 76 58 Q 82 46 88 60" stroke="#D49850" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 112 60 Q 118 46 124 58" stroke="#D49850" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.5"/>
        <ellipse cx="80" cy="80" rx="7" ry="9" fill="#2A2A2A"/>
        <ellipse cx="120" cy="80" rx="7" ry="9" fill="#2A2A2A"/>
        <circle cx="82" cy="77" r="2.5" fill="#FFF"/>
        <circle cx="122" cy="77" r="2.5" fill="#FFF"/>
        <ellipse cx="64" cy="94" rx="7" ry="4" fill="#FFC4D4" opacity="0.45"/>
        <ellipse cx="136" cy="94" rx="7" ry="4" fill="#FFC4D4" opacity="0.45"/>
        <path d="M 94 92 L 106 92 L 100 98 Z" fill="#FF9AA8"/>
        <path d="M 100 98 L 100 102" stroke="#8B5A2B" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M 100 102 Q 95 106 91 104" stroke="#8B5A2B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M 100 102 Q 105 106 109 104" stroke="#8B5A2B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>`,

      // ===== 阶段2：青年猫（修长、明亮绿眼、清晰虎斑、竖耳） =====
      `<svg viewBox="0 0 200 220" width="170" height="187" xmlns="http://www.w3.org/2000/svg">
        <path d="M 145 145 Q 178 140 175 105 Q 174 92 165 96 Q 167 118 147 138 Z" fill="#E89A4F" stroke="#8B5A2B" stroke-width="2"/>
        <ellipse cx="100" cy="160" rx="50" ry="48" fill="#E89A4F" stroke="#8B5A2B" stroke-width="2"/>
        <ellipse cx="100" cy="168" rx="26" ry="36" fill="#FFF8EE" stroke="#E8D0B8" stroke-width="0.8"/>
        <path d="M 56 145 Q 60 168 56 192" stroke="#B8702A" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 144 145 Q 140 168 144 192" stroke="#B8702A" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 70 138 Q 74 160 70 182" stroke="#B8702A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <path d="M 130 138 Q 126 160 130 182" stroke="#B8702A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <ellipse cx="78" cy="204" rx="13" ry="8" fill="#FFF8EE" stroke="#8B5A2B" stroke-width="1.5"/>
        <ellipse cx="122" cy="204" rx="13" ry="8" fill="#FFF8EE" stroke="#8B5A2B" stroke-width="1.5"/>
        <ellipse cx="100" cy="80" r="48" fill="#E89A4F" stroke="#8B5A2B" stroke-width="2"/>
        <path d="M 60 52 L 52 22 L 82 42 Z" fill="#E89A4F" stroke="#8B5A2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 64 48 L 58 32 L 78 40 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 140 52 L 148 22 L 118 42 Z" fill="#E89A4F" stroke="#8B5A2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 136 48 L 142 32 L 122 40 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 72 54 Q 78 38 84 56" stroke="#B8702A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 92 48 Q 100 34 108 48" stroke="#B8702A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 116 56 Q 122 38 128 54" stroke="#B8702A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
        <ellipse cx="78" cy="80" rx="9" ry="11" fill="#FFF" stroke="#8B5A2B" stroke-width="1"/>
        <ellipse cx="122" cy="80" rx="9" ry="11" fill="#FFF" stroke="#8B5A2B" stroke-width="1"/>
        <ellipse cx="78" cy="81" rx="6" ry="9" fill="#5CB338"/>
        <ellipse cx="122" cy="81" rx="6" ry="9" fill="#5CB338"/>
        <ellipse cx="78" cy="82" rx="3" ry="7" fill="#1A1A1A"/>
        <ellipse cx="122" cy="82" rx="3" ry="7" fill="#1A1A1A"/>
        <circle cx="80" cy="77" r="2.5" fill="#FFF"/>
        <circle cx="124" cy="77" r="2.5" fill="#FFF"/>
        <ellipse cx="60" cy="96" rx="8" ry="4.5" fill="#FFC4D4" opacity="0.4"/>
        <ellipse cx="140" cy="96" rx="8" ry="4.5" fill="#FFC4D4" opacity="0.4"/>
        <path d="M 94 94 L 106 94 L 100 101 Z" fill="#FF9AA8"/>
        <path d="M 100 101 L 100 105" stroke="#5C3317" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 100 105 Q 94 110 88 105" stroke="#5C3317" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M 100 105 Q 106 110 112 105" stroke="#5C3317" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <line x1="70" y1="100" x2="44" y2="94" stroke="#5C3317" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
        <line x1="70" y1="105" x2="42" y2="106" stroke="#5C3317" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
        <line x1="130" y1="100" x2="156" y2="94" stroke="#5C3317" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
        <line x1="130" y1="105" x2="158" y2="106" stroke="#5C3317" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
      </svg>`,

      // ===== 阶段3：中年猫（匀称、温和黄绿眼、深橘饱满虎斑） =====
      `<svg viewBox="0 0 200 220" width="175" height="192" xmlns="http://www.w3.org/2000/svg">
        <path d="M 148 148 Q 180 143 177 108 Q 176 95 167 99 Q 169 120 149 140 Z" fill="#D8853A" stroke="#7A4A1E" stroke-width="2"/>
        <ellipse cx="100" cy="162" rx="54" ry="50" fill="#D8853A" stroke="#7A4A1E" stroke-width="2"/>
        <ellipse cx="100" cy="170" rx="28" ry="38" fill="#FFF8EE" stroke="#E8D0B8" stroke-width="0.8"/>
        <path d="M 52 146 Q 56 170 52 194" stroke="#A86028" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.65"/>
        <path d="M 148 146 Q 144 170 148 194" stroke="#A86028" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.65"/>
        <path d="M 68 140 Q 72 162 68 184" stroke="#A86028" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 132 140 Q 128 162 132 184" stroke="#A86028" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.5"/>
        <ellipse cx="76" cy="206" rx="14" ry="8" fill="#FFF8EE" stroke="#7A4A1E" stroke-width="1.5"/>
        <ellipse cx="124" cy="206" rx="14" ry="8" fill="#FFF8EE" stroke="#7A4A1E" stroke-width="1.5"/>
        <circle cx="100" cy="82" r="50" fill="#D8853A" stroke="#7A4A1E" stroke-width="2"/>
        <path d="M 58 54 L 50 24 L 82 44 Z" fill="#D8853A" stroke="#7A4A1E" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 62 50 L 56 34 L 78 42 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 142 54 L 150 24 L 118 44 Z" fill="#D8853A" stroke="#7A4A1E" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 138 50 L 144 34 L 122 42 Z" fill="#FFC4D4" opacity="0.8"/>
        <path d="M 70 56 Q 76 40 82 58" stroke="#A86028" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
        <path d="M 90 50 Q 100 36 110 50" stroke="#A86028" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
        <path d="M 118 58 Q 124 40 130 56" stroke="#A86028" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
        <ellipse cx="78" cy="82" rx="9" ry="11" fill="#FFF" stroke="#7A4A1E" stroke-width="1"/>
        <ellipse cx="122" cy="82" rx="9" ry="11" fill="#FFF" stroke="#7A4A1E" stroke-width="1"/>
        <ellipse cx="78" cy="83" rx="6" ry="9" fill="#9ACD32"/>
        <ellipse cx="122" cy="83" rx="6" ry="9" fill="#9ACD32"/>
        <ellipse cx="78" cy="84" rx="3.5" ry="7.5" fill="#1A1A1A"/>
        <ellipse cx="122" cy="84" rx="3.5" ry="7.5" fill="#1A1A1A"/>
        <circle cx="80" cy="79" r="2.8" fill="#FFF"/>
        <circle cx="124" cy="79" r="2.8" fill="#FFF"/>
        <ellipse cx="58" cy="98" rx="9" ry="5" fill="#FFC4D4" opacity="0.4"/>
        <ellipse cx="142" cy="98" rx="9" ry="5" fill="#FFC4D4" opacity="0.4"/>
        <path d="M 94 96 L 106 96 L 100 103 Z" fill="#FF9AA8"/>
        <path d="M 100 103 L 100 107" stroke="#5C3317" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 100 107 Q 93 112 87 107" stroke="#5C3317" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M 100 107 Q 107 112 113 107" stroke="#5C3317" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <line x1="68" y1="102" x2="40" y2="96" stroke="#5C3317" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>
        <line x1="68" y1="107" x2="38" y2="108" stroke="#5C3317" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>
        <line x1="132" y1="102" x2="160" y2="96" stroke="#5C3317" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>
        <line x1="132" y1="107" x2="162" y2="108" stroke="#5C3317" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>
      </svg>`,

      // ===== 阶段4：成年猫（圆润丰满、金色眼、华丽浓橘、自信微笑） =====
      `<svg viewBox="0 0 200 220" width="180" height="198" xmlns="http://www.w3.org/2000/svg">
        <path d="M 150 152 Q 183 147 180 110 Q 179 96 169 100 Q 171 122 150 144 Z" fill="#D17A2B" stroke="#6B3A12" stroke-width="2"/>
        <ellipse cx="100" cy="165" rx="58" ry="52" fill="#D17A2B" stroke="#6B3A12" stroke-width="2"/>
        <ellipse cx="100" cy="173" rx="30" ry="40" fill="#FFF8EE" stroke="#E8D0B8" stroke-width="0.8"/>
        <path d="M 50 148 Q 54 174 50 198" stroke="#9E5818" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
        <path d="M 150 148 Q 146 174 150 198" stroke="#9E5818" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
        <path d="M 66 142 Q 70 166 66 188" stroke="#9E5818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>
        <path d="M 134 142 Q 130 166 134 188" stroke="#9E5818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>
        <ellipse cx="74" cy="210" rx="15" ry="9" fill="#FFF8EE" stroke="#6B3A12" stroke-width="1.5"/>
        <ellipse cx="126" cy="210" rx="15" ry="9" fill="#FFF8EE" stroke="#6B3A12" stroke-width="1.5"/>
        <circle cx="74" cy="209" r="2.2" fill="#FFB6C1"/>
        <circle cx="80" cy="207" r="1.8" fill="#FFB6C1"/>
        <circle cx="85" cy="209" r="1.8" fill="#FFB6C1"/>
        <circle cx="120" cy="209" r="2.2" fill="#FFB6C1"/>
        <circle cx="126" cy="207" r="1.8" fill="#FFB6C1"/>
        <circle cx="131" cy="209" r="1.8" fill="#FFB6C1"/>
        <circle cx="100" cy="84" r="52" fill="#D17A2B" stroke="#6B3A12" stroke-width="2"/>
        <path d="M 56 56 L 48 24 L 80 46 Z" fill="#D17A2B" stroke="#6B3A12" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 60 52 L 54 34 L 76 44 Z" fill="#FFC4D4" opacity="0.85"/>
        <path d="M 144 56 L 152 24 L 120 46 Z" fill="#D17A2B" stroke="#6B3A12" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 140 52 L 146 34 L 124 44 Z" fill="#FFC4D4" opacity="0.85"/>
        <path d="M 68 58 Q 74 40 80 60" stroke="#9E5818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
        <path d="M 88 52 Q 100 36 112 52" stroke="#9E5818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
        <path d="M 120 60 Q 126 40 132 58" stroke="#9E5818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
        <ellipse cx="78" cy="84" rx="10" ry="12" fill="#FFF" stroke="#6B3A12" stroke-width="1"/>
        <ellipse cx="122" cy="84" rx="10" ry="12" fill="#FFF" stroke="#6B3A12" stroke-width="1"/>
        <ellipse cx="78" cy="85" rx="7" ry="10" fill="#D4A017"/>
        <ellipse cx="122" cy="85" rx="7" ry="10" fill="#D4A017"/>
        <ellipse cx="78" cy="86" rx="3.5" ry="8" fill="#1A1A1A"/>
        <ellipse cx="122" cy="86" rx="3.5" ry="8" fill="#1A1A1A"/>
        <circle cx="80" cy="81" r="3" fill="#FFF"/>
        <circle cx="124" cy="81" r="3" fill="#FFF"/>
        <circle cx="76" cy="88" r="1.2" fill="#FFF" opacity="0.6"/>
        <circle cx="120" cy="88" r="1.2" fill="#FFF" opacity="0.6"/>
        <ellipse cx="56" cy="100" rx="9" ry="5" fill="#FFC4D4" opacity="0.45"/>
        <ellipse cx="144" cy="100" rx="9" ry="5" fill="#FFC4D4" opacity="0.45"/>
        <path d="M 94 98 L 106 98 L 100 105 Z" fill="#FF8FA8" stroke="#E07090" stroke-width="0.5"/>
        <path d="M 100 105 L 100 109" stroke="#5C3317" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 100 109 Q 93 115 87 109" stroke="#5C3317" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M 100 109 Q 107 115 113 109" stroke="#5C3317" stroke-width="2" fill="none" stroke-linecap="round"/>
        <line x1="68" y1="104" x2="38" y2="98" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
        <line x1="68" y1="109" x2="36" y2="110" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
        <line x1="68" y1="114" x2="38" y2="122" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
        <line x1="132" y1="104" x2="162" y2="98" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
        <line x1="132" y1="109" x2="164" y2="110" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
        <line x1="132" y1="114" x2="162" y2="122" stroke="#5C3317" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      </svg>`
    ],

    // 默认今日任务
    DEFAULT_TASKS: [
      { name: '早起打卡', emoji: '🌄' },
      { name: '瑜伽',     emoji: '🧘‍♀️' },
      { name: '背单词',   emoji: '📝' },
      { name: '学习',     emoji: '📖' },
      { name: '养生护理', emoji: '🪷' }
    ],

    // 默认瑜伽动作
    // 默认瑜伽动作（养护瑜伽 · 改善脖子前倾 · 面墙蹲）
    DEFAULT_YOGA_POSES: [
      { name: '养护瑜伽',         emoji: '🧘‍♀️' },
      { name: '改善脖子前倾',     emoji: '🙆‍♀️' },
      { name: '面墙蹲',           emoji: '🧱' }
    ],

    // 默认养生任务
    DEFAULT_HEALTH_TASKS: [
      { name: '泡脚',     emoji: '🛁' },
      { name: '喝五红粉', emoji: '🫘' },
      { name: '喝五黑粉', emoji: '☕' }
    ],

    // 默认学习任务（考研科目）
    DEFAULT_STUDY_TASKS: [
      { name: '333 中国教育史',   emoji: '📚' },
      { name: '333 外国教育史',   emoji: '🌍' },
      { name: '333 教育心理学',   emoji: '🧠' },
      { name: '333 教育学',       emoji: '📖' },
      { name: '891 阅读与写作',   emoji: '✍️' },
      { name: '101 政治',         emoji: '🏛️' },
      { name: '204 英语二',       emoji: '🔤' }
    ],

    // 10 句励志语录
    QUOTES: [
      { en: 'Dream it. Wish it. Do it.', cn: '梦想它，期望它，实现它。' },
      { en: 'Every day is a fresh start.', cn: '每一天都是新的开始。' },
      { en: 'Believe you can and you will.', cn: '相信你能，你就能。' },
      { en: 'Small steps every day.', cn: '每天一小步，成长一大步。' },
      { en: 'Be gentle, be patient.', cn: '温柔半两，从容一生。' },
      { en: 'You are your only limit.', cn: '你唯一的极限就是你自己。' },
      { en: 'Bloom where you are planted.', cn: '在哪里扎根，就在哪里绽放。' },
      { en: 'Stay hungry, stay humble.', cn: '保持饥渴，保持谦卑。' },
      { en: 'Done is better than perfect.', cn: '完成比完美更重要。' },
      { en: 'Be the energy you want to attract.', cn: '成为你想吸引的那种能量。' }
    ],

    // 记账分类
    MONEY_EXPENSE_CATEGORIES: [
      { name: '餐饮', icon: '🍜' },
      { name: '交通', icon: '🚌' },
      { name: '购物', icon: '🛍️' },
      { name: '娱乐', icon: '🎮' },
      { name: '学习', icon: '📚' },
      { name: '医疗', icon: '💊' },
      { name: '居家', icon: '🏠' },
      { name: '其他', icon: '📦' }
    ],
    MONEY_INCOME_CATEGORIES: [
      { name: '工资', icon: '💼' },
      { name: '奖金', icon: '🏆' },
      { name: '红包', icon: '🧧' },
      { name: '退款', icon: '↩️' }
    ],

    // 单词列表
    STUDY_WORDS: [
      { word: 'particular',  pos: 'adj.',  pron: '/pəˈtɪkjələr/', meaning: '特别的' },
      { word: 'technique',   pos: 'n.',    pron: '/tekˈniːk/',     meaning: '技术' },
      { word: 'obtain',      pos: 'v.',    pron: '/əbˈteɪn/',      meaning: '获得' },
      { word: 'opinion',     pos: 'n.',    pron: '/əˈpɪnjən/',     meaning: '观点' },
      { word: 'neglect',     pos: 'v.',    pron: '/nɪˈɡlekt/',     meaning: '忽视' },
      { word: 'acquire',     pos: 'v.',    pron: '/əˈkwaɪər/',     meaning: '获得' },
      { word: 'establish',   pos: 'v.',    pron: '/ɪˈstæblɪʃ/',    meaning: '建立' },
      { word: 'comprehend',  pos: 'v.',    pron: '/ˌkɑːmprɪˈhend/',meaning: '理解' }
    ],
    STUDY_TABS: ['词汇', '口语', '影子跟读']
  };

  /* ============================================
     2. Utils - 工具函数
     ============================================ */
  const Utils = {
    pad2(n) { return String(n).padStart(2, '0'); },

    /** 返回 YYYY-MM-DD */
    todayKey() {
      const d = new Date();
      return `${d.getFullYear()}-${Utils.pad2(d.getMonth() + 1)}-${Utils.pad2(d.getDate())}`;
    },

    /** 友好日期显示 */
    formatDate(d) {
      const dt = d || new Date();
      const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
      return `${dt.getFullYear()}/${Utils.pad2(dt.getMonth()+1)}/${Utils.pad2(dt.getDate())} ${weekdays[dt.getDay()]}`;
    },

    /** 计算两日期相差天数 */
    daysBetween(date1, date2) {
      const ms = new Date(date2).setHours(0,0,0,0) - new Date(date1).setHours(0,0,0,0);
      return Math.round(ms / 86400000);
    },

    /** 添加天数 */
    addDays(dateStr, days) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return `${d.getFullYear()}-${Utils.pad2(d.getMonth()+1)}-${Utils.pad2(d.getDate())}`;
    },

    /** HTML 转义 */
    esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    /** 安全 JSON.parse */
    safeParse(s, fallback) {
      try { return JSON.parse(s); } catch (e) { return fallback; }
    },

    /** 数字补零 */
    pad(n, len) { return String(n).padStart(len || 2, '0'); },

    /** 随机整数 */
    randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  };

  /* ============================================
     3. Store - 数据层 (localStorage)
     ============================================ */
  const Store = {
    _k(key) { return CONFIG.STORAGE_PREFIX + key; },

    get(key, defaultValue) {
      try {
        const v = localStorage.getItem(Store._k(key));
        return v == null ? defaultValue : Utils.safeParse(v, defaultValue);
      } catch (e) {
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(Store._k(key), JSON.stringify(value));
      } catch (e) {
        console.warn('localStorage 写入失败', e);
      }
    },

    remove(key) {
      try { localStorage.removeItem(Store._k(key)); } catch (e) {}
    },

    // ========== 每日重置 ==========
    checkDailyReset() {
      const today = Utils.todayKey();
      const stored = Store.get('today', null);
      if (stored === today) return;

      // 重置前先把"昨天"的学习分钟归档到历史（用于本周统计）
      Store.saveStudyHistory();

      // 重置所有"今日"相关数据
      Store.set('today', today);

      // 猫咪今日喂食
      const cat = Store.get('cat_data', { totalFeed: 0, todayFeed: 0, todayFeedDate: today, totalTasks: 0, fishCount: 0 });
      cat.todayFeed = 0;
      cat.todayFeedDate = today;
      Store.set('cat_data', cat);

      // 学习今日数据
      const study = Store.get('study_log', { todayMinutes: 0, todayMinutesDate: today, todayWords: 0, todayDate: today, totalWords: 0, totalMinutes: 0, favedWords: [] });
      study.todayMinutes = 0;
      study.todayWords = 0;
      study.todayMinutesDate = today;
      study.todayDate = today;
      Store.set('study_log', study);

      // 瑜伽今日
      const yoga = Store.get('yoga_log', { todayCompleted: [], todayDate: today, totalPoses: 0, trainingDays: [], customPoses: [], todayMinutes: 0, totalMinutes: 0 });
      yoga.todayCompleted = [];
      yoga.todayMinutes = 0;
      yoga.todayDate = today;
      Store.set('yoga_log', yoga);

      // 养生今日
      const health = Store.get('health_log', { todayCompleted: [], todayDate: today, customTasks: [] });
      health.todayCompleted = [];
      health.todayDate = today;
      Store.set('health_log', health);

      // 扇贝打卡今日
      Store.set('shellbean_today', null);

      // 每日一句：每日随机选一个
      Store.set('daily_quote', { index: Utils.randInt(0, CONFIG.QUOTES.length - 1), date: today });

      // 任务打卡清空（旧 key 留着即可，新一天自动用新 key）
    },

    // ========== 今日任务 ==========
    getCustomTasks() {
      return Store.get('custom_tasks', []);
    },

    addCustomTask(task) {
      const list = Store.getCustomTasks();
      list.push(task);
      Store.set('custom_tasks', list);
    },

    removeCustomTask(idx) {
      const list = Store.getCustomTasks();
      list.splice(idx, 1);
      Store.set('custom_tasks', list);
    },

    getTodayTasks() {
      const customs = Store.getCustomTasks();
      const defaults = CONFIG.DEFAULT_TASKS.map(t => ({ ...t, isCustom: false }));
      const customsFmt = customs.map(t => {
        // 兼容字符串或对象
        if (typeof t === 'string') return { name: t, emoji: '✨', isCustom: true };
        return { ...t, isCustom: true };
      });
      return [...defaults, ...customsFmt];
    },

    getTodayCheckedMap() {
      return Store.get(`tasks_${Utils.todayKey()}`, {});
    },

    setTodayCheckedMap(map) {
      Store.set(`tasks_${Utils.todayKey()}`, map);
    },

    isTaskChecked(name) {
      const map = Store.getTodayCheckedMap();
      return !!map[name];
    },

    /** 勾选任务，返回 { wasCompleted, newCompleted } */
    toggleTask(name) {
      const map = Store.getTodayCheckedMap();
      const wasChecked = !!map[name];
      map[name] = !wasChecked;
      Store.setTodayCheckedMap(map);
      return { wasChecked, newChecked: !wasChecked };
    },

    getTodayCompletedCount() {
      const map = Store.getTodayCheckedMap();
      return Object.values(map).filter(Boolean).length;
    },

    // ========== 扇贝打卡 ==========
    getShellbeanCount() {
      return Store.get('shellbean_count', 0);
    },

    getShellbeanHistory() {
      return Store.get('shellbean_history', []);
    },

    isShellbeanCheckedToday() {
      return Store.get('shellbean_today', null) === Utils.todayKey();
    },

    doShellbeanCheckin() {
      if (Store.isShellbeanCheckedToday()) return false;
      const today = Utils.todayKey();
      Store.set('shellbean_today', today);
      const history = Store.getShellbeanHistory();
      if (!history.includes(today)) {
        history.push(today);
        Store.set('shellbean_history', history);
        Store.set('shellbean_count', history.length);
      }
      return true;
    },

    uncheckShellbeanToday() {
      const today = Utils.todayKey();
      Store.set('shellbean_today', null);
      const history = Store.getShellbeanHistory().filter(d => d !== today);
      Store.set('shellbean_history', history);
      Store.set('shellbean_count', history.length);
    },

    // ========== 倒计时 ==========
    getCountdownDays() {
      const target = new Date(CONFIG.COUNTDOWN_TARGET + 'T00:00:00');
      const now = new Date();
      now.setHours(0,0,0,0);
      const diff = Math.round((target - now) / 86400000);
      return diff;
    },

    getCountdownProgress() {
      // 从"30 天前"开始算进度（参考图中 142/10000 这种长度的进度条）
      // 这里我们按总生命周期：2026-01-01 ~ 2026-12-19
      const start = new Date('2026-01-01T00:00:00');
      const target = new Date(CONFIG.COUNTDOWN_TARGET + 'T00:00:00');
      const now = new Date();
      now.setHours(0,0,0,0);
      const total = target - start;
      const elapsed = now - start;
      return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
    },

    // ========== 每日一句 ==========
    getQuote() {
      const q = Store.get('daily_quote', { index: 0, date: Utils.todayKey() });
      return CONFIG.QUOTES[q.index] || CONFIG.QUOTES[0];
    },

    shuffleQuote() {
      const cur = Store.get('daily_quote', { index: 0 });
      let next = Utils.randInt(0, CONFIG.QUOTES.length - 1);
      // 避免连续两次相同
      if (CONFIG.QUOTES.length > 1) {
        while (next === cur.index) {
          next = Utils.randInt(0, CONFIG.QUOTES.length - 1);
        }
      }
      Store.set('daily_quote', { index: next, date: Utils.todayKey() });
      return CONFIG.QUOTES[next];
    },

    // ========== 学习 ==========
    getStudyLog() {
      return Store.get('study_log', { todayMinutes: 0, todayMinutesDate: Utils.todayKey(), todayWords: 0, totalWords: 0, totalMinutes: 0, favedWords: [] });
    },

    addStudyMinutes(min) {
      const log = Store.getStudyLog();
      log.todayMinutes = (log.todayMinutes || 0) + min;
      log.totalMinutes = (log.totalMinutes || 0) + min;
      log.todayMinutesDate = Utils.todayKey();
      Store.set('study_log', log);
    },

    /** 计算本周（周一到周日）累计学习分钟（含今天） */
    getWeekStudyMinutes() {
      const hist = Store.get('study_history', {});
      const today = new Date();
      // 周日为 0，周一为 1。我们按"周一开始"：距离本周一的天数
      const day = today.getDay();
      const offsetToMonday = (day === 0 ? 6 : day - 1);
      let total = 0;
      for (let i = 0; i <= offsetToMonday; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${Utils.pad2(d.getMonth()+1)}-${Utils.pad2(d.getDate())}`;
        total += (hist[key] || 0);
      }
      // 加上今天（如果今天尚未保存到 history）
      const todayKey = Utils.todayKey();
      const log = Store.getStudyLog();
      if (log.todayMinutesDate === todayKey) {
        // 今天已经加进 week 计算中（hist[todayKey] 不一定存在）
        // 因为 addStudyMinutes 只更新 todayMinutes，没写 history；为避免双重计算，剔除一次
        // 这里我们改为：today 直接来自 log.todayMinutes
        // 如果今天已经在 hist 里（即 daily reset 把它搬过去了），需要扣除
        // 简化：今天用 log.todayMinutes，而 history 中今天的值替换为 0
        // 实际上我们没写 history[todayKey]，所以直接用 log.todayMinutes
        // 但循环里我们用了 hist[todayKey]，这里要替换掉
        // 做法：在循环外单独加上今天
        total -= (hist[todayKey] || 0);
        total += (log.todayMinutes || 0);
      }
      return total;
    },

    /** 每日重置前保存昨天的学习分钟（用于周/月统计） */
    saveStudyHistory() {
      const log = Store.getStudyLog();
      if (!log.todayMinutesDate || log.todayMinutes === undefined) return;
      const hist = Store.get('study_history', {});
      // 保存的是"日期对应的那天学习的分钟"（即今天的 todayMinutes）
      hist[log.todayMinutesDate] = (hist[log.todayMinutesDate] || 0) + (log.todayMinutes || 0);
      Store.set('study_history', hist);
    },

    toggleFavWord(word) {
      const log = Store.getStudyLog();
      log.favedWords = log.favedWords || [];
      const today = Utils.todayKey();
      log.todayDate = today;

      const idx = log.favedWords.indexOf(word);
      if (idx >= 0) {
        log.favedWords.splice(idx, 1);
        log.todayWords = Math.max(0, (log.todayWords || 0) - 1);
        log.totalWords = Math.max(0, (log.totalWords || 0) - 1);
      } else {
        log.favedWords.push(word);
        log.todayWords = (log.todayWords || 0) + 1;
        log.totalWords = (log.totalWords || 0) + 1;
      }
      Store.set('study_log', log);
      return idx < 0; // true 表示已收藏
    },

    // ========== 学习任务（考研科目打卡） ==========
    getStudyCustomTasks() {
      return Store.get('study_custom_tasks', []);
    },

    addStudyCustomTask(task) {
      const list = Store.getStudyCustomTasks();
      list.push(task);
      Store.set('study_custom_tasks', list);
    },

    removeStudyCustomTask(idx) {
      const list = Store.getStudyCustomTasks();
      list.splice(idx, 1);
      Store.set('study_custom_tasks', list);
    },

    getStudyTasks() {
      const customs = Store.getStudyCustomTasks();
      const defaults = CONFIG.DEFAULT_STUDY_TASKS.map(t => ({ ...t, isCustom: false }));
      const customsFmt = customs.map(t => {
        if (typeof t === 'string') return { name: t, emoji: '✨', isCustom: true };
        return { ...t, isCustom: true };
      });
      return [...defaults, ...customsFmt];
    },

    getStudyTaskCheckedMap() {
      return Store.get(`study_tasks_${Utils.todayKey()}`, {});
    },

    toggleStudyTask(name) {
      const map = Store.getStudyTaskCheckedMap();
      const wasChecked = !!map[name];
      map[name] = !wasChecked;
      Store.set(`study_tasks_${Utils.todayKey()}`, map);
      return { wasChecked, newChecked: !wasChecked };
    },

    getStudyTaskCompletedCount() {
      const map = Store.getStudyTaskCheckedMap();
      return Object.values(map).filter(Boolean).length;
    },

    // ========== 瑜伽 ==========
    getYogaLog() {
      return Store.get('yoga_log', { todayCompleted: [], todayDate: Utils.todayKey(), totalPoses: 0, trainingDays: [], customPoses: [], todayMinutes: 0, totalMinutes: 0 });
    },

    getYogaPoses() {
      const log = Store.getYogaLog();
      return [...CONFIG.DEFAULT_YOGA_POSES, ...(log.customPoses || [])];
    },

    addYogaPose(name, emoji) {
      const log = Store.getYogaLog();
      log.customPoses = log.customPoses || [];
      log.customPoses.push({ name, emoji: emoji || '✨' });
      Store.set('yoga_log', log);
    },

    removeYogaPose(idx) {
      // idx 是渲染时的索引（包含默认 + 自定义）
      const all = Store.getYogaPoses();
      const target = all[idx];
      const log = Store.getYogaLog();
      const customIdx = idx - CONFIG.DEFAULT_YOGA_POSES.length;
      if (customIdx >= 0 && customIdx < (log.customPoses || []).length) {
        log.customPoses.splice(customIdx, 1);
        // 同时从今日已完成中移除
        log.todayCompleted = (log.todayCompleted || []).filter(n => n !== target.name);
        Store.set('yoga_log', log);
      }
    },

    toggleYogaPose(name) {
      const log = Store.getYogaLog();
      log.todayCompleted = log.todayCompleted || [];
      log.todayDate = Utils.todayKey();
      const idx = log.todayCompleted.indexOf(name);
      let wasCompleted = idx >= 0;
      if (wasCompleted) {
        log.todayCompleted.splice(idx, 1);
      } else {
        log.todayCompleted.push(name);
        log.totalPoses = (log.totalPoses || 0) + 1;
        // 记录训练天
        if (!log.trainingDays.includes(log.todayDate)) {
          log.trainingDays.push(log.todayDate);
        }
      }
      Store.set('yoga_log', log);
      return !wasCompleted;
    },

    getYogaStats() {
      const log = Store.getYogaLog();
      const today = Utils.todayKey();
      return {
        todayCompleted: (log.todayCompleted || []).length,
        totalPoses: log.totalPoses || 0,
        trainingDays: (log.trainingDays || []).length,
        todayMinutes: log.todayMinutes || 0,
        totalMinutes: log.totalMinutes || 0
      };
    },

    addYogaMinutes(min) {
      const log = Store.getYogaLog();
      log.todayMinutes = (log.todayMinutes || 0) + min;
      log.totalMinutes = (log.totalMinutes || 0) + min;
      log.todayDate = Utils.todayKey();
      Store.set('yoga_log', log);
    },

    // ========== 养生 ==========
    getHealthLog() {
      return Store.get('health_log', { todayCompleted: [], todayDate: Utils.todayKey(), customTasks: [] });
    },

    getHealthTasks() {
      const log = Store.getHealthLog();
      return [...CONFIG.DEFAULT_HEALTH_TASKS, ...(log.customTasks || []).map(t => typeof t === 'string' ? { name: t, emoji: '✨' } : t)];
    },

    addHealthTask(name, emoji) {
      const log = Store.getHealthLog();
      log.customTasks = log.customTasks || [];
      log.customTasks.push({ name, emoji: emoji || '✨' });
      Store.set('health_log', log);
    },

    removeHealthTask(idx) {
      const all = Store.getHealthTasks();
      const target = all[idx];
      const log = Store.getHealthLog();
      const customIdx = idx - CONFIG.DEFAULT_HEALTH_TASKS.length;
      if (customIdx >= 0) {
        log.customTasks.splice(customIdx, 1);
        log.todayCompleted = (log.todayCompleted || []).filter(n => n !== target.name);
        Store.set('health_log', log);
      }
    },

    toggleHealthTask(name) {
      const log = Store.getHealthLog();
      log.todayCompleted = log.todayCompleted || [];
      log.todayDate = Utils.todayKey();
      const idx = log.todayCompleted.indexOf(name);
      const wasCompleted = idx >= 0;
      if (wasCompleted) {
        log.todayCompleted.splice(idx, 1);
      } else {
        log.todayCompleted.push(name);
      }
      Store.set('health_log', log);
      return !wasCompleted;
    },

    // ========== 记账 ==========
    getMoneyRecords() {
      return Store.get('money_records', []);
    },

    /** 清空所有记账记录 */
    clearMoneyRecords() {
      Store.set('money_records', []);
    },

    addMoneyRecord(type, category, amount, note) {
      const records = Store.getMoneyRecords();
      records.unshift({
        id: Date.now(),
        type,
        category,
        amount: Number(amount),
        note: note || '',
        date: Utils.todayKey(),
        timestamp: Date.now()
      });
      Store.set('money_records', records);
    },

    getMoneyStats() {
      const records = Store.getMoneyRecords();
      const today = Utils.todayKey();                 // YYYY-MM-DD
      const monthPrefix = today.slice(0, 7);          // YYYY-MM

      let tIn = 0, tEx = 0, mIn = 0, mEx = 0, aIn = 0, aEx = 0;
      records.forEach(r => {
        const amt = r.amount;
        const isIncome = r.type === 'income';
        // 总计
        if (isIncome) aIn += amt; else aEx += amt;
        // 今日
        if (r.date === today) { if (isIncome) tIn += amt; else tEx += amt; }
        // 本月
        if (r.date && r.date.slice(0, 7) === monthPrefix) {
          if (isIncome) mIn += amt; else mEx += amt;
        }
      });

      return {
        // 今日
        todayIncome: tIn.toFixed(2),
        todayExpense: tEx.toFixed(2),
        todayBalance: (tIn - tEx).toFixed(2),
        // 本月
        monthIncome: mIn.toFixed(2),
        monthExpense: mEx.toFixed(2),
        monthBalance: (mIn - mEx).toFixed(2),
        // 总计
        income: aIn.toFixed(2),
        expense: aEx.toFixed(2),
        balance: (aIn - aEx).toFixed(2)
      };
    },

    // ========== 经期 ==========
    getPeriodData() {
      return Store.get('period_data', { records: [], avgCycle: 28 });
    },

    /** 清空经期数据（重置） */
    clearPeriodData() {
      Store.set('period_data', { records: [], avgCycle: 28 });
      Store.remove('period_cal');
    },

    setAvgCycle(days) {
      const data = Store.getPeriodData();
      data.avgCycle = Math.max(20, Math.min(45, Number(days) || 28));
      Store.set('period_data', data);
    },

    recordPeriodToday() {
      const data = Store.getPeriodData();
      const today = Utils.todayKey();
      if (!data.records.includes(today)) {
        data.records.push(today);
        data.records.sort();
        Store.set('period_data', data);
      }
    },

    getPeriodStats() {
      const data = Store.getPeriodData();
      const records = data.records || [];
      if (records.length === 0) {
        return { lastDate: null, lastDaysAgo: null, predictedNext: null, predictedDaysLeft: null };
      }
      const lastDate = records[records.length - 1];
      const lastDaysAgo = Utils.daysBetween(lastDate, Utils.todayKey());
      const predictedNext = Utils.addDays(lastDate, data.avgCycle || 28);
      const predictedDaysLeft = Utils.daysBetween(Utils.todayKey(), predictedNext);
      return { lastDate, lastDaysAgo, predictedNext, predictedDaysLeft };
    },

    // ========== 团团 ==========
    getCatData() {
      return Store.get('cat_data', { totalFeed: 0, todayFeed: 0, todayFeedDate: Utils.todayKey(), totalTasks: 0, fishCount: 0 });
    },

    /** 任务完成时调用：直接喂猫 +1（每日上限），返回 { fed, leveledUp, newStageName } */
    feedCatOnTask() {
      const cat = Store.getCatData();
      const today = Utils.todayKey();
      if (cat.todayFeedDate !== today) {
        cat.todayFeed = 0;
        cat.todayFeedDate = today;
      }
      if (cat.todayFeed < CONFIG.CAT_FEED_DAILY_LIMIT) {
        const oldStage = Store.getCatStageIndex(cat.totalFeed || 0);
        cat.todayFeed += 1;
        cat.totalFeed = (cat.totalFeed || 0) + 1;
        cat.totalTasks = (cat.totalTasks || 0) + 1;
        const newStage = Store.getCatStageIndex(cat.totalFeed);
        Store.set('cat_data', cat);
        return {
          fed: true,
          leveledUp: newStage > oldStage,
          newStageName: CONFIG.CAT_STAGES[newStage].name,
          newStageEmoji: CONFIG.CAT_STAGES[newStage].emoji
        };
      }
      return { fed: false, leveledUp: false, newStageName: null };
    },

    /** 任务取消完成时回退（可选） */
    unfedCatOnTask() {
      const cat = Store.getCatData();
      const today = Utils.todayKey();
      if (cat.todayFeedDate !== today) return false;
      if (cat.todayFeed > 0 && cat.totalFeed > 0 && cat.totalTasks > 0) {
        cat.todayFeed -= 1;
        cat.totalFeed -= 1;
        cat.totalTasks -= 1;
        Store.set('cat_data', cat);
        return true;
      }
      return false;
    },

    /** 根据 totalFeed 返回阶段索引（0-5） */
    getCatStageIndex(total) {
      const t = total != null ? total : (Store.getCatData().totalFeed || 0);
      for (let i = CONFIG.CAT_STAGES.length - 1; i >= 0; i--) {
        if (t >= CONFIG.CAT_STAGES[i].min) return i;
      }
      return 0;
    },

    getCatStage() {
      const cat = Store.getCatData();
      const idx = Store.getCatStageIndex(cat.totalFeed || 0);
      return Object.assign({ stageIndex: idx }, CONFIG.CAT_STAGES[idx]);
    }
  };

  /* ============================================
     4. Views - 视图渲染器
     ============================================ */
  const Views = {};

  // ===== 顶部日期显示 =====
  function setTopbarDate() {
    const el = document.getElementById('topbarDate');
    if (el) el.textContent = Utils.formatDate(new Date());
  }

  // ===== 主页（工作台） =====
  Views.renderHome = function () {
    const shellbeanCount = Store.getShellbeanCount();
    const shellbeanChecked = Store.isShellbeanCheckedToday();
    const countdownDays = Store.getCountdownDays();
    const tasks = Store.getTodayTasks();
    const checkedMap = Store.getTodayCheckedMap();
    const completedCount = Store.getTodayCompletedCount();
    const quote = Store.getQuote();

    const tasksHtml = tasks.map((t, i) => {
      const checked = !!checkedMap[t.name];
      return `
        <div class="task-item ${checked ? 'checked' : ''}" data-task-idx="${i}">
          <div class="task-checkbox ${checked ? 'checked' : ''}" data-action="toggle-task" data-name="${Utils.esc(t.name)}">
            ${checked ? '✓' : ''}
          </div>
          <span class="task-emoji">${t.emoji}</span>
          <span class="task-name">${Utils.esc(t.name)}</span>
          ${t.isCustom ? `<span class="task-delete" data-action="delete-task" data-idx="${i}">🗑</span>` : ''}
        </div>
      `;
    }).join('');

    return `
      <!-- 每日一句 -->
      <div class="quote-card">
        <div class="quote-icon">🌸</div>
        <div class="quote-title">每日一句</div>
        <div class="quote-text">"${Utils.esc(quote.en)}"</div>
        <div class="quote-translate">${Utils.esc(quote.cn)}</div>
        <button class="quote-btn" data-action="shuffle-quote">🔄 换一句</button>
      </div>

      <!-- 倒计时 -->
      <div class="card" data-route-link="#/countdown" style="cursor:pointer">
        <div class="card-title">
          <span class="card-title-icon">⏰</span>
          <span>倒计时</span>
        </div>
        <div class="stat-row stat-row-2">
          <div class="stat-card">
            <div class="stat-value stat-value-large">${countdownDays >= 0 ? countdownDays : 0}</div>
            <div class="stat-label">距离 ${CONFIG.COUNTDOWN_TARGET.replace(/-/g, '/')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-value-large">${Store.getCountdownProgress()}%</div>
            <div class="stat-label">完成进度</div>
          </div>
        </div>
      </div>

      <!-- 扇贝打卡 -->
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">🐚</span>
          <span>扇贝打卡</span>
        </div>
        <div class="stat-row">
          <div class="stat-card" style="cursor:pointer" data-route-link="#/shellbean">
            <div class="stat-value">${shellbeanCount}</div>
            <div class="stat-label">累计天数</div>
          </div>
          <div class="stat-card" style="grid-column: span 2; display:flex; flex-direction:column; align-items:center; justify-content:center">
            <button class="btn ${shellbeanChecked ? 'btn-primary disabled' : 'btn-primary'} btn-block" data-action="shellbean-toggle">
              ${shellbeanChecked ? '✓ 今日已打卡（取消）' : '🐚 今日打卡'}
            </button>
          </div>
        </div>
      </div>

      <!-- 今日打卡 -->
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">📋</span>
          <span>今日打卡（${completedCount}/${tasks.length}）</span>
        </div>
        <div class="task-list">
          ${tasksHtml}
        </div>
        <div class="task-add">
          <input type="text" class="input" id="newTaskInput" placeholder="新增任务，例如：冥想 10 分钟" maxlength="20">
          <button class="btn btn-primary" data-action="add-task">添加</button>
        </div>
      </div>

      <!-- 团团状态提示 -->
      <div class="card" data-route-link="#/garden" style="cursor:pointer">
        <div class="card-title">
          <span class="card-title-icon">${CONFIG.CAT_SVG}</span>
          <span>团团</span>
          <span style="margin-left:auto; font-size: 36px">${Store.getCatStage().emoji}</span>
        </div>
        <div style="font-size: var(--font-sm); color: var(--color-text-secondary);">
          今天喂食 ${Store.getCatData().todayFeed}/${CONFIG.CAT_FEED_DAILY_LIMIT} 次 · 累计 ${Store.getCatData().totalFeed} 次
        </div>
        <div style="font-size: var(--font-xs); color: var(--color-primary); margin-top: 4px;">
          👉 点击查看团团的小院
        </div>
      </div>
    `;
  };

  // ===== 学习页 =====
  Views.renderStudy = function () {
    const log = Store.getStudyLog();
    const weekMinutes = Store.getWeekStudyMinutes();

    // 学习任务
    const studyTasks = Store.getStudyTasks();
    const studyCheckedMap = Store.getStudyTaskCheckedMap();
    const studyCompletedCount = Store.getStudyTaskCompletedCount();

    const studyTasksHtml = studyTasks.map((t, i) => {
      const checked = !!studyCheckedMap[t.name];
      return `
        <div class="task-item ${checked ? 'checked' : ''}">
          <div class="task-checkbox ${checked ? 'checked' : ''}" data-action="toggle-study-task" data-name="${Utils.esc(t.name)}">
            ${checked ? '✓' : ''}
          </div>
          <span class="task-emoji">${t.emoji}</span>
          <span class="task-name">${Utils.esc(t.name)}</span>
          ${t.isCustom ? `<span class="task-delete" data-action="delete-study-task" data-idx="${i}">🗑</span>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">📚</span>
          <span>今日学习数据</span>
        </div>
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-value">${log.todayMinutes || 0}</div>
            <div class="stat-label">今日学习（分）</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${weekMinutes}</div>
            <div class="stat-label">本周学习（分）</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${log.totalMinutes || 0}</div>
            <div class="stat-label">累计学习（分）</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">⏱</span>
          <span>学习计时</span>
        </div>
        <div class="timer-circle" id="timerDisplay">00:00</div>
        <div style="display:flex; gap: var(--spacing-sm); justify-content:center">
          <button class="btn btn-primary" data-action="timer-toggle" id="timerBtn">▶ 开始</button>
          <button class="btn btn-outline" data-action="timer-reset">↺ 重置</button>
        </div>
        <div style="text-align:center; margin-top: var(--spacing-sm); font-size: var(--font-xs); color: var(--color-text-secondary)">
          点击结束会自动累计到今日学习分钟
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">✅</span>
          <span>学习任务（${studyCompletedCount}/${studyTasks.length}）</span>
        </div>
        <div class="task-list">${studyTasksHtml}</div>
        <div class="task-add">
          <input type="text" class="input" id="newStudyTaskInput" placeholder="新增学习任务，例如：复习错题" maxlength="20">
          <button class="btn btn-primary" data-action="add-study-task">添加</button>
        </div>
      </div>
    `;
  };

  // ===== 瑜伽页 =====
  Views.renderYoga = function () {
    const stats = Store.getYogaStats();
    const poses = Store.getYogaPoses();
    const log = Store.getYogaLog();

    const listHtml = poses.map((p, i) => {
      const checked = (log.todayCompleted || []).includes(p.name);
      const isCustom = i >= CONFIG.DEFAULT_YOGA_POSES.length;
      return `
        <div class="task-item ${checked ? 'checked' : ''}">
          <div class="task-checkbox ${checked ? 'checked' : ''}" data-action="toggle-yoga" data-idx="${i}">
            ${checked ? '✓' : ''}
          </div>
          <span class="task-emoji">${p.emoji}</span>
          <span class="task-name">${Utils.esc(p.name)}</span>
          ${isCustom ? `<span class="task-delete" data-action="delete-yoga" data-idx="${i}">🗑</span>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">🧘‍♀️</span>
          <span>今日训练概览</span>
        </div>
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-value">${stats.todayCompleted}</div>
            <div class="stat-label">今日完成</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalPoses}</div>
            <div class="stat-label">累计动作</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.trainingDays}</div>
            <div class="stat-label">训练天数</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">⏱</span>
          <span>瑜伽计时</span>
        </div>
        <div class="timer-circle" id="yogaTimerDisplay">00:00</div>
        <div style="display:flex; gap: var(--spacing-sm); justify-content:center">
          <button class="btn btn-primary" data-action="yoga-timer-toggle" id="yogaTimerBtn">▶ 开始</button>
          <button class="btn btn-outline" data-action="yoga-timer-reset">↺ 重置</button>
        </div>
        <div class="stat-row" style="margin-top: var(--spacing-md); margin-bottom: 0">
          <div class="stat-card">
            <div class="stat-value" style="font-size: var(--font-xl)">${stats.todayMinutes}</div>
            <div class="stat-label">今日瑜伽（分）</div>
          </div>
          <div class="stat-card" style="grid-column: span 2">
            <div class="stat-value" style="font-size: var(--font-xl)">${stats.totalMinutes}</div>
            <div class="stat-label">累计瑜伽（分）</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">🧘‍♀️</span>
          <span>瑜伽动作</span>
        </div>
        <div class="task-list">${listHtml}</div>
        <div class="task-add">
          <input type="text" class="input" id="newYogaInput" placeholder="自定义动作（如：战士一式）" maxlength="15">
          <button class="btn btn-primary" data-action="add-yoga">添加</button>
        </div>
      </div>
    `;
  };

  // ===== 养生页 =====
  Views.renderHealth = function () {
    const tasks = Store.getHealthTasks();
    const log = Store.getHealthLog();

    const listHtml = tasks.map((t, i) => {
      const checked = (log.todayCompleted || []).includes(t.name);
      const isCustom = i >= CONFIG.DEFAULT_HEALTH_TASKS.length;
      return `
        <div class="task-item ${checked ? 'checked' : ''}">
          <div class="task-checkbox ${checked ? 'checked' : ''}" data-action="toggle-health" data-idx="${i}">
            ${checked ? '✓' : ''}
          </div>
          <span class="task-emoji">${t.emoji}</span>
          <span class="task-name">${Utils.esc(t.name)}</span>
          ${isCustom ? `<span class="task-delete" data-action="delete-health" data-idx="${i}">🗑</span>` : ''}
        </div>
      `;
    }).join('');

    const completedCount = (log.todayCompleted || []).length;

    return `
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">🪷</span>
          <span>养生护理（${completedCount}/${tasks.length}）</span>
        </div>
        <div class="task-list">${listHtml}</div>
        <div class="task-add">
          <input type="text" class="input" id="newHealthInput" placeholder="新增养生任务" maxlength="15">
          <button class="btn btn-primary" data-action="add-health">添加</button>
        </div>
      </div>

      <div class="card" style="background: linear-gradient(135deg, #FFE4EC, #FFF0F5); text-align:center">
        <div style="font-size: 48px; margin-bottom: var(--spacing-sm)">🪷</div>
        <div style="font-size: var(--font-md); color: var(--color-primary-dark); font-weight: 600">
          好好爱自己，每天都值得被温柔对待
        </div>
      </div>
    `;
  };

  // ===== 存钱页 =====
  Views.renderMoney = function () {
    const stats = Store.getMoneyStats();
    const moneyState = Store.get('money_ui', { tab: 'expense', selectedCategory: null, amount: '', note: '' });
    const categories = moneyState.tab === 'expense' ? CONFIG.MONEY_EXPENSE_CATEGORIES : CONFIG.MONEY_INCOME_CATEGORIES;

    const tabsHtml = `
      <div class="tabs">
        <div class="tab-btn ${moneyState.tab === 'expense' ? 'active' : ''}" data-action="money-tab" data-tab="expense">💸 支出</div>
        <div class="tab-btn ${moneyState.tab === 'income' ? 'active' : ''}" data-action="money-tab" data-tab="income">💰 收入</div>
      </div>
    `;

    const categoriesHtml = categories.map(c =>
      `<div class="category-item ${moneyState.selectedCategory === c.name ? 'active' : ''}" data-action="select-category" data-name="${Utils.esc(c.name)}">
        <div class="category-icon">${c.icon}</div>
        <div class="category-name">${Utils.esc(c.name)}</div>
      </div>`
    ).join('');

    const records = Store.getMoneyRecords().slice(0, 20);
    const recordsHtml = records.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">💰</div><div>还没有记录哦~</div></div>`
      : `<div class="record-list">${records.map(r => {
          const cat = (r.type === 'expense' ? CONFIG.MONEY_EXPENSE_CATEGORIES : CONFIG.MONEY_INCOME_CATEGORIES).find(c => c.name === r.category);
          return `
            <div class="record-item">
              <div class="record-icon">${cat ? cat.icon : '📌'}</div>
              <div class="record-info">
                <div class="record-name">${Utils.esc(r.category)} ${r.note ? '· ' + Utils.esc(r.note) : ''}</div>
                <div class="record-meta">${r.date}</div>
              </div>
              <div class="record-amount ${r.type}">${r.type === 'income' ? '+' : '-'}¥${r.amount.toFixed(2)}</div>
            </div>
          `;
        }).join('')}</div>`;

    return `
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">💰</span>
          <span>记账消费</span>
        </div>
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-success)">¥${stats.todayIncome}</div>
            <div class="stat-label">日收入</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-danger)">¥${stats.todayExpense}</div>
            <div class="stat-label">日支出</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥${stats.todayBalance}</div>
            <div class="stat-label">日结余</div>
          </div>
        </div>
        <div class="stat-row" style="margin-top: var(--spacing-sm)">
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-success)">¥${stats.monthIncome}</div>
            <div class="stat-label">月收入</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-danger)">¥${stats.monthExpense}</div>
            <div class="stat-label">月支出</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥${stats.monthBalance}</div>
            <div class="stat-label">月结余</div>
          </div>
        </div>
        <div class="stat-row" style="margin-top: var(--spacing-sm)">
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-success)">¥${stats.income}</div>
            <div class="stat-label">总收入</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--color-danger)">¥${stats.expense}</div>
            <div class="stat-label">总支出</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥${stats.balance}</div>
            <div class="stat-label">总结余</div>
          </div>
        </div>
        ${tabsHtml}
        <div class="category-grid">${categoriesHtml}</div>
        <div class="input-group" style="margin-top: var(--spacing-sm)">
          <input type="number" step="0.01" class="input" id="moneyAmount" placeholder="金额" value="${Utils.esc(moneyState.amount)}">
          <input type="text" class="input" id="moneyNote" placeholder="备注（选填）" value="${Utils.esc(moneyState.note)}" style="flex:2">
        </div>
        <button class="btn btn-primary btn-block mt-md" data-action="add-money" style="margin-top: var(--spacing-md)">+ 添加记录</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">📒</span>
          <span>最近记录</span>
          ${records.length > 0 ? '<button class="card-title-action" data-action="clear-money" style="margin-left:auto; background:none; border:none; color: var(--color-text-secondary); font-size: var(--font-xs); cursor:pointer">清空数据</button>' : ''}
        </div>
        ${recordsHtml}
      </div>
    `;
  };

  // ===== 经期页 =====
  Views.renderPeriod = function () {
    const data = Store.getPeriodData();
    const stats = Store.getPeriodStats();
    const calState = Store.get('period_cal', { year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

    const year = calState.year;
    const month = calState.month;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayStr = Utils.todayKey();

    // 单元格
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push('<div class="calendar-day empty"></div>');
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${Utils.pad2(month)}-${Utils.pad2(d)}`;
      const isRecorded = (data.records || []).includes(dateStr);
      const isToday = dateStr === todayStr;
      const isPredicted = stats.predictedNext === dateStr;
      let cls = 'calendar-day';
      if (isToday) cls += ' today';
      if (isRecorded) cls += ' recorded';
      else if (isPredicted) cls += ' predicted';
      cells.push(`<div class="${cls}">${d}</div>`);
    }

    return `
      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">🌸</span>
          <span>经期记录</span>
          ${(data.records || []).length > 0 ? '<button class="card-title-action" data-action="clear-period" style="margin-left:auto; background:none; border:none; color: var(--color-text-secondary); font-size: var(--font-xs); cursor:pointer">清空数据</button>' : ''}
        </div>
        <div class="stat-row stat-row-2">
          <div class="stat-card">
            <div class="stat-label" style="font-size: var(--font-sm); color: var(--color-primary-dark); font-weight: 600">距上次经期</div>
            <div class="stat-value stat-value-large">${stats.lastDaysAgo == null ? '—' : stats.lastDaysAgo}</div>
            <div class="stat-label">${stats.lastDaysAgo == null ? '尚未记录' : '天前'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" style="font-size: var(--font-sm); color: var(--color-primary-dark); font-weight: 600">预计下次</div>
            <div class="stat-value stat-value-large" style="font-size: var(--font-xl)">${stats.predictedNext ? stats.predictedNext.slice(5).replace('-', '月') + '日' : '—'}</div>
            <div class="stat-label">${stats.predictedDaysLeft != null ? '还有 ' + stats.predictedDaysLeft + ' 天' : '请先记录'}</div>
          </div>
        </div>
        <div style="margin-top: var(--spacing-md); display:flex; gap: var(--spacing-sm); align-items:center">
          <span style="font-size: var(--font-sm)">平均周期</span>
          <input type="number" class="input" id="avgCycleInput" value="${data.avgCycle || 28}" min="20" max="45" style="width:80px; text-align:center">
          <span style="font-size: var(--font-sm)">天</span>
          <button class="btn btn-primary btn-sm" data-action="save-cycle">保存</button>
          <span style="font-size: var(--font-xs); color: var(--color-text-secondary)">用于预测</span>
        </div>
        <button class="btn btn-primary btn-block mt-md" data-action="record-period" style="margin-top: var(--spacing-md)">📝 记录今天来月经</button>
      </div>

      <div class="calendar">
        <div class="calendar-header">
          <span class="calendar-nav" data-action="cal-prev">‹</span>
          <span class="calendar-title">${year} 年 ${month} 月</span>
          <span class="calendar-nav" data-action="cal-next">›</span>
        </div>
        <div class="calendar-weekdays">
          <div class="calendar-weekday">日</div>
          <div class="calendar-weekday">一</div>
          <div class="calendar-weekday">二</div>
          <div class="calendar-weekday">三</div>
          <div class="calendar-weekday">四</div>
          <div class="calendar-weekday">五</div>
          <div class="calendar-weekday">六</div>
        </div>
        <div class="calendar-days">${cells.join('')}</div>
        <div class="calendar-legend">
          <div class="legend-item"><span class="legend-dot" style="background: var(--color-primary)"></span>已记录</div>
          <div class="legend-item"><span class="legend-dot" style="background: white; border: 2px dashed var(--color-primary)"></span>预测</div>
          <div class="legend-item"><span class="legend-dot" style="background: white; border: 2px solid var(--color-primary)"></span>今天</div>
        </div>
      </div>
    `;
  };

  // ===== 扇贝打卡页 =====
  Views.renderShellbean = function () {
    const count = Store.getShellbeanCount();
    const checked = Store.isShellbeanCheckedToday();
    const history = Store.getShellbeanHistory();
    const today = Utils.todayKey();

    // 最近 7 天条
    const streakDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = Utils.addDays(today, -i);
      const isToday = i === 0;
      const isChecked = history.includes(d);
      const weekday = ['日','一','二','三','四','五','六'][new Date(d).getDay()];
      streakDays.push(`
        <div class="streak-day ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}">
          <div style="font-size: 14px; font-weight: 600">${d.slice(8,10)}</div>
          <div>周${weekday}</div>
          <div>${isChecked ? '✓' : '·'}</div>
        </div>
      `);
    }

    return `
      <div class="shellbean-hero">
        <div class="shellbean-emoji">🐚</div>
        <div class="shellbean-days">${count}</div>
        <div class="shellbean-label">累计打卡天数</div>
        <button class="btn ${checked ? 'btn-primary disabled' : 'btn-primary'}" style="margin-top: var(--spacing-md); background: white; color: var(--color-primary)" data-action="shellbean-toggle">
          ${checked ? '✓ 今日已打卡（点击取消）' : '🐚 今日打卡 +1'}
        </button>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="card-title-icon">📅</span>
          <span>最近 7 天</span>
        </div>
        <div class="streak-bar">${streakDays.join('')}</div>
      </div>

      <div class="card" style="text-align:center">
        <div style="font-size: 48px; margin-bottom: var(--spacing-sm)">🐚</div>
        <div style="font-size: var(--font-md); color: var(--color-primary-dark); font-weight: 600">
          每天一点点，进步看得见
        </div>
        <div style="font-size: var(--font-sm); color: var(--color-text-secondary); margin-top: var(--spacing-xs)">
          学习语言是一场漫长的旅行，坚持就是胜利 ✨
        </div>
      </div>
    `;
  };

  // ===== 倒计时页 =====
  Views.renderCountdown = function () {
    const days = Store.getCountdownDays();
    const progress = Store.getCountdownProgress();
    const target = CONFIG.COUNTDOWN_TARGET;
    const formatted = target.slice(0, 4) + '/' + target.slice(5, 7) + '/' + target.slice(8, 10);

    return `
      <div class="countdown-hero">
        <div style="font-size: 32px">⏰</div>
        <div class="countdown-days">${days >= 0 ? days : 0}</div>
        <div class="countdown-days-label">距离目标日还有</div>
        <div class="countdown-target">🎯 ${formatted}</div>
      </div>

      <div class="progress-wrap">
        <div class="card-title">
          <span class="card-title-icon">📈</span>
          <span>年度进度</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: var(--font-xs); color: var(--color-text-secondary)">
          <span>2026/01/01</span>
          <span>${progress}%</span>
          <span>${formatted}</span>
        </div>
      </div>

      <div class="card" style="text-align:center">
        <div style="font-size: 36px; margin-bottom: var(--spacing-sm)">🌟</div>
        <div style="font-size: var(--font-md); color: var(--color-text); font-weight: 500">
          ${days > 0 ? '还有 ' + days + ' 天，加油！' : days === 0 ? '就是今天！冲鸭！' : '目标日已过，给自己一个新的目标吧 🌸'}
        </div>
      </div>
    `;
  };

  // ===== 团团的小院（按图3完全重做） =====
  Views.renderGarden = function () {
    const cat = Store.getCatData();
    const stage = Store.getCatStage();

    // 饱食度 = (todayFeed / 5) * 100%，最高 100%
    const fullness = Math.min(100, Math.round(((cat.todayFeed || 0) / CONFIG.CAT_FEED_DAILY_LIMIT) * 100));
    // 心情值 = 累计喂食进度（按 0~100 算）
    const mood = Math.min(100, (cat.totalFeed || 0));

    // 获取阶段信息和对应 SVG
    const stageInfo = Store.getCatStage();
    const catSVG = CONFIG.CAT_STAGE_SVGS[stageInfo.stageIndex] || CONFIG.CAT_STAGE_SVGS[0];

    // 阶段进度计算
    const totalFeed = cat.totalFeed || 0;
    const curStage = CONFIG.CAT_STAGES[stageInfo.stageIndex];
    const isMaxStage = stageInfo.stageIndex >= CONFIG.CAT_STAGES.length - 1;
    const nextStage = isMaxStage ? null : CONFIG.CAT_STAGES[stageInfo.stageIndex + 1];
    // 当前阶段内进度
    const stageProgress = isMaxStage ? 100 : Math.round(((totalFeed - curStage.min) / (nextStage.min - curStage.min)) * 100);
    const feedsToNext = isMaxStage ? 0 : (nextStage.min - totalFeed);

    return `
      <div class="garden-card">
        <div class="garden-title">团团的小院 🏡</div>
        <div class="garden-subtitle">每天完成任务，就能喂团团吃东西~</div>

        <div class="stage-badge">
          <span class="stage-badge-emoji">${stageInfo.emoji}</span>
          <span class="stage-badge-name">${stageInfo.name}</span>
          <span class="stage-badge-level">Lv.${stageInfo.stageIndex + 1}</span>
        </div>

        <div class="cat-circle-wrap">
          ${catSVG}
        </div>

        <div class="stage-info-card">
          <div class="stage-desc">${stageInfo.desc}</div>
          ${isMaxStage
            ? '<div class="stage-next-hint">🏆 团团已经满级啦！是最棒的老年猫~</div>'
            : '<div class="stage-next-hint">下一阶段：<strong>' + nextStage.emoji + ' ' + nextStage.name + '</strong>（还需 ' + feedsToNext + ' 次喂食）</div>'
          }
          <div class="stage-progress">
            <div class="stage-bar">
              <div class="stage-bar-fill" style="width: ${stageProgress}%"></div>
            </div>
            <div class="stage-bar-label">
              <span>${stageInfo.name}</span>
              <span>${isMaxStage ? 'MAX' : nextStage.name}</span>
            </div>
          </div>
        </div>

        <div class="garden-progress">
          <div class="garden-progress-row">
            <span class="garden-progress-label">饱食度</span>
            <span class="garden-progress-value">${fullness}%</span>
          </div>
          <div class="garden-bar">
            <div class="garden-bar-fill garden-bar-pink" style="width: ${fullness}%"></div>
          </div>

          <div class="garden-progress-row" style="margin-top: var(--spacing-md)">
            <span class="garden-progress-label">心情值</span>
            <span class="garden-progress-value">${mood}%</span>
          </div>
          <div class="garden-bar">
            <div class="garden-bar-fill garden-bar-yellow" style="width: ${mood}%"></div>
          </div>
        </div>

        <div class="fish-card">
          <div class="fish-card-label">今日喂食</div>
          <div class="fish-card-value">
            <span class="fish-count">${cat.todayFeed || 0}</span>
            <span class="fish-emoji">/${CONFIG.CAT_FEED_DAILY_LIMIT} 🐟</span>
          </div>
        </div>

        <div class="total-feed">已累计喂食 <span style="color: var(--color-primary-dark); font-weight: 700">${cat.totalFeed || 0}</span> 次</div>

        <div style="text-align:center; font-size: var(--font-xs); color: var(--color-text-secondary); padding: var(--spacing-sm) var(--spacing-md);">
          💡 完成今日任务即可自动喂团团，每日最多 ${CONFIG.CAT_FEED_DAILY_LIMIT} 次
        </div>
      </div>
    `;
  };

  /* ============================================
     5. Router - 路由
     ============================================ */
  const Router = {
    routes: {
      'home':      { title: '工作台',     render: Views.renderHome },
      'study':     { title: '学习工作',   render: Views.renderStudy },
      'yoga':      { title: '瑜伽打卡',   render: Views.renderYoga },
      'health':    { title: '养生护理',   render: Views.renderHealth },
      'money':     { title: '记账消费',   render: Views.renderMoney },
      'period':    { title: '经期记录',   render: Views.renderPeriod },
      'shellbean': { title: '扇贝打卡',   render: Views.renderShellbean },
      'countdown': { title: '倒计时',     render: Views.renderCountdown },
      'garden':    { title: '团团的小院', render: Views.renderGarden }
    },

    current: 'home',

    init() {
      window.addEventListener('hashchange', () => Router.handle());
      Router.handle();
    },

    handle() {
      let hash = (window.location.hash || '').replace(/^#\//, '').trim();
      if (!hash || !Router.routes[hash]) hash = 'home';
      Router.current = hash;
      const route = Router.routes[hash];

      document.getElementById('pageTitle').textContent = route.title;
      const view = document.getElementById('view');
      view.innerHTML = route.render();
      setTopbarDate();

      // 路由链接 - 点击卡片跳转
      view.querySelectorAll('[data-route-link]').forEach(el => {
        el.addEventListener('click', (e) => {
          const target = el.getAttribute('data-route-link');
          if (target) window.location.hash = target;
        });
      });

      // 高亮底部 Tab
      const isGarden = hash === 'garden';
      document.querySelectorAll('.tab-item').forEach(el => {
        el.classList.toggle('active',
          (el.dataset.tab === 'garden' && isGarden) ||
          (el.dataset.tab === 'home' && !isGarden)
        );
      });

      // 高亮侧边栏
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.route === hash);
      });

      // 绑定视图事件
      Events.bindViewEvents(hash);

      // 关闭侧边栏
      Sidebar.close();

      // 清理计时器
      TimerState.cleanup();
      YogaTimerState.cleanup();
    }
  };

  /* ============================================
     6. Sidebar - 侧边栏控制
     ============================================ */
  const Sidebar = {
    open() {
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('overlay').classList.add('show');
    },
    close() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('show');
    },
    toggle() {
      const isOpen = document.getElementById('sidebar').classList.contains('open');
      isOpen ? Sidebar.close() : Sidebar.open();
    }
  };

  /* ============================================
     7. Timer State - 学习计时器状态
     ============================================ */
  const TimerState = {
    seconds: 0,
    running: false,
    intervalId: null,

    start() {
      if (TimerState.running) return;
      TimerState.running = true;
      TimerState.intervalId = setInterval(() => {
        TimerState.seconds++;
        TimerState.updateDisplay();
      }, 1000);
    },

    pause() {
      TimerState.running = false;
      clearInterval(TimerState.intervalId);
      TimerState.intervalId = null;
      // 保存累计分钟
      const min = Math.floor(TimerState.seconds / 60);
      if (min > 0) {
        Store.addStudyMinutes(min);
        TimerState.seconds = TimerState.seconds % 60;
      }
    },

    reset() {
      TimerState.pause();
      const totalMin = Math.floor(TimerState.seconds / 60);
      if (totalMin > 0) Store.addStudyMinutes(totalMin);
      TimerState.seconds = 0;
      TimerState.updateDisplay();
    },

    updateDisplay() {
      const el = document.getElementById('timerDisplay');
      if (!el) return;
      const m = Math.floor(TimerState.seconds / 60);
      const s = TimerState.seconds % 60;
      el.textContent = `${Utils.pad2(m)}:${Utils.pad2(s)}`;
      const btn = document.getElementById('timerBtn');
      if (btn) btn.innerHTML = TimerState.running ? '⏸ 暂停' : '▶ 开始';
    },

    cleanup() {
      if (TimerState.intervalId) {
        TimerState.pause();
      }
    }
  };

  /* 瑜伽计时器（独立于学习计时器） */
  const YogaTimerState = {
    seconds: 0,
    running: false,
    intervalId: null,

    start() {
      if (YogaTimerState.running) return;
      YogaTimerState.running = true;
      YogaTimerState.intervalId = setInterval(() => {
        YogaTimerState.seconds++;
        YogaTimerState.updateDisplay();
      }, 1000);
    },

    pause() {
      YogaTimerState.running = false;
      clearInterval(YogaTimerState.intervalId);
      YogaTimerState.intervalId = null;
      const min = Math.floor(YogaTimerState.seconds / 60);
      if (min > 0) {
        Store.addYogaMinutes(min);
        YogaTimerState.seconds = YogaTimerState.seconds % 60;
      }
    },

    reset() {
      YogaTimerState.pause();
      const totalMin = Math.floor(YogaTimerState.seconds / 60);
      if (totalMin > 0) Store.addYogaMinutes(totalMin);
      YogaTimerState.seconds = 0;
      YogaTimerState.updateDisplay();
    },

    updateDisplay() {
      const el = document.getElementById('yogaTimerDisplay');
      if (!el) return;
      const m = Math.floor(YogaTimerState.seconds / 60);
      const s = YogaTimerState.seconds % 60;
      el.textContent = `${Utils.pad2(m)}:${Utils.pad2(s)}`;
      const btn = document.getElementById('yogaTimerBtn');
      if (btn) btn.innerHTML = YogaTimerState.running ? '⏸ 暂停' : '▶ 开始';
    },

    cleanup() {
      if (YogaTimerState.intervalId) {
        YogaTimerState.pause();
      }
    }
  };

  /* ============================================
     8. Events - 事件绑定
     ============================================ */
  const Events = {
    bindGlobal() {
      document.getElementById('menuBtn').addEventListener('click', Sidebar.toggle);
      document.getElementById('overlay').addEventListener('click', Sidebar.close);

      // 侧边栏点击链接后自动关闭（移动端）
      document.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', () => {
          // 让 hash 路由先处理跳转，然后关闭侧边栏
          setTimeout(() => Sidebar.close(), 50);
        });
      });
    },

    bindViewEvents(route) {
      const view = document.getElementById('view');

      // 移除上一次绑定的事件委托（防止重复叠加）
      if (Events._boundHandler) {
        view.removeEventListener('click', Events._boundHandler);
      }
      if (Events._boundKeydownHandler) {
        view.removeEventListener('keydown', Events._boundKeydownHandler);
      }
      Events._boundHandler = (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;

        switch (action) {
          case 'shuffle-quote':
            Store.shuffleQuote();
            Router.handle();
            break;
          case 'shellbean-checkin':
          case 'shellbean-checkin-page':
          case 'shellbean-toggle': {
            if (Store.isShellbeanCheckedToday()) {
              Store.uncheckShellbeanToday();
              showToast('已取消今日扇贝打卡');
              Router.handle();
            } else {
              if (Store.doShellbeanCheckin()) {
                showToast('🐚 扇贝打卡成功！');
                Router.handle();
              }
            }
            break;
          }
          case 'toggle-task': {
            const name = target.dataset.name;
            const result = Store.toggleTask(name);
            if (result.newChecked) {
              // 今日打卡每完成一个小任务 -> 喂团团一次小鱼干
              const fed = Store.feedCatOnTask();
              showFeedAnimation('🐟');
              if (fed.fed) {
                if (fed.leveledUp) {
                  showToast('🎉 团团升级了！现在是【' + fed.newStageEmoji + ' ' + fed.newStageName + '】！');
                } else {
                  showToast('✅ 打卡完成！🐟 +1 小鱼干喂给团团！');
                }
              } else {
                showToast('✅ 打卡完成！（团团今日已经吃饱啦）');
              }
            } else {
              Store.unfedCatOnTask();
            }
            Router.handle();
            break;
          }
          case 'delete-task': {
            const idx = parseInt(target.dataset.idx);
            const customs = Store.getCustomTasks();
            const customIdx = idx - CONFIG.DEFAULT_TASKS.length;
            if (customIdx >= 0) {
              Store.removeCustomTask(customIdx);
              Router.handle();
            }
            break;
          }
          case 'add-task': {
            const input = document.getElementById('newTaskInput');
            const val = (input.value || '').trim();
            if (!val) { showToast('请输入任务名称'); return; }
            Store.addCustomTask({ name: val, emoji: '✨' });
            input.value = '';
            Router.handle();
            break;
          }
          case 'toggle-yoga': {
            const idx = parseInt(target.dataset.idx);
            const poses = Store.getYogaPoses();
            const name = poses[idx].name;
            Store.toggleYogaPose(name);
            Router.handle();
            break;
          }
          case 'delete-yoga': {
            const idx = parseInt(target.dataset.idx);
            Store.removeYogaPose(idx);
            Router.handle();
            break;
          }
          case 'add-yoga': {
            const input = document.getElementById('newYogaInput');
            const val = (input.value || '').trim();
            if (!val) { showToast('请输入动作名称'); return; }
            Store.addYogaPose(val, '✨');
            input.value = '';
            Router.handle();
            break;
          }
          case 'toggle-study-task': {
            const name = target.dataset.name;
            const r = Store.toggleStudyTask(name);
            if (r.newChecked) {
              showToast('✅ 学习任务完成！');
            }
            Router.handle();
            break;
          }
          case 'delete-study-task': {
            const idx = parseInt(target.dataset.idx);
            const customIdx = idx - CONFIG.DEFAULT_STUDY_TASKS.length;
            if (customIdx >= 0) {
              Store.removeStudyCustomTask(customIdx);
              Router.handle();
            }
            break;
          }
          case 'add-study-task': {
            const input = document.getElementById('newStudyTaskInput');
            const val = (input.value || '').trim();
            if (!val) { showToast('请输入任务名称'); return; }
            Store.addStudyCustomTask({ name: val, emoji: '✨' });
            input.value = '';
            Router.handle();
            break;
          }
          case 'toggle-health': {
            const idx = parseInt(target.dataset.idx);
            const tasks = Store.getHealthTasks();
            Store.toggleHealthTask(tasks[idx].name);
            Router.handle();
            break;
          }
          case 'delete-health': {
            const idx = parseInt(target.dataset.idx);
            Store.removeHealthTask(idx);
            Router.handle();
            break;
          }
          case 'add-health': {
            const input = document.getElementById('newHealthInput');
            const val = (input.value || '').trim();
            if (!val) { showToast('请输入养生任务'); return; }
            Store.addHealthTask(val, '✨');
            input.value = '';
            Router.handle();
            break;
          }
          case 'money-tab': {
            const ui = Store.get('money_ui', { tab: 'expense', selectedCategory: null, amount: '', note: '' });
            ui.tab = target.dataset.tab;
            ui.selectedCategory = null;
            Store.set('money_ui', ui);
            Router.handle();
            break;
          }
          case 'select-category': {
            const ui = Store.get('money_ui', { tab: 'expense', selectedCategory: null, amount: '', note: '' });
            ui.selectedCategory = target.dataset.name;
            Store.set('money_ui', ui);
            Router.handle();
            break;
          }
          case 'add-money': {
            const ui = Store.get('money_ui', { tab: 'expense', selectedCategory: null, amount: '', note: '' });
            const amountEl = document.getElementById('moneyAmount');
            const noteEl = document.getElementById('moneyNote');
            // 兼容多种事件触发方式：从 value 直接读取 + 尝试 input 事件
            const rawAmount = (amountEl.value || '').trim();
            const amount = parseFloat(rawAmount);
            const note = (noteEl.value || '').trim();
            if (!rawAmount || isNaN(amount) || amount <= 0) { showToast('请输入有效金额'); return; }
            if (!ui.selectedCategory) { showToast('请选择分类'); return; }
            Store.addMoneyRecord(ui.tab, ui.selectedCategory, amount, note);
            // 重置
            ui.amount = '';
            ui.note = '';
            ui.selectedCategory = null;
            Store.set('money_ui', ui);
            showToast('✓ 记录成功');
            Router.handle();
            break;
          }
          case 'clear-money': {
            if (confirm('确定要清空所有记账记录吗？此操作不可恢复。')) {
              Store.clearMoneyRecords();
              showToast('🗑 已清空');
              Router.handle();
            }
            break;
          }
          case 'record-period': {
            Store.recordPeriodToday();
            showToast('🌸 已记录今天');
            Router.handle();
            break;
          }
          case 'clear-period': {
            if (confirm('确定要清空所有经期记录吗？此操作不可恢复。')) {
              Store.clearPeriodData();
              showToast('🗑 已清空经期数据');
              Router.handle();
            }
            break;
          }
          case 'save-cycle': {
            const input = document.getElementById('avgCycleInput');
            Store.setAvgCycle(input.value);
            showToast('✓ 已保存');
            Router.handle();
            break;
          }
          case 'cal-prev': {
            const cal = Store.get('period_cal', { year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
            cal.month -= 1;
            if (cal.month < 1) { cal.month = 12; cal.year -= 1; }
            Store.set('period_cal', cal);
            Router.handle();
            break;
          }
          case 'cal-next': {
            const cal = Store.get('period_cal', { year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
            cal.month += 1;
            if (cal.month > 12) { cal.month = 1; cal.year += 1; }
            Store.set('period_cal', cal);
            Router.handle();
            break;
          }
          case 'timer-toggle':
            if (TimerState.running) TimerState.pause();
            else TimerState.start();
            TimerState.updateDisplay();
            break;
          case 'timer-reset':
            TimerState.reset();
            Router.handle();
            break;
          case 'yoga-timer-toggle':
            if (YogaTimerState.running) YogaTimerState.pause();
            else YogaTimerState.start();
            YogaTimerState.updateDisplay();
            break;
          case 'yoga-timer-reset':
            YogaTimerState.reset();
            Router.handle();
            break;
          case 'feed-cat-now': {
            // 已移除手动喂团团按钮，完成任务即自动喂食，此处保留以防旧缓存触发
            showToast('💡 完成任务即可自动喂团团哦~');
            Router.handle();
            break;
          }
          case 'fav-word': {
            const word = target.dataset.word;
            Store.toggleFavWord(word);
            Router.handle();
            break;
          }
          case 'study-tab': {
            // 简单视觉切换，实际数据未变
            view.querySelectorAll('[data-action="study-tab"]').forEach(el => el.classList.remove('active'));
            target.classList.add('active');
            break;
          }
        }
      };

      // 输入回车添加
      const addInputs = [
        { id: 'newTaskInput', action: 'add-task' },
        { id: 'newYogaInput', action: 'add-yoga' },
        { id: 'newHealthInput', action: 'add-health' },
        { id: 'newStudyTaskInput', action: 'add-study-task' }
      ];
      if (Events._boundKeydownHandler) {
        view.removeEventListener('keydown', Events._boundKeydownHandler);
      }
      Events._boundKeydownHandler = (e) => {
        if (e.key !== 'Enter') return;
        for (const cfg of addInputs) {
          if (e.target && e.target.id === cfg.id) {
            e.preventDefault();
            const btn = view.querySelector('[data-action="' + cfg.action + '"]');
            if (btn) btn.click();
            return;
          }
        }
      };
      view.addEventListener('keydown', Events._boundKeydownHandler);
      view.addEventListener('click', Events._boundHandler);
    }
  };

  /* ============================================
     9. 工具：Toast & 喂食动画
     ============================================ */
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.78)', color: 'white', padding: '10px 20px',
      borderRadius: '999px', fontSize: '14px', zIndex: '300',
      animation: 'fadeIn 0.2s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }

  function showFeedAnimation(emoji) {
    const icon = emoji || '🐟';
    // 多个小鱼干一起飞出，更生动
    const count = 5;
    for (let i = 0; i < count; i++) {
      const anim = document.createElement('div');
      anim.className = 'feed-animation';
      anim.textContent = icon;
      const delay = i * 80;
      const startX = (Math.random() - 0.5) * 200;
      const driftX = (Math.random() - 0.5) * 300;
      anim.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        font-size: ${28 + Math.random() * 24}px;
        pointer-events: none;
        z-index: 200;
        transform: translate(calc(-50% + ${startX}px), -50%);
        opacity: 0;
        animation: feedFly 1.2s ease ${delay}ms forwards;
        --drift-x: ${driftX}px;
      `;
      document.body.appendChild(anim);
      setTimeout(() => anim.remove(), 1300 + delay);
    }
  }

  /* ============================================
     10. 初始化
     ============================================ */
  function init() {
    Store.checkDailyReset();
    setTopbarDate();
    Events.bindGlobal();
    Router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();