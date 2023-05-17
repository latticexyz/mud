# Art Tooling

This package provides a set of tools for working with sprite sheets and tilesets.

## Sprites

To create a new Sprite animation you need to define a new folder structure inside of the `sprites` folder. Inside of that folder, create a series of images defining the frames of the animation. The name of the folder will be the name of the animation. The names of the images should be the frame number.

Example:
```
  sprites/
    player/
      walk/
        0.png
        1.png
        2.png
        3.png
        4.png
```

## Tilesets

Tilesets are generated using the (Tiled Map Editor)[https://www.mapeditor.org/]. An example is provided in `tilesets/world.tsx`.

## Exporting

Export does a few things:
  1. Creates a single image sprite atlas for all of your animations
  2. Creates an atlas manifest json file that maps the animation names to the frames in the atlas
  3. Creates Typescript types for your Tilesets
  4. Moves all created files into your game client package

To export, run `pnpm export` from the root of this project.