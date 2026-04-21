import { motion } from 'framer-motion';
import type { CharacterImages } from '../types';
import { getCharacterById, getCharacterImageForLevel } from '../data/characters';

interface CharacterProps {
  level: number;
  size?: number;
  animate?: boolean;
  images?: CharacterImages;
  equippedCosmetics?: string[]; // （レガシー: 現在は表示しない）
  selectedCharacterId?: string; // キャラクターレジストリからの選択
}

export default function Character({ level, size = 200, animate = true, images, selectedCharacterId }: CharacterProps) {
  // 優先順位: 1) selectedCharacterId (レジストリ) → 2) カスタム images (旧システム) → 3) デフォルトSVG
  const registryCharacter = getCharacterById(selectedCharacterId);
  const registryImageUrl = registryCharacter
    ? getCharacterImageForLevel(registryCharacter, level)
    : undefined;
  const customImageUrl = images?.[`lv${level}` as keyof CharacterImages];
  const imageUrl = registryImageUrl || customImageUrl;

  if (imageUrl) {
    return (
      <motion.div
        animate={animate ? { y: [0, -8, 0] } : undefined}
        transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{ width: size, height: size, margin: '0 auto' }}
        className="flex items-center justify-center relative"
      >
        <img
          src={imageUrl}
          alt={`レベル${level}のキャラクター`}
          className="w-full h-full object-contain drop-shadow-lg"
          style={{ maxWidth: size, maxHeight: size }}
        />
      </motion.div>
    );
  }

  // デフォルトSVGキャラクター
  const renderLevel1 = () => (
    <g>
      <ellipse cx="100" cy="110" rx="55" ry="65" fill="#FFF5E0" stroke="#FFD699" strokeWidth="3" />
      <path d="M55 85 Q100 60 145 85" fill="none" stroke="#FFD699" strokeWidth="2" strokeDasharray="8,4" />
      <circle cx="82" cy="105" r="6" fill="#333" />
      <circle cx="118" cy="105" r="6" fill="#333" />
      <circle cx="84" cy="103" r="2" fill="#FFF" />
      <circle cx="120" cy="103" r="2" fill="#FFF" />
    </g>
  );

  const renderLevel2 = () => (
    <g>
      <ellipse cx="100" cy="100" rx="50" ry="55" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="3" />
      <ellipse cx="45" cy="105" rx="12" ry="8" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="2" />
      <ellipse cx="155" cy="105" rx="12" ry="8" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="2" />
      <ellipse cx="80" cy="155" rx="14" ry="10" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="2" />
      <ellipse cx="120" cy="155" rx="14" ry="10" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="2" />
      <circle cx="82" cy="90" r="8" fill="#FFF" />
      <circle cx="118" cy="90" r="8" fill="#FFF" />
      <circle cx="84" cy="91" r="5" fill="#333" />
      <circle cx="120" cy="91" r="5" fill="#333" />
      <circle cx="86" cy="89" r="2" fill="#FFF" />
      <circle cx="122" cy="89" r="2" fill="#FFF" />
      <path d="M90 110 Q100 120 110 110" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="108" r="8" fill="#FFCDD2" opacity="0.5" />
      <circle cx="132" cy="108" r="8" fill="#FFCDD2" opacity="0.5" />
    </g>
  );

  const renderLevel3 = () => (
    <g>
      <ellipse cx="100" cy="95" rx="55" ry="58" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="3" />
      <ellipse cx="60" cy="50" rx="15" ry="22" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" transform="rotate(-15 60 50)" />
      <ellipse cx="140" cy="50" rx="15" ry="22" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" transform="rotate(15 140 50)" />
      <ellipse cx="40" cy="100" rx="14" ry="10" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" />
      <ellipse cx="160" cy="100" rx="14" ry="10" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" />
      <ellipse cx="78" cy="152" rx="16" ry="12" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" />
      <ellipse cx="122" cy="152" rx="16" ry="12" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="2" />
      <circle cx="80" cy="85" r="10" fill="#FFF" />
      <circle cx="120" cy="85" r="10" fill="#FFF" />
      <circle cx="83" cy="86" r="6" fill="#333" />
      <circle cx="123" cy="86" r="6" fill="#333" />
      <circle cx="85" cy="83" r="2.5" fill="#FFF" />
      <circle cx="125" cy="83" r="2.5" fill="#FFF" />
      <path d="M88 108 Q100 122 112 108" fill="#FF8A80" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="62" cy="102" r="9" fill="#FFCDD2" opacity="0.5" />
      <circle cx="138" cy="102" r="9" fill="#FFCDD2" opacity="0.5" />
      <ellipse cx="100" cy="115" rx="25" ry="20" fill="#C8E6C9" />
    </g>
  );

  const renderLevel4 = () => (
    <g>
      <path d="M40 75 Q30 120 50 160 L100 150 L150 160 Q170 120 160 75 Z" fill="#7E57C2" opacity="0.3" />
      <ellipse cx="100" cy="95" rx="55" ry="58" fill="#CE93D8" stroke="#AB47BC" strokeWidth="3" />
      <ellipse cx="38" cy="100" rx="16" ry="12" fill="#CE93D8" stroke="#AB47BC" strokeWidth="2" />
      <ellipse cx="162" cy="100" rx="16" ry="12" fill="#CE93D8" stroke="#AB47BC" strokeWidth="2" />
      <ellipse cx="78" cy="152" rx="18" ry="13" fill="#CE93D8" stroke="#AB47BC" strokeWidth="2" />
      <ellipse cx="122" cy="152" rx="18" ry="13" fill="#CE93D8" stroke="#AB47BC" strokeWidth="2" />
      <circle cx="80" cy="85" r="11" fill="#FFF" />
      <circle cx="120" cy="85" r="11" fill="#FFF" />
      <circle cx="83" cy="86" r="7" fill="#333" />
      <circle cx="123" cy="86" r="7" fill="#333" />
      <circle cx="86" cy="83" r="3" fill="#FFF" />
      <circle cx="126" cy="83" r="3" fill="#FFF" />
      <path d="M88 108 Q100 125 112 108" fill="#FF8A80" stroke="#333" strokeWidth="1.5" />
      <circle cx="62" cy="102" r="10" fill="#F8BBD0" opacity="0.5" />
      <circle cx="138" cy="102" r="10" fill="#F8BBD0" opacity="0.5" />
      <ellipse cx="100" cy="118" rx="28" ry="22" fill="#E1BEE7" />
      <text x="100" y="124" textAnchor="middle" fontSize="14" fill="#AB47BC">♡</text>
    </g>
  );

  const renderLevel5 = () => (
    <g>
      <circle cx="100" cy="100" r="90" fill="url(#aura)" opacity="0.3" />
      <path d="M35 80 Q10 50 25 30 Q45 55 50 75 Z" fill="#FFF9C4" stroke="#FFD54F" strokeWidth="1" opacity="0.8" />
      <path d="M165 80 Q190 50 175 30 Q155 55 150 75 Z" fill="#FFF9C4" stroke="#FFD54F" strokeWidth="1" opacity="0.8" />
      <ellipse cx="100" cy="95" rx="55" ry="58" fill="#FFD54F" stroke="#FFA000" strokeWidth="3" />
      <ellipse cx="36" cy="100" rx="18" ry="13" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
      <ellipse cx="164" cy="100" rx="18" ry="13" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
      <ellipse cx="78" cy="152" rx="18" ry="14" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
      <ellipse cx="122" cy="152" rx="18" ry="14" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
      <circle cx="80" cy="85" r="12" fill="#FFF" />
      <circle cx="120" cy="85" r="12" fill="#FFF" />
      <circle cx="83" cy="86" r="7" fill="#333" />
      <circle cx="123" cy="86" r="7" fill="#333" />
      <circle cx="86" cy="83" r="3" fill="#FFF" />
      <circle cx="126" cy="83" r="3" fill="#FFF" />
      <circle cx="78" cy="82" r="1.5" fill="#FFF" opacity="0.6" />
      <circle cx="118" cy="82" r="1.5" fill="#FFF" opacity="0.6" />
      <path d="M85 108 Q100 128 115 108" fill="#FF8A80" stroke="#333" strokeWidth="2" />
      <circle cx="60" cy="102" r="11" fill="#FFCDD2" opacity="0.6" />
      <circle cx="140" cy="102" r="11" fill="#FFCDD2" opacity="0.6" />
      <ellipse cx="100" cy="118" rx="30" ry="24" fill="#FFF8E1" />
      <text x="100" y="122" textAnchor="middle" fontSize="16" fill="#FFA000">★</text>
      {[
        { x: 30, y: 30, delay: 0 },
        { x: 170, y: 25, delay: 0.5 },
        { x: 20, y: 130, delay: 1 },
        { x: 180, y: 120, delay: 1.5 },
        { x: 100, y: 5, delay: 0.8 },
      ].map((s, i) => (
        <g key={i}>
          <line x1={s.x - 6} y1={s.y} x2={s.x + 6} y2={s.y} stroke="#FFD700" strokeWidth="2">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin={`${s.delay}s`} repeatCount="indefinite" />
          </line>
          <line x1={s.x} y1={s.y - 6} x2={s.x} y2={s.y + 6} stroke="#FFD700" strokeWidth="2">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin={`${s.delay}s`} repeatCount="indefinite" />
          </line>
        </g>
      ))}
      <defs>
        <radialGradient id="aura">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );

  const renderCharacter = () => {
    switch (level) {
      case 1: return renderLevel1();
      case 2: return renderLevel2();
      case 3: return renderLevel3();
      case 4: return renderLevel4();
      case 5: return renderLevel5();
      default: return renderLevel1();
    }
  };

  return (
    <motion.div
      animate={animate ? { y: [0, -8, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{ width: size, height: size, margin: '0 auto' }}
    >
      <svg
        viewBox="0 0 200 180"
        width={size}
        height={size * 0.9}
        role="img"
        aria-label={`レベル${level}のキャラクター`}
      >
        {renderCharacter()}
      </svg>
    </motion.div>
  );
}
