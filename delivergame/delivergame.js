// Theme is "Delivery"
// This is a game about literally de-livering
// Removing livers
// This is going to be awful

// many sounds made using beepbox.co


let grab1_pos;
let grab2_pos;
let grabbing = false;
let grab_imgs = [];

let liver;
let liver_img;
let cuts_img;

let background_img;
let scalpel_img;
let scissor_img;

let blades = [];

let scalpel_points = [[266,9], [379,6], [399,11], [378,28], [365,33], [305,33], [287,29], [258,31], [254,26]];  // forms a rough and uneven outline
let scissor_points = [[117, 103], [34, 191], [32, 199], [40,195], [132,116], [135,115], [230,185], [245,193], [239,181], [150,100]];

let text_phrases = [];
let selected_phrase = 0;
let text_scroll = 0;

let add_drips = false;
let drips = [];

let vignette;

let GAME_MODE = 0;
let points = 0;
let livers_delivered = 0;
let countdown = 121;  // seconds

let bg_music;
let sound_effects = [];
let beep;

function preload() {
  grab_imgs.push(loadImage("data/grabberopen.png"));
  grab_imgs.push(loadImage("data/grabberclosed.png"));
  liver_img = loadImage("data/liver.png");
  cuts_img = loadImage("data/cuts.png");
  background_img = loadImage("data/operatingtable.png");
  scalpel_img = loadImage("data/scalpel.png");
  scissor_img = loadImage("data/scissors.png");
  text_phrases = loadStrings("data/text.txt");
  vignette = loadImage("data/vignette.png");
  title_img = loadImage("data/delivery.png");
  bg_music = loadSound("data/smooth.wav");
  sound_effects.push(loadSound("data/slurp1.mp3"));
  sound_effects.push(loadSound("data/slurp2.mp3"));
  sound_effects.push(loadSound("data/hiss1.mp3"));
  sound_effects.push(loadSound("data/hiss2.mp3"));
  beep = loadSound("data/beep.mp3");
}

function setup() {
  createCanvas(800,600);
  
  textFont('monospace');
  
  text_scroll = width + 200;
  text_phrases.splice(0,0,"WASD to move the left grabber, ARROWS to move the right grabber. Space to pick up or release the liver when both grabbers are on top of it. Don't stretch the liver too much, and don't let it touch the blades. Get it to the gray tray on the right. Let's get to de-livering!")

  grab1_pos = [50, 400];
  grab2_pos = [140, 400];
  
  liver = new Liver(liver_img, cuts_img);
  
  for (let sp = 0; sp < scalpel_points.length; sp++) {
    scalpel_points[sp][0] = scalpel_points[sp][0] - 200;
    scalpel_points[sp][1] = scalpel_points[sp][1] - 25;
  }
  for (let sp = 0; sp < scissor_points.length; sp++) {
    scissor_points[sp][0] = scissor_points[sp][0] - 276/2;
    scissor_points[sp][1] = scissor_points[sp][1] - 100;
  }
  
  interpolatePoints(scalpel_points, 50);
  interpolatePoints(scissor_points, 50);
  
  scatterBlades();
  
  bg_music.setLoop(true);
  bg_music.setVolume(0.7);
}


function draw() {
  if (GAME_MODE == 0) {
    image(title_img, 0, 0, width, height);
    push();
    textFont("monospace");
    textSize(30);
    fill(255);
    stroke(0);
    strokeWeight(5);
    textAlign(CENTER);
    text("Click or press any button to begin", width/2, 510);
    pop();
    return;
  }
  
  if (GAME_MODE == 1) {
    countdown -= deltaTime/1000;
    
    image(background_img,0,0,width,height);
    
    move_grab1();
    move_grab2();
    
    add_drips = false;
    
    liver.updateControlPoints(grab1_pos, grab2_pos);
    if (liver.stretched) { add_drips = true; }
    bladeLiverOverlap();
    
    drawBlades();
    animateDrips();
    liver.drawSelf();
    
    if (grabbing) {
      image(grab_imgs[1], grab1_pos[0] - 20, grab1_pos[1] - 20, 40, 40);
      image(grab_imgs[1], grab2_pos[0] - 20, grab2_pos[1] - 20, 40, 40);
    } else {
      image(grab_imgs[0], grab1_pos[0] - 20, grab1_pos[1] - 20, 40, 40);
      image(grab_imgs[0], grab2_pos[0] - 20, grab2_pos[1] - 20, 40, 40);
    }
    
    drawTextScroll();
    
    drawStats();
    
    image(vignette, 0, 0, width, height);
    
    if (countdown <= 0) {
      GAME_MODE = 2;
    }
  }
  
  if (GAME_MODE == 2) {
    image(title_img, 0, 0, width, height);
    drawResults();
  }
}

function drawBlades() {
  for (let b = 0; b < blades.length; b++) {
    blades[b].drawSelf();
  }
}

function move_grab1() {
  if (keyIsDown(87) && grab1_pos[1] > 0) {
    // w
    grab1_pos[1] -= 1;
  }
  if (keyIsDown(65) && grab1_pos[0] > 0) {
    // a
    grab1_pos[0] -= 1;
  }
  
  if (keyIsDown(83) && grab1_pos[1] < height) {
    // s
    grab1_pos[1] += 1;
  }
  if (keyIsDown(68) && grab1_pos[0] < width) {
    // d
    grab1_pos[0] += 1;
  }
}

function move_grab2() {
  if (keyIsDown(UP_ARROW) && grab2_pos[1] > 0) {
    // up arrow
    grab2_pos[1] -= 1;
  }
  if (keyIsDown(LEFT_ARROW) && grab2_pos[0] > 0) {
    // left arrow
    grab2_pos[0] -= 1;
  }
  
  if (keyIsDown(DOWN_ARROW) && grab2_pos[1] < height) {
    // down arrow
    grab2_pos[1] += 1;
  }
  if (keyIsDown(RIGHT_ARROW) && grab2_pos[0] < width) {
    // right arrow
    grab2_pos[0] += 1;
  }
}

function interpolatePoints(points, dist) {
  // Linearly interpolates points until the distance from one point to another is at most dist
  let p_idx = 0;
  while (p_idx < points.length-1) {
    let distToNext = pow(points[p_idx][0] - points[p_idx+1][0], 2) + pow(points[p_idx][1] - points[p_idx+1][1], 2);
    if (distToNext > dist*dist) {
      points.splice(p_idx+1, 0, [(points[p_idx][0] + points[p_idx+1][0]) / 2, (points[p_idx][1] + points[p_idx+1][1]) / 2]);
    }
    if (sqrt(distToNext)/2 < dist) {
      p_idx += 1;
    }
  }
}

function scatterBlades() {
  blades = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (random() < 0.4) {
        // yeah put a thing there
        if (random() < 0.5) {
          // make it a scissors
          blades.push(new Blade(350 + x * 75, 100 + y * 100,random()/3+0.2,PI*random(),scissor_img,scissor_points));
        } else {
          // make it a scalpel
          blades.push(new Blade(350 + x * 75, 100 + y * 100,random()/3+0.2,PI*random(),scalpel_img,scalpel_points));
        }
      }
    }
  }
}

function bladeLiverOverlap() {
  // Check whether any blades are overlapping liver, and if so, damage it
  for (let b = 0; b < blades.length; b++) {
    
    // TODO: Optimize!
    //if (pow() + pow() < ) 
    
    let bpoints = blades[b].getCollider();
    for (let bp = 0; bp < bpoints.length; bp++) {
      if (liver.isInsideCollider(bpoints[bp])) {
        liver.health -= 0.2 * deltaTime/1000;
        add_drips = true;
        return;
      }
    }
  }
}

function drawTextScroll() {
  text_scroll -= 100 * deltaTime/1000;
  
  textSize(25);
  let phrase_width = textWidth(text_phrases[selected_phrase]);
  if (text_scroll < 0 - phrase_width - 100) {
    text_phrases.splice(selected_phrase, 1);
    selected_phrase = floor(random()*text_phrases.length);
    text_scroll = width + 500;
  }
  strokeWeight(10);
  stroke(255);
  fill(0);
  rect(-10,0,width+20,50);
  
  fill(255);
  noStroke();
  text(text_phrases[selected_phrase], text_scroll, 30);
}


function drawStats() {
  textFont("monospace");
  fill(255);
  noStroke();
  textSize(20);
  
  text("Points: " + points, 10, 75);
  text("Livers Delivered: " + livers_delivered, 10, 95);
  
  text("Time: " + floor(countdown) + " sec", 650, 75);
}


function drawResults() {
  textFont("monospace");
  fill(255);
  stroke(0);
  strokeWeight(5);
  textSize(30);
  
  push();
  textAlign(CENTER);
  text("You earned " + points + " points!", width/2, 475);
  text("And delivered " + livers_delivered + " livers!", width/2, 510);
  text("Refresh the page to play again.", width/2, 545);
  pop();
}


function animateDrips() {
  // Each drip is an array, [life, x, y, vx, vy]
  if (add_drips) {
    if (drips.length == 0 || drips[drips.length-1][0] > 0.05) {
      let rand = random();
      let point = [liver.controlPoints[0][0] + rand*(liver.controlPoints[1][0] - liver.controlPoints[0][0]), 
                   liver.controlPoints[0][1] + rand*(liver.controlPoints[1][1] - liver.controlPoints[0][1])];
      let angle = random() * 2 * PI;
      drips.push([0, point[0], point[1], cos(angle), sin(angle)]);
      
      if (drips.length % 4 == 0) {
        sound_effects[floor(random(sound_effects.length))].play();
      }
    }
  }
  for (let d = 0; d < drips.length; d++) {
    drips[d][0] += deltaTime/1000;
    if (drips[d][0] > 0.5) {
      drips.splice(d, 1);
      d--;
      continue;
    }
    drips[d][1] += drips[d][3] * 500/pow(1+5*drips[d][0],2) * deltaTime/1000;
    drips[d][2] += drips[d][4] * 500/pow(1+5*drips[d][0],2) * deltaTime/1000;
    stroke(150,20,20, 200);
    strokeWeight(5);
    line(drips[d][1], drips[d][2], drips[d][1] + 5*drips[d][3], drips[d][2] + 5*drips[d][4]);
  }
}


function mousePressed() {
  if (GAME_MODE == 0) {
    GAME_MODE = 1;
    bg_music.play();
    return false;
  }
}


function keyPressed() {
  if (GAME_MODE == 0) {
    GAME_MODE = 1;
    bg_music.play();
    return false;
  }
  if (keyCode == 32) {
    grabbing = !grabbing;
    if (grabbing && liver.isInsideCollider(grab1_pos) && liver.isInsideCollider(grab2_pos)) {
      liver.grab(grab1_pos, grab2_pos);
      sound_effects[0].play();
    }
    if (!grabbing) {
      liver.release();
      let liverCenter = liver.currentControlCenter();
      if (liverCenter[0] > 720 && liverCenter[1] > 210 && liverCenter[1] < 430) {
        // liver is on the tray
        points += 250 + floor(250 * max(1, liver.health)/20)*20;
        livers_delivered += 1;
        liver = new Liver(liver_img, cuts_img);
        scatterBlades();
        // skip the boring travel time back to the start
        grab1_pos = [50, 400];
        grab2_pos = [140, 400];
        beep.play();
      }
    }
  }
  return false;
}
