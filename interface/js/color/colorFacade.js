async function getColors(id) {
    img = document.getElementById(id) 
    if(img == null) return
    await img.decode()
    const colorThief = new ColorThief();
    colors = await colorThief.getPalette(img)
    primeColor = await colorThief.getColor(img)
    bestColor = getBestColorNew(colors, 0.25)
    return getColorString(bestColor)
}