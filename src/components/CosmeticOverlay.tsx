// アクセサリーアイテムをキャラに重ねて描画するSVGオーバーレイ
// 各アイテムは viewBox="0 0 200 180" 内の座標で配置
// 将来は <image href={imageUrl}/> に差し替え可能
import type { ReactElement } from 'react';

interface CosmeticOverlayProps {
  equippedIds: string[];
}

export default function CosmeticOverlay({ equippedIds }: CosmeticOverlayProps) {
  // 描画順: body → head → face → accessory
  const order = ['body', 'head', 'face', 'accessory'];
  const renderers: Record<string, (key: string) => ReactElement> = {
    // === コモン ===
    ribbon: (key) => (
      <g key={key}>
        <ellipse cx="78" cy="40" rx="14" ry="8" fill="#FF6B9D" stroke="#C44A6B" strokeWidth="1.5" transform="rotate(-15 78 40)" />
        <ellipse cx="122" cy="40" rx="14" ry="8" fill="#FF6B9D" stroke="#C44A6B" strokeWidth="1.5" transform="rotate(15 122 40)" />
        <circle cx="100" cy="42" r="6" fill="#FF6B9D" stroke="#C44A6B" strokeWidth="1.5" />
        <circle cx="100" cy="42" r="2" fill="#FFF" opacity="0.7" />
      </g>
    ),
    glasses: (key) => (
      <g key={key}>
        <circle cx="80" cy="88" r="13" fill="none" stroke="#3E2723" strokeWidth="2.5" />
        <circle cx="120" cy="88" r="13" fill="none" stroke="#3E2723" strokeWidth="2.5" />
        <line x1="93" y1="88" x2="107" y2="88" stroke="#3E2723" strokeWidth="2.5" />
        <circle cx="80" cy="88" r="11" fill="#FFF" opacity="0.15" />
        <circle cx="120" cy="88" r="11" fill="#FFF" opacity="0.15" />
      </g>
    ),
    'heart-cheeks': (key) => (
      <g key={key}>
        <path d="M58 100 Q54 96 50 100 Q50 106 58 112 Q66 106 66 100 Q62 96 58 100 Z" fill="#FF4081" stroke="#C2185B" strokeWidth="1" />
        <path d="M142 100 Q138 96 134 100 Q134 106 142 112 Q150 106 150 100 Q146 96 142 100 Z" fill="#FF4081" stroke="#C2185B" strokeWidth="1" />
      </g>
    ),
    scarf: (key) => (
      <g key={key}>
        <path d="M50 130 Q100 145 150 130 L155 145 Q100 158 45 145 Z" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5" />
        <path d="M55 145 L52 168 L62 165 L60 145 Z" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5" />
        <path d="M145 145 L148 168 L138 165 L140 145 Z" fill="#C62828" stroke="#B71C1C" strokeWidth="1.5" />
        <line x1="60" y1="135" x2="65" y2="148" stroke="#FFF" strokeWidth="1" opacity="0.5" />
        <line x1="80" y1="138" x2="85" y2="151" stroke="#FFF" strokeWidth="1" opacity="0.5" />
        <line x1="100" y1="139" x2="105" y2="152" stroke="#FFF" strokeWidth="1" opacity="0.5" />
        <line x1="120" y1="138" x2="125" y2="151" stroke="#FFF" strokeWidth="1" opacity="0.5" />
        <line x1="140" y1="135" x2="145" y2="148" stroke="#FFF" strokeWidth="1" opacity="0.5" />
      </g>
    ),
    // === レア ===
    'top-hat': (key) => (
      <g key={key}>
        <ellipse cx="100" cy="48" rx="42" ry="6" fill="#212121" stroke="#000" strokeWidth="1" />
        <rect x="72" y="15" width="56" height="35" fill="#212121" stroke="#000" strokeWidth="1.5" />
        <rect x="72" y="38" width="56" height="6" fill="#7B1FA2" />
        <ellipse cx="125" cy="42" rx="3" ry="3" fill="#FFD700" />
        <rect x="74" y="18" width="3" height="20" fill="#FFF" opacity="0.15" />
      </g>
    ),
    'sparkle-cape': (key) => (
      <g key={key}>
        <path d="M40 80 Q15 130 30 175 L100 165 L170 175 Q185 130 160 80 Q130 100 100 100 Q70 100 40 80 Z" fill="url(#capeGrad)" stroke="#5E35B1" strokeWidth="2" />
        <defs>
          <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C4DFF" />
            <stop offset="50%" stopColor="#9575CD" />
            <stop offset="100%" stopColor="#5E35B1" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="120" r="2" fill="#FFF" opacity="0.9" />
        <circle cx="80" cy="135" r="1.5" fill="#FFD700" opacity="0.9" />
        <circle cx="120" cy="130" r="2" fill="#FFF" opacity="0.9" />
        <circle cx="150" cy="125" r="1.5" fill="#FFD700" opacity="0.9" />
        <circle cx="100" cy="150" r="2" fill="#FFF" opacity="0.9" />
        <circle cx="65" cy="155" r="1.5" fill="#FFD700" opacity="0.9" />
        <circle cx="135" cy="155" r="2" fill="#FFF" opacity="0.9" />
      </g>
    ),
    butterfly: (key) => (
      <g key={key}>
        <ellipse cx="60" cy="35" rx="9" ry="11" fill="#FF80AB" stroke="#C2185B" strokeWidth="1.5" transform="rotate(-25 60 35)" />
        <ellipse cx="60" cy="48" rx="6" ry="8" fill="#FF80AB" stroke="#C2185B" strokeWidth="1.5" transform="rotate(-25 60 48)" />
        <ellipse cx="78" cy="32" rx="9" ry="11" fill="#FF80AB" stroke="#C2185B" strokeWidth="1.5" transform="rotate(25 78 32)" />
        <ellipse cx="78" cy="45" rx="6" ry="8" fill="#FF80AB" stroke="#C2185B" strokeWidth="1.5" transform="rotate(25 78 45)" />
        <line x1="69" y1="28" x2="69" y2="48" stroke="#3E2723" strokeWidth="2" />
        <circle cx="65" cy="22" r="1" fill="#3E2723" />
        <circle cx="73" cy="22" r="1" fill="#3E2723" />
        <circle cx="60" cy="38" r="1.5" fill="#FFF" opacity="0.8" />
        <circle cx="78" cy="35" r="1.5" fill="#FFF" opacity="0.8" />
      </g>
    ),
    'candy-wand': (key) => (
      <g key={key}>
        <line x1="170" y1="100" x2="180" y2="155" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" />
        <circle cx="168" cy="92" r="11" fill="#FF80AB" stroke="#C2185B" strokeWidth="1.5" />
        <path d="M158 92 Q168 82 178 92 Q168 102 158 92" fill="#FFF" opacity="0.8" />
        <circle cx="164" cy="88" r="2.5" fill="#FFF" opacity="0.9" />
        <line x1="158" y1="80" x2="156" y2="76" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="178" y1="80" x2="180" y2="76" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="168" y1="76" x2="168" y2="72" stroke="#FFD700" strokeWidth="1.5" />
      </g>
    ),
    // === エピック ===
    'royal-crown': (key) => (
      <g key={key}>
        <path d="M62 50 L67 18 L80 38 L100 8 L120 38 L133 18 L138 50 Z" fill="url(#crownGrad)" stroke="#FF6F00" strokeWidth="2" />
        <defs>
          <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>
        <rect x="62" y="48" width="76" height="6" fill="#FFB300" stroke="#FF6F00" strokeWidth="1.5" />
        <circle cx="100" cy="20" r="5" fill="#E91E63" stroke="#FFF" strokeWidth="1" />
        <circle cx="80" cy="40" r="4" fill="#2196F3" stroke="#FFF" strokeWidth="1" />
        <circle cx="120" cy="40" r="4" fill="#4CAF50" stroke="#FFF" strokeWidth="1" />
        <circle cx="70" cy="48" r="2.5" fill="#FFF" />
        <circle cx="100" cy="48" r="2.5" fill="#FFF" />
        <circle cx="130" cy="48" r="2.5" fill="#FFF" />
        <circle cx="100" cy="22" r="1.5" fill="#FFF" opacity="0.9" />
      </g>
    ),
    'unicorn-horn': (key) => (
      <g key={key}>
        <defs>
          <linearGradient id="hornGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF" />
            <stop offset="50%" stopColor="#E1BEE7" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>
        </defs>
        <path d="M95 50 L100 5 L105 50 Z" fill="url(#hornGrad)" stroke="#7B1FA2" strokeWidth="1.5" />
        <path d="M97 45 Q100 42 103 45" fill="none" stroke="#7B1FA2" strokeWidth="1" />
        <path d="M97 35 Q100 32 103 35" fill="none" stroke="#7B1FA2" strokeWidth="1" />
        <path d="M97 25 Q100 22 103 25" fill="none" stroke="#7B1FA2" strokeWidth="1" />
        <circle cx="100" cy="10" r="2" fill="#FFF" />
        <circle cx="88" cy="20" r="1.5" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="112" cy="22" r="1.5" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="92" cy="35" r="1" fill="#E1BEE7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="108" cy="38" r="1" fill="#E1BEE7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    ),
  };

  // カテゴリ順に並び替えるためのマップ
  const categoryMap: Record<string, string> = {
    ribbon: 'head',
    glasses: 'face',
    'heart-cheeks': 'face',
    scarf: 'body',
    'top-hat': 'head',
    'sparkle-cape': 'body',
    butterfly: 'head',
    'candy-wand': 'accessory',
    'royal-crown': 'head',
    'unicorn-horn': 'head',
  };

  const sorted = [...equippedIds].sort(
    (a, b) => order.indexOf(categoryMap[a] ?? 'head') - order.indexOf(categoryMap[b] ?? 'head')
  );

  return (
    <>
      {sorted.map((id) => renderers[id]?.(id) ?? null)}
    </>
  );
}
