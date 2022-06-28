/* eslint-disable @typescript-eslint/no-explicit-any */
export class HueTintAndOutlineFXPipeline extends Phaser.Renderer.WebGL.Pipelines.SpriteFXPipeline {
  public static readonly KEY = "HueTintFXPipeline";

  private _tintColor = new Phaser.Display.Color();

  private _outline = 0;
  private _outlineColor = new Phaser.Display.Color();

  constructor(game: Phaser.Game) {
    super({
      game: game,
      renderTarget: true,
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform vec2 uTextureSize;
        uniform vec3 tintColor;
        uniform int outline;
        uniform vec3 outlineColor;
        varying vec2 outTexCoord;
        
        vec3 rgb2hsv(vec3 c)
        {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        vec3 hsv2rgb(vec3 c)
        {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        void main(void)
        {
            vec4 srcColor;
            vec4 outColor;
            vec3 hsvColor;
            vec3 rgbColor;
            srcColor = texture2D(uMainSampler, outTexCoord);
            hsvColor = rgb2hsv(srcColor.rgb);
            if (hsvColor.g == 0.0 && srcColor.a == 1. && !(tintColor.r == 0.0 && tintColor.g == 0.0 && tintColor.b == 0.0))
            {
              vec3 color = hsv2rgb(hsvColor);
              rgbColor = color * tintColor;
            } else {
              rgbColor = hsv2rgb(hsvColor);
            }
            outColor = vec4(rgbColor.r, rgbColor.g, rgbColor.b, srcColor.a);
            if(outline == 1) {
              vec2 distance = vec2(2.0, 2.0) / uTextureSize;
              float upAlpha = texture2D(uMainSampler, outTexCoord + vec2(0.0, distance.y)).a;
              float leftAlpha = texture2D(uMainSampler, outTexCoord + vec2(-distance.x, 0.0)).a;
              float downAlpha = texture2D(uMainSampler, outTexCoord + vec2(0.0, -distance.y)).a;
              float rightAlpha = texture2D(uMainSampler, outTexCoord + vec2(distance.x, 0.0)).a;
              if (srcColor.a == 0.0 && max(max(upAlpha, downAlpha), max(leftAlpha, rightAlpha)) == 1.0)
              {
                outColor = vec4(outlineColor, 1.0);
              }
            }
            gl_FragColor = outColor; 
        }
        `,
    });
  }

  onDrawSprite(obj: Phaser.GameObjects.Sprite) {
    const hueTint = (obj.pipelineData as any).hueTint;

    const outline = (obj.pipelineData as any).outline;
    const outlineColor = (obj.pipelineData as any).outlineColor;

    let tintColor = hueTint ? hueTint : 0x000000;
    if (typeof tintColor === "number") {
      tintColor = Phaser.Display.Color.IntegerToRGB(tintColor);
    }

    if (outline) {
      this._outline = 1;

      let _outlineColor = outlineColor ?? 0x000000;
      if (typeof _outlineColor === "number") {
        _outlineColor = Phaser.Display.Color.IntegerToRGB(outlineColor);
      }

      this._outlineColor.setFromRGB(_outlineColor);
    } else {
      this._outline = 0;
    }

    this._tintColor.setFromRGB(tintColor);
  }

  onDraw(renderTarget: Phaser.Renderer.WebGL.RenderTarget) {
    this.set2f("uTextureSize", this.renderer.width, this.renderer.height);
    this.set3f("tintColor", this._tintColor.redGL, this._tintColor.greenGL, this._tintColor.blueGL);

    this.set1i("outline", this._outline);
    this.set3f("outlineColor", this._outlineColor.redGL, this._outlineColor.greenGL, this._outlineColor.blueGL);

    this.drawToGame(renderTarget);
  }
}
