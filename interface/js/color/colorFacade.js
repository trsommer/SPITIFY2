async function getColors(id) {
    img = document.getElementById(id) 
    if(img == null) return
    await img.decode()
    const colorThief = new ColorThief();
    colors = await colorThief.getPalette(img)
    primeColor = await colorThief.getColor(img)
    bestColor = getBestColor(primeColor, colors, 0.4)
    console.log("rgb(" + bestColor[0] + ", " + bestColor[1] + ", " + bestColor[2] + ")"); 
    return getColorString(bestColor)
}