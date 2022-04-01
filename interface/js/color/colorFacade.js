async function getColors(id) {
    img = document.getElementById(id) 
    if(img == null) return
    await img.decode()
    const colorThief = new ColorThief();
    colors = await colorThief.getPalette(img)
    primeColor = await colorThief.getColor(img)
    primeColorInverse = getInverseColor(primeColor)
    console.log("prime: rgb(" + primeColor[0] + ", " + primeColor[1] + ", " + primeColor[2] + ")")
    console.log("inverseprime: rgb(" + primeColorInverse[0] + ", " + primeColorInverse[1] + ", " + primeColorInverse[2] + ")")
    brightestColor = getBrightestColor([primeColor, primeColorInverse])
    closestColor = getClosestColor(brightestColor, colors)
    return getColorString(closestColor)
}