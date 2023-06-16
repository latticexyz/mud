import { Sprites } from "../../layers/phaser/constants";
import atlasJson from "../../../public/assets/atlases/atlas.json";
import { useMUD } from "../../store";

export const SpriteImage = ({ spriteKey, scale }: { spriteKey: Sprites; scale?: number }) => {
  const {
    phaserLayer: {
      scenes: {
        Main: {
          config: { sprites },
        },
      },
    },
  } = useMUD();

  const imageScale = scale ?? 1;
  const sprite = sprites[spriteKey];
  const frame = sprite.frame;

  const atlasDimensions = atlasJson.textures[0].size;
  const spriteAtlasEntry = atlasJson.textures[0].frames.find((atlasFrame) => atlasFrame.filename === frame);

  if (!spriteAtlasEntry) throw new Error(`Could not find sprite ${spriteKey} in atlas`);

  const containerStyle = {
    width: `${spriteAtlasEntry.sourceSize.w * imageScale}px`,
    height: `${spriteAtlasEntry.sourceSize.h * imageScale}px`,
    overflow: "hidden",
    position: "relative",
  } as Record<string, string>;

  const imgStyle = {
    imageRendering: "pixelated",
    maxWidth: `${atlasDimensions.w * imageScale}px`,
    maxHeight: `${atlasDimensions.h * imageScale}px`,
    height: `${atlasDimensions.h * imageScale}px`,
    width: `${atlasDimensions.w * imageScale}px`,
    marginTop: `-${spriteAtlasEntry.frame.y * imageScale}px`,
    marginLeft: `-${spriteAtlasEntry.frame.x * imageScale}px`,
    clipPath: `inset(${spriteAtlasEntry.frame.y + 1}px ${
      atlasDimensions.w - (spriteAtlasEntry.frame.x + spriteAtlasEntry.sourceSize.w)
    }px ${atlasDimensions.h - (spriteAtlasEntry.frame.y + spriteAtlasEntry.sourceSize.h)}px ${
      spriteAtlasEntry.frame.x
    }px)`,
  } as Record<string, string>;

  return (
    <div style={containerStyle}>
      <img src="assets/atlases/atlas.png" style={imgStyle} />
    </div>
  );
};
