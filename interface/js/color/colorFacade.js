async function getColors(id) {
    date1 = new Date();
    img = document.getElementById(id) 
    if(img == null) return
    const colorThief = new ColorThief();
    date2 = new Date();
    colors = await colorThief.getPalette(img)
    date3 = new Date();
    primeColor = await colorThief.getColor(img)
    date4 = new Date();
    primeColorInverse = getInverseColor(primeColor)
    date5 = new Date();
    console.log("prime: rgb(" + primeColor[0] + ", " + primeColor[1] + ", " + primeColor[2] + ")")
    console.log("inverseprime: rgb(" + primeColorInverse[0] + ", " + primeColorInverse[1] + ", " + primeColorInverse[2] + ")")
    brightestColor = getBrightestColor([primeColor, primeColorInverse])
    date6 = new Date();
    closestColor = getClosestColor(brightestColor, colors)
    date7 = new Date();

    console.log('Execution time1: %dms', date2-date1)
    console.log('Execution time2: %dms', date3-date2)
    console.log('Execution time3: %dms', date4-date3)
    console.log('Execution time4: %dms', date5-date4)
    console.log('Execution time5: %dms', date6-date5)
    console.log('Execution time6: %dms', date7-date6)
    console.log('Execution time all: %dms', date7-date1)

    return getColorString(closestColor)
}