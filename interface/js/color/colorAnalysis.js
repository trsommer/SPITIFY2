function getColorString(color) {
    return "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")"
}

function getInverseColor(color) {
    r = 255 - color[0]
    g = 255 - color[1]
    b = 255 - color[2]

    inverseColor = [r,g,b]
    return inverseColor
}

function getColorDistance(color1, color2) {
    r = color2[0] - color1[0]
    g = color2[1] - color1[1]
    b = color2[2] - color1[2]
    distance = Math.sqrt(Math.pow(r, 2) + Math.pow(g, 2) + Math.pow(b, 2))

    return distance
}

function getClosestColor(compareColor, colors) {
    closestColor = null
    smallestDistance = 100000

    for (let index = 0; index < colors.length; index++) {
        const color = colors[index];
        colorDistance = getColorDistance(compareColor, color)

        if (colorDistance < smallestDistance) {
            closestColor = color
            smallestDistance = colorDistance
        }
    }

    return closestColor
}

function colorHSLconversion(color) {
    r = color[0] / 255, g = color[1] / 255, b = color[2] / 255
    
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }
    
        h /= 6;
    }
    
    return [ h, s, l ];
}


function getBrightestColor(colors) {
    biggestLightness = 0
    brightestColor = null

    for (let index = 0; index < colors.length; index++) {
        const color = colors[index];
        hslColor = colorHSLconversion(color)

        if (hslColor[2] > biggestLightness) {
            brightestColor = color
            biggestLightness = hslColor[2]
        }

    }

    return brightestColor
}

