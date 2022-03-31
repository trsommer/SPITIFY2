function lineIntersection(line1,line2) {

    var det, gamma, lambda;
    det = (line1.p2.x - line1.p1.x) * (line2.p2.y - line2.p1.y) - (line2.p2.x - line2.p1.x) * (line1.p2.y - line1.p1.y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((line2.p2.y - line2.p1.y) * (line2.p2.x - line1.p1.x) + (line2.p1.x - line2.p2.x) * (line2.p2.y - line1.p1.y)) / det;
      gamma = ((line1.p1.y - line1.p2.y) * (line2.p2.x - line1.p1.x) + (line1.p2.x - line1.p1.x) * (line2.p2.y - line1.p1.y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}