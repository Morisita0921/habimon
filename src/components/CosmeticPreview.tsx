import CosmeticOverlay from './CosmeticOverlay';

interface CosmeticPreviewProps {
  cosmeticId: string;
  size?: number;
}

// アイテムを単独でプレビュー表示する（ショップ・クローゼット用）
export default function CosmeticPreview({ cosmeticId, size = 80 }: CosmeticPreviewProps) {
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9}>
      <CosmeticOverlay equippedIds={[cosmeticId]} />
    </svg>
  );
}
