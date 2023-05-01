class Liver {
  constructor(liver_img, cuts_img) {
    this.controlPoints = [[50,265], [150,265]];  // define orientation, stretching
    this.collisionPoints = [[-60, -40], [70, -20], [-60, 40]];
    this.origControlLength = this.currentControlLength();
    
    this.grabbed = false;
    this.grabOffsets = [[0,0], [0,0]];
    
    this.liver_img = liver_img;
    this.cuts_img = cuts_img;
    
    this.health = 1.0;
    
    this.stretched = false;
    
  }
  
  drawSelf() {
    this.drawLiver();
    //this.drawControlPoints();
    //this.drawCollisionPoints();
  }
  
  drawControlPoints() {
    stroke(128 * this.currentControlLength() / this.origControlLength,0,0);
    line(this.controlPoints[0][0], this.controlPoints[0][1], this.controlPoints[1][0], this.controlPoints[1][1]);
    
    fill(0,0,255);
    stroke(255,255,255);
    strokeWeight(5);
    for (let p = 0; p < this.controlPoints.length; p++) {
      ellipse(this.controlPoints[p][0], this.controlPoints[p][1], 10, 10);
    }
  }
  
  drawCollisionPoints() {
    fill(255,0,0);
    stroke(255,255,255);
    strokeWeight(5);
    let rotation = atan2(this.controlPoints[1][1] - this.controlPoints[0][1], this.controlPoints[1][0] - this.controlPoints[0][0]);
    let controlCenter = [(this.controlPoints[0][0] + this.controlPoints[1][0]) / 2, (this.controlPoints[0][1] + this.controlPoints[1][1]) / 2];
    let stretch = this.currentControlLength() / this.origControlLength;
    
    for (let p = 0; p < this.collisionPoints.length; p++) {
      // https://academo.org/demos/rotation-about-point/
      let newx = this.collisionPoints[p][0] * stretch * cos(rotation) - this.collisionPoints[p][1] / stretch * sin(rotation);
      let newy = this.collisionPoints[p][1] / stretch * cos(rotation) + this.collisionPoints[p][0] * stretch * sin(rotation);
      ellipse(newx + controlCenter[0], newy + controlCenter[1], 10, 10);
    }
  }
  
  drawLiver() {
    let rotation = atan2(this.controlPoints[1][1] - this.controlPoints[0][1], this.controlPoints[1][0] - this.controlPoints[0][0]);
    let controlCenter = [(this.controlPoints[0][0] + this.controlPoints[1][0]) / 2, (this.controlPoints[0][1] + this.controlPoints[1][1]) / 2];
    let stretch = this.currentControlLength() / this.origControlLength;
    let axisDims = this.getAxisDims();
    push();
    imageMode(CENTER);
    
    translate(controlCenter[0], controlCenter[1]);
    rotate(rotation);
    scale(stretch, 1/stretch);
    
    image(this.liver_img, 0,0, axisDims[0] * 1.2, axisDims[1] * 1.2);
    tint(255,(1-this.health)*255);
    image(this.cuts_img, 0,0, axisDims[0] * 1.2, axisDims[1] * 1.2);
    
    pop();
  }
  
  getAxisDims() {
    // Get bounds before any rotation or stretching is applied
    return [this.collisionPoints[1][0] - this.collisionPoints[0][0], this.collisionPoints[2][1] - this.collisionPoints[0][1]];
  }
  
  triangleArea(pt1, pt2, pt3) {
    // https://www.mathopenref.com/coordtrianglearea.html
    return abs(pt1[0] * (pt2[1] - pt3[1]) + pt2[0] * (pt3[1] - pt1[1]) + pt3[0] * (pt1[1] - pt2[1])) / 2
  }
  
  isInsideTriangle(pt, tri) {
    // https://www.tutorialspoint.com/Check-whether-a-given-point-lies-inside-a-Triangle
    let area = this.triangleArea(tri[0], tri[1], tri[2]);
    let area1 = this.triangleArea(pt, tri[1], tri[2]);
    let area2 = this.triangleArea(tri[0], pt, tri[2]);
    let area3 = this.triangleArea(tri[0], tri[1], pt);
    return abs(area - (area1 + area2 + area3)) < 0.1;  // 0.1 is an arbitrary epsilon value that helps ease float imprecision
  }
  
  isInsideCollider(pt) {
    let rotation = atan2(this.controlPoints[1][1] - this.controlPoints[0][1], this.controlPoints[1][0] - this.controlPoints[0][0]);
    let controlCenter = this.currentControlCenter();
    let stretch = this.currentControlLength() / this.origControlLength;
    
    let currentCollider = [];
    for (let p = 0; p < this.collisionPoints.length; p++) {
      let newx = this.collisionPoints[p][0] * stretch * cos(rotation) - this.collisionPoints[p][1] / stretch * sin(rotation);
      let newy = this.collisionPoints[p][1] / stretch * cos(rotation) + this.collisionPoints[p][0] * stretch * sin(rotation);
      currentCollider.push([newx + controlCenter[0], newy + controlCenter[1]]);
    }
    return this.isInsideTriangle(pt, currentCollider);
  }
  
  grab(grab1_pos, grab2_pos) {
    // Sets grabbed and calculates offsets
    this.grabbed = true;
    
    if (pow(this.controlPoints[0][0] - grab1_pos[0],2) + pow(this.controlPoints[0][1] - grab1_pos[1],2) < pow(this.controlPoints[0][0] - grab2_pos[0],2) + pow(this.controlPoints[0][1] - grab2_pos[1],2)) {
      // grab1_pos is closer to controlPoints[0] than grab2_pos is
      
      this.grabOffsets[0] = [this.controlPoints[0][0] - grab1_pos[0], this.controlPoints[0][1] - grab1_pos[1]]; // add grab_pos to this to get controlPoints
      this.grabOffsets[1] = [this.controlPoints[1][0] - grab2_pos[0], this.controlPoints[1][1] - grab2_pos[1]]; // grabOffsets[0] always refers to grab1_pos, and grabOffsets[1] always refers to grab2_pos
    } else {
      // grab2_pos is closer to controlPoints[0] than grab1_pos is
      this.grabOffsets[0] = [this.controlPoints[1][0] - grab1_pos[0], this.controlPoints[1][1] - grab1_pos[1]]; 
      this.grabOffsets[1] = [this.controlPoints[0][0] - grab2_pos[0], this.controlPoints[0][1] - grab2_pos[1]]; 
    }
  }
  
  release() {
    this.grabbed = false;
    this.grabOffsets = [[0,0], [0,0]];
  }
  
  updateControlPoints(grab1_pos, grab2_pos) {
    if (!this.grabbed) {
      // if not grabbed, don't update
      return;
    }
    
    this.controlPoints[0][0] = grab1_pos[0] + this.grabOffsets[0][0];
    this.controlPoints[0][1] = grab1_pos[1] + this.grabOffsets[0][1];
    
    this.controlPoints[1][0] = grab2_pos[0] + this.grabOffsets[1][0];
    this.controlPoints[1][1] = grab2_pos[1] + this.grabOffsets[1][1];
    
    this.stretched = false;
    if (abs(this.currentControlLength() / this.origControlLength - 1) > 0.5) {
      this.health -= 0.2 * deltaTime/1000;
      this.stretched = true;
    }
  }
  
  currentControlLength() {
    return sqrt(pow(this.controlPoints[0][0] - this.controlPoints[1][0], 2) + pow(this.controlPoints[0][1] - this.controlPoints[1][1], 2));
  }
  
  currentControlCenter() {
    return [(this.controlPoints[0][0] + this.controlPoints[1][0]) / 2, (this.controlPoints[0][1] + this.controlPoints[1][1]) / 2];
  }
}
