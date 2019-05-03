# meme-gen
A Node.JS module to create images with overlays

# Installation
`npm install @nirewen/meme-gen`

# Example
`npm run example` or `node example`

Check output in [`./example/out/result.png`](https://github.com/nirewen/meme-gen/blob/master/example/out/result.png)

# Points

* The image need points in which it will follow to draw on top of the background
* Each Box object have a `points` parameter which is an Array of arrays

![points](https://i.imgur.com/m4ruZah.png)

For example, yellow, you need to provide X and Y of it:
```javascript
new Box([
    [yellow.x, yellow.y], [red.x, red.y], // here you provide the rest of the points
    [blue.x, blue.y], [green.x, green.y]              // for each point of the box
])
```

You can provide multiple boxes if your template needs more than one image

# Templates

You can find templates in the [ShitpostBot 5000's website](https://www.shitpostbot.com/gallery/templates), aswell as overlays.