export class MultiHueTintPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  public static readonly KEY = "MultiHueTintPipeline";
  constructor(game: Phaser.Game) {
    super({
      game: game,
      fragShader: `
        #define SHADER_NAME PHASER_MULTI_V2_FS
        #define numTextures %count%
        precision highp float;
        uniform sampler2D uMainSampler[%count%];
        varying vec2 outTexCoord;
        varying float outTexId;
        varying float outTintEffect;
        varying vec4 outTint;
        
        vec4 getSampler (int index, vec2 uv)
        {
            for (int i = 0; i < numTextures; ++i)
            {
                if (i == index)
                {
                    return texture2D(uMainSampler[i], uv);
                }
            }
        
            //  Return black
            return vec4(0);
        }
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
        
        void main ()
        {
            vec4 srcColor;
            vec3 hsvColor;
            vec3 rgbColor;
            vec4 texel = vec4(outTint.bgr * outTint.a, outTint.a);
            srcColor = getSampler(int(outTexId), outTexCoord);
            vec4 color = srcColor * texel;
            //  Multiply texture tint
            vec3 hueTintColor = outTint.bgr;
            if (hueTintColor != vec3(0.0, 0.0, 0.0)) {
              hsvColor = rgb2hsv(srcColor.rgb);
              if (hsvColor.g == 0.0 && srcColor.a == 1.)
              {
                vec3 color = hsv2rgb(hsvColor);
                rgbColor = color * hueTintColor;
              } else {
                rgbColor = hsv2rgb(hsvColor);
              }
              color = vec4(rgbColor.r, rgbColor.g, rgbColor.b, srcColor.a);
            }
            gl_FragColor = color;
        }
        `,
    });
  }
}
