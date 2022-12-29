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

function getBestColor(colorBestMatch, colors, darknessThreshold) {
    const colorBestMatchHSL = colorHSLconversion(colorBestMatch)

    if (colorBestMatchHSL[2] > darknessThreshold) {
        return colorBestMatch;
    }

    var bestMatch = null;
    var bestMatchDistance = 100000;


    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const colorHSL = colorHSLconversion(color)
        const lightness = colorHSL[2];

        if (lightness < darknessThreshold) {
            continue;
        }

        const distance = getColorDistance(colorBestMatch, color);

        if (distance < bestMatchDistance) {
            bestMatch = color;
            bestMatchDistance = distance;
        }

    }

    if (bestMatch != null) {
        return bestMatch;
    } else {
        return [255, 255, 255];
    }

}

function getBestColorNew(colors, threshHold) {
    bestColor = null
    bestColorHSL = null
    score = -1
    
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const colorHSL = colorHSLconversion(color)
        lightnessThreshgold = 1 - threshHold
        darknessThreshold = threshHold

        if (colorHSL[2] > lightnessThreshgold || colorHSL[2] < darknessThreshold) {
            continue;
        }

        colorScore = (colors.length - i) * 2 + colorHSL[1] * 35 //+ (1 - Math.abs(0.5 - colorHSL[2]) * 4) * 25

        colorString = getColorString(color)
        hslString = colorHSL[0] + ", " + colorHSL[1] + ", " + colorHSL[2]
        textColor = "black"
        if (colorHSL[2] < 0.2) {
            textColor = "white"
        }
        baseStyle = "color: " + textColor + "; font-size: 20px; font-family: monospace; background-color: " + colorString + ";"
        console.log("%c" + colorString + " " + hslString + " " + colorScore, baseStyle)



        if (colorScore > score) {
            bestColor = color
            bestColorHSL = colorHSL
            score = colorScore
        }
    }

    console.log(getColorString(bestColor) + ", " + bestColorHSL[2] + ", " + bestColorHSL[1] + ", " + score);

    return bestColor
}