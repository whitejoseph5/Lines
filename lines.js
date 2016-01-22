// still need to add 

/**************************************************************************************
    GLOBAL NAMESPACE - MyAnim
*/
var MyAnim = MyAnim || {

    // canvas will always be square, no height value needed
    currWidth: null,
    canvas: null,
    context: null,
    backgroundColor: null,
    squares1: [],
    squares2: [], // only used if option is selected to draw double
    colorPart: { RR: 255, GG: 255, BB: 255 },
    colorStr: 'rgb(' + self.RR + ', ' + self.GG + ', ' + self.BB + ')',
    crazyColors: false,
    maxX: 1600,
    maxY: 1600,
    maxSize: 15,     // max number of squares across (max of 15 == max 256 squares)
    refreshCount: 1 // keeps track of number of squares to draw, can't exceed maxSize
    //optionsSlp: []
};

// configuration parameters of square pattern animation
MyAnim.patternConfig = {
    numSquares: 1,
    squareSideLen: 1600,
    slope: .005,
    slpInc: 0,
    lnWidth: .05,
    scaleX: 1,
    scaleY: 1,
    complete: false,
    doubled: false,
    stopped: false
};

MyAnim.beginDraw = function () {
    //setSlopes();
    document.getElementById('myCanvas').addEventListener('click', MyAnim.canvasClicked, false);

    MyAnim.canvas = document.getElementById('myCanvas');
    MyAnim.context = MyAnim.canvas.getContext('2d');

    var startPt = new MyAnim.Point(0, 0);

    MyAnim.squares1.push(new MyAnim.SpiralSquare(MyAnim.context, startPt, 1));
    MyAnim.squares2.push(new MyAnim.SpiralSquare(MyAnim.context, startPt, 0));

    MyAnim.context.lineWidth = MyAnim.patternConfig.lnWidth;
    MyAnim.context.strokeStyle = MyAnim.colorStr;
    MyAnim.context.strokeRect(0, 0, MyAnim.maxX, MyAnim.maxY);

    // request repaint
    window.requestAnimationFrame(MyAnim.renderLoop);
};

MyAnim.renderLoop = function () {
    for (var i = 0; i < 4; i++) {
        // indices of lines from which to get start and end point for new line
        var iPrev;
        var iNext;
        // will hold coord values of new line (_2 for points if drawing double)
        var pt1, pt2, pt1_2, pt2_2;
        for (var j = 0; j < MyAnim.squares1.length; j++) {
            // map to indices of last line and next line
            iPrev = (i + 3) % 4;
            iNext = (i + 1) % 4;

            pt1 = MyAnim.squares1[j].lines[iPrev].point2;
            pt2 = MyAnim.squares1[j].getNextPoint(iNext);

            MyAnim.squares1[j].lines[i].point1 = pt1;
            MyAnim.squares1[j].lines[i].point2 = pt2;
            MyAnim.squares1[j].render(i);

            if (MyAnim.patternConfig.doubled) {
                pt1_2 = MyAnim.squares2[j].lines[iPrev].point2;
                pt2_2 = MyAnim.squares2[j].getNextPoint(iNext);

                MyAnim.squares2[j].lines[i].point1 = pt1_2;
                MyAnim.squares2[j].lines[i].point2 = pt2_2;
                MyAnim.squares2[j].render(i);
            }
        }

        if (!MyAnim.crazyColors)
            MyAnim.updateColor();
    }

    if (!MyAnim.patternConfig.stopped) {
        if (MyAnim.squares1[j - 1].lines[i - 1].getLength() > 1)
            window.requestAnimationFrame(MyAnim.renderLoop);
        else {
            MyAnim.patternConfig.complete = true;
            MyAnim.refresh();
            window.requestAnimationFrame(MyAnim.renderLoop);
        }
    }
};

MyAnim.updateColor = function () {
    MyAnim.colorPart.RR = (MyAnim.colorPart.RR + 1) % 256;
    MyAnim.colorPart.GG = (MyAnim.colorPart.GG + 20) % 256;
    MyAnim.colorPart.BB = (MyAnim.colorPart.BB + 5) % 256;
    MyAnim.colorStr = 'rgb(' + MyAnim.colorPart.RR
                   + ', ' + MyAnim.colorPart.GG
                   + ', ' + MyAnim.colorPart.BB + ')';
};

MyAnim.switchColors = function (id) {
    MyAnim.crazyColors = document.getElementById(id).checked;
};

MyAnim.stop = function () {
    MyAnim.patternConfig.stopped = true;
    MyAnim.patternConfig.complete = true;
};

MyAnim.setLineWidth = function () {
    MyAnim.patternConfig.lnWidth = document.getElementById('myWidth').value;
};

MyAnim.setSlope = function () {
    MyAnim.patternConfig.slope = document.getElementById('mySlope').value;
};

MyAnim.setBackgroundColor = function (id) {
    console.log('bg change to ' + document.getElementById(id).value);
    document.getElementById('myCanvas').style.backgroundColor = document.getElementById(id).value;
    document.getElementById('mainNavbar').style.backgroundColor = document.getElementById(id).value;
};

MyAnim.doublePattern = function (id) {
    MyAnim.patternConfig.doubled = document.getElementById(id).checked;
};

MyAnim.canvasClicked = function (evt) {
    MyAnim.patternConfig.stopped = false;
    MyAnim.refresh();

    if (MyAnim.patternConfig.complete) {
        window.requestAnimationFrame(MyAnim.renderLoop);
    }
};

MyAnim.refresh = function () {
    var numSquaresDrawn = 0, dir1 = 1, dir2 = 0;

    MyAnim.context.clearRect(0, 0, MyAnim.maxX, MyAnim.maxY); // change to dynamic value
    MyAnim.refreshCount++;
    // resets back to 1 square after reaching maxSize
    if (MyAnim.refreshCount > MyAnim.maxSize)
        MyAnim.refreshCount = 1;

    MyAnim.patternConfig.numSquares = Math.pow(MyAnim.refreshCount, 2);
    //MyAnim.patternConfig.slope = MyAnim.optionsSlp[MyAnim.refreshCount % MyAnim.optionsSlp.length];
    MyAnim.squares1.length = 0;
    MyAnim.squares2.length = 0;

    MyAnim.patternConfig.squareSideLen = MyAnim.maxX / MyAnim.refreshCount;

    // pushes numSquares to squares1 and squares2 arrays with alternating drawing directions
    for (var i = 0; i < MyAnim.refreshCount; i++) {
        if (MyAnim.refreshCount % 2 == 0) // even number squares, alternate directions per row
        {
            if (i % 2 == 0) {
                dir1 = 1;
                dir2 = 0;
            }
            else {
                dir1 = 0;
                dir2 = 1;
            }
        }
        for (var j = 0; j < MyAnim.refreshCount; j++) {
            var tempPt = new MyAnim.Point(j * MyAnim.patternConfig.squareSideLen, i * MyAnim.patternConfig.squareSideLen);
            MyAnim.squares1.push(new MyAnim.SpiralSquare(MyAnim.context, tempPt, dir1));
            MyAnim.squares2.push(new MyAnim.SpiralSquare(MyAnim.context, tempPt, dir2));
            MyAnim.context.strokeStyle = MyAnim.colorStr;
            MyAnim.context.strokeRect(j * MyAnim.patternConfig.squareSideLen,
                               i * MyAnim.patternConfig.squareSideLen,
                               MyAnim.patternConfig.squareSideLen,
                               MyAnim.patternConfig.squareSideLen);

            if (dir1 == 1) {
                dir1 = 0;
                dir2 = 1;
            }
            else {
                dir1 = 1;
                dir2 = 0;
            }
            numSquaresDrawn++;
        }
    }
}

/**************************************************************************************
    CLASS - Point
        simple class modeling a point defined by an (x, y) coordinate
*/
MyAnim.Point = function (x, y) {
    var _this = this;
    _this.x = x;
    _this.y = y;
};
/*  END CLASS - Point *****************************************************************/


/**************************************************************************************
    CLASS - Line
        simple class modeling a line defined by two points
        takes two MyAnim.Point objects as params
*/
MyAnim.Line = function (point1, point2) {
    var _this = this;
    _this.point1 = point1;
    _this.point2 = point2;
};

MyAnim.Line.prototype.getLength = function () {
    return Math.sqrt(Math.pow(this.point2.x - this.point1.x, 2)
        + Math.pow(this.point2.y - this.point1.y, 2));
};
/*  END CLASS - Line ******************************************************************/

/**************************************************************************************
    CLASS - SpiralSquare
        represents one square cell in the animation
        takes point of top left corner of cell and direction (clockwise/counterclockwise)
*/
MyAnim.SpiralSquare = function (context, startPoint, dir) {
    var _this = this;
    _this.context = context;
    _this.startPt = startPoint;
    _this.dir = dir;
    _this.lines = [];
    this.init();
};

MyAnim.SpiralSquare.prototype.init = function () {
    // local array of 4 points defining initial 4 lines
    var pts = [];

    // push points to array in clockwise or counterclockwise direction (this determines how spiral pattern is drawn)
    // points are in an x, y coordinate system with an inverted y-axis
    if (this.dir == 1) {
        pts.push(new MyAnim.Point(this.startPt.x, this.startPt.y));
        pts.push(new MyAnim.Point(this.startPt.x + MyAnim.patternConfig.squareSideLen,
                                   this.startPt.y));
        pts.push(new MyAnim.Point(this.startPt.x + MyAnim.patternConfig.squareSideLen,
                                   this.startPt.y + MyAnim.patternConfig.squareSideLen));
        pts.push(new MyAnim.Point(this.startPt.x,
                                   this.startPt.y + MyAnim.patternConfig.squareSideLen));
    }
    else {
        pts.push(new MyAnim.Point(this.startPt.x, this.startPt.y));
        pts.push(new MyAnim.Point(this.startPt.x,
                                   this.startPt.y + MyAnim.patternConfig.squareSideLen));
        pts.push(new MyAnim.Point(this.startPt.x + MyAnim.patternConfig.squareSideLen,
                                   this.startPt.y + MyAnim.patternConfig.squareSideLen));
        pts.push(new MyAnim.Point(this.startPt.x + MyAnim.patternConfig.squareSideLen,
                                   this.startPt.y));
    }

    // push 4 lines that will serve as starting point from which to draw pattern
    this.lines.push(new MyAnim.Line(pts[0], pts[1]));
    this.lines.push(new MyAnim.Line(pts[1], pts[2]));
    this.lines.push(new MyAnim.Line(pts[2], pts[3]));
    this.lines.push(new MyAnim.Line(pts[3], pts[0]));
    console.log('square initialized');
};

// takes index of line, returns new point
MyAnim.SpiralSquare.prototype.getNextPoint = function (i) {
    var nextPt = new MyAnim.Point(0, 0);

    nextPt.x = this.lines[i].point1.x
               + MyAnim.patternConfig.slope
               * (this.lines[i].point2.x - this.lines[i].point1.x);
    nextPt.y = this.lines[i].point1.y
               + MyAnim.patternConfig.slope
               * (this.lines[i].point2.y - this.lines[i].point1.y);
    return nextPt;
};

MyAnim.SpiralSquare.prototype.render = function (i) {
    this.context.beginPath();
    this.context.lineWidth = MyAnim.patternConfig.lnWidth;
    this.context.strokeStyle = MyAnim.colorStr;
    if (MyAnim.crazyColors)
        MyAnim.updateColor();
    this.context.moveTo(this.lines[i].point1.x, this.lines[i].point1.y);
    this.context.lineTo(this.lines[i].point2.x, this.lines[i].point2.y);
    //this.context.bezierCurveTo(this.lines[i].point1.x, this.lines[i].point1.y - (this.lines[i].getLength() / 10), this.lines[i].point2.x, this.lines[i].point2.y - (this.lines[i].getLength() / 10), this.lines[i].point2.x, this.lines[i].point2.y);
    //this.context.arc(this.lines[i].point1.x + (this.lines[i].point2.x / 2), this.lines[i].point1.y + (this.lines[i].point2.y / 2), this.lines[i].getLength() / 2, 0, Math.PI);
    //this.context.scale(MyAnim.patternConfig.scaleX, MyAnim.patternConfig.scaleY);
    this.context.stroke();
};
/* END CLASS - SpiralSquare ***********************************************************/