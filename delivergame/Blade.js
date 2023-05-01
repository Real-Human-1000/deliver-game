class Blade {
  constructor(x,y,scale,rot,tex,points) {
    this.pos = [x,y];
    this.scale = scale;
    this.rot = rot;
    this.tex = tex;
    this.points = points;  // Each point will cause damage to the liver if it touches
  }
  
  drawSelf() {
    this.drawTex();
    //this.drawPoints();
  }
  
  drawTex() {
    push();
    imageMode(CENTER);
    translate(this.pos[0], this.pos[1]);
    rotate(this.rot);
    scale(this.scale);
    image(this.tex, 0, 0);
    pop();
  }
  
  drawPoints() {
    fill(200,200,200);
    stroke(255,255,255);
    strokeWeight(2);
    for (let p = 0; p < this.points.length; p++) {
      let newx = this.points[p][0] * this.scale * cos(this.rot) - this.points[p][1] * this.scale * sin(this.rot);
      let newy = this.points[p][1] * this.scale * cos(this.rot) + this.points[p][0] * this.scale * sin(this.rot);
      ellipse(newx + this.pos[0], newy + this.pos[1], 5, 5);
    }
  }
  
  
  getCollider() {
    // Transform all points in this.points into worldspace
    let collider_points = [];
    for (let p = 0; p < this.points.length; p++) {
      let newx = this.points[p][0] * this.scale * cos(this.rot) - this.points[p][1] * this.scale * sin(this.rot);
      let newy = this.points[p][1] * this.scale * cos(this.rot) + this.points[p][0] * this.scale * sin(this.rot);
      collider_points.push([newx + this.pos[0], newy + this.pos[1]]);
    }
    return collider_points;
  }
  
}
