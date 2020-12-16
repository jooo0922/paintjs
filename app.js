'use strict';

/* 맨 처음 할것은 canvas 위에 마우스를 두면 그걸 감지하는 거 */
const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");

/* addEventListener()로 클릭하면 브러쉬가 해당 색상값으로 변경되는 걸 만들기 위해 각 color가 지정된 div태그들을 가져옴.*/
const colors = document.getElementsByClassName("jsColor");

/* 요거는 jsRange의 range input에서 값을 받아와서 lineWidth 값에 override하려고 만든거지. */
const range = document.getElementById("jsRange");

/* 
fill 모드 <-> paint 모드 switch하려고 만든거.
일단 html 버튼안에 fill<->paint 이게 바뀌는거 먼저 만들고,
fill모드로 가면 컬러 선택하고 캔버스 선택하면
캔버스 전체가 해당 컬러로 채워지는 거를 만들거임.
*/
const mode = document.getElementById("jsMode");

const saveBtn = document.getElementById("jsSave");

const INITIAL_COLOR = "#2c2c2c";
/*
fillStyle도 초기값을 설정하려고 밑에다가 초기값을 넣으려고 봤더니
같은 색상 초기값을 두번 넣게 되는거잖아?
이럴때는 윗줄에다가 default variable을 만들어서 요걸로 써먹는게 좋음.
*/
const CANVAS_SIZE = 700;

/*
canvas element는 두 개의 사이즈를 가져야함
1. css사이즈
2. pixel manipulating size
기본적으로 우리는 css로 캔버스를 만듬과 동시에
또한 js로 pixel을 다룰 수 있는 element로서 캔버스를 만드는거니까
이 element에 width와 height를 지정해줘야 함!

pixel을 다루는 윈도우가 얼마나 큰지
canvas에게 알려주기 위해 width와 height 사이즈를 주는 것.
*/
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
/*
이거는 뭐냐면, 캔버스에 그림을 그리고나서 캔버스 우클릭->이미지 저장 해보면,
기본적으로 canvas는 픽셀을 다뤄서 이미지를 만드는거기 때문에 
캔버스 내에 이미지에 대한 download와 save 기능이 내장되어 있음.

근데 하얀 바탕에 그림을 그려서 이미지 저장해보면, canvas 색깔이 없음. 즉 투명하다는 거임.
근데 스크린상에서는 하얗게 나오지? 왜냐면 그 하얀색은 html태그의 기본 설정값인거고.
canvas내에서 설정된 하얀색이 아닌거야.
그래서 ctx.fillRect로 처음 시작할때부터 캔버스에 하얀색 fillRect를 깔아놓고 시작하려는 거지!
*/

/*
context는 canvas 안에서 픽셀을 다루는 것
ctx(context variable)의 default 값으로
strokeStyle, lineWidth를 이용헤서
기본 색상값과 선 두께값을 넣어줌.
*/
ctx.strokeStyle = INITIAL_COLOR; /* 우리가 그릴 선들, 이 context안에 있는 모든 선들은 모두 이 색을 갖는다 */
ctx.fillStyle = INITIAL_COLOR;
ctx.lineWidth = 2.5; /* 그 선의 너비가 2.5px이다 */

/* 
ctx.fillStyle = "green";
ctx.fillRect(50, 20, 100, 49);
ctx.fillStyle = "purple";
ctx.fillRect(50, 100, 100, 49);

캔버스는 위에서 아래로 코드를 읽음 
그러니까 fillStyle에서 green값으로 한번 지정되고
이 스타일에 맞는 사각형이 그려지고,
그 다음 fillStyle에서 purple값으로 지정되고 나서
다시 fillRect를 실행해야 해당 스타일이 적용된 사각형이 나오는 거임.
fillStyle은 fillRect를 실행한 뒤에 바꾸더라도 
앞에 이미 실행한 fillRect에 영향을 주지 못한다.
이런 원리로 캔버스도 색깔을 채워보자
*/

let painting = false; /* 기본적으로는 false값 */
let filling = false; 
/* 
handleModeClick() 에서 써먹으려고 만든거 
왜냐면, filling mode인지 아닌지 알려줄 수 있는 variable이 필요한거지.
true면 fiilling mode로 가고, false면 paint mode로 가고.
둘중에 뭔지 알려주는게 필요하다면 true/false를 알려줄 수 있는 let 변수를 만들어서 써먹을 것!
*/

/*
painting이 기본 false인 상태에서, 
클릭한 순간 true가 되고, 클릭을 뗀 순간 다시 false가 되게 만드는 거. 
그니까 painting이 true일 때의 좌표값들만 색깔을 찍어주면 되겠지!
*/
function stopPainting(){
    painting = false;
}

function startPainting(){
    painting = true;
}

/*
우리가 가장 신경써야할 함수.
왜냐면, 여기서 모든 마우스 움직임을 감지하고
context로 라인도 만들어야 하니까

context 중에서 path를 사용할건데
path는 기본적인 선.
path를 움직이거나, 색을 채우거나, 닫을 수 있음.
뭐든지 할 수 있음. 선, line이라고 보면 됨.

but, painting을 하지 않을 때에만 path를 그리고자 함.
즉, 클릭하지 않은 채로 마우스가 캔버스에서 떠다니는 거.
클릭하지 않은 채 떠다니는 것들은 path로 만든다는 거.
마우스가 움직이는 곳(시작점)부터 클릭하는 곳까지를
path로 만드는거임. 이거는 painting하지 않을거기 때문에 스크린에서 볼 수 없음.
*/
function onMouseMove(event){
    /* 
    console.log(event);
    해당 콘솔창에 나오는 각각의 이벤트 값들 중 
    client: 윈도우 전체 범위 내에서 마우스 위치값
    offset: 캔버스 내에서 마우스 위치값. 우리는 이게 필요함. 캔버스 안에다만 그릴거니까!
    */
    
    const x = event.offsetX;
    const y = event.offsetY;
    /* console.log(x, y); */

    if(!painting){
        ctx.beginPath();
        ctx.moveTo(x, y);
        /* 
        얘내는 캔버스 위에서 마우스가 떠다닐때까지만 작동하다가 
        마우스를 클릭해서 움직이는 순간, 이 구문은 더이상 실행하지 않음.

        path의 시작점은 내 마우스가 있는 곳.
        마우스를 움직이는 동안 많은 path들이 만들어졌는데
        어떤 path들도 사용되어지지는 않았어.

        그러나 내가 마우스를 클릭하는 순간, startPaingting함수 시작. painting = true가 됨.
        클릭한 상태에서 내가 여전히 마우스를 움직이고 있다면 onMouseMove()가 실행되고 있는거고
        하지만 painting = true이니까 if구문을 실행하지 않고 else구문을 실행하겠지
        */

    } else{
        ctx.lineTo(x, y);
        /* 
        lineTo(); 
        MDN 설명에 따르면, '현재 sub-path의 마지막 점을 특정 좌표와 직선으로 연결한다.'
        즉, 이 context에서 말하는 path의 마지막 점이 있으려면 일단 현재 패스가 있어야겠지?
        (그래서 if구문에서 떠다니는 패스를 만든거임)
        그리고나서 lineTo()를 호출하면, 패스의 마지막점에서 ()안의 좌표점으로 '직선'으로 연결되는 거
        이후에도 클릭한 상태에서 마우스를 움직이면 lineTo() 함수가 호출되서 좌표를 계속 찍게 되고,
        그것이 실시간으로 갱신되는 '현재의 sub-path'를 만들면서 직선으로 계속 연결되는 것이다.
        현재의 서브패스는 계속 변해가는 것.

        그런데 왜 if구문에서 쓰이지도 않을 path를 계속 만든걸까?
        lineTo()를 실행하려면 현재 패스, 즉, 기존에 계속 만들어지고 있었던 패스가 필요햇던거임.
        그래서 처음 lineTo를 호출하기 위해 대기상태인 기존 패스가 필요했던거. 
        */
    
        ctx.stroke();
        /* 
        stroke(); 현재의 strokeStyle로 현재의 sup-path에 획을 그음 
        
        '현재의 sub-path'라는 말은, moveTo()에서의 마지막 좌표점에서 
        클릭해서 호출된 lineTo()에서의 좌표점까지 연결된 직선 패스를 의미한다!
        얘내도 같은 패스 맞아! 앞에 moveTo로 만든, 마우스를 움직이는 동안 만들어진 것들도 path지만,
        그거는 사용되지 않은 과거의 패스! 지금 만들어진 패스는 클릭해서 lineTo()함수에서 찍은 좌표로 연결된 직선 패스!
        그 직선패스에 앞에서 정의한 strokeStyle로 획을 긋는다는 거!
        */
    }
    /* lineTo(), stroke()은 내가 마우스를 움직이는 내내 계속 발생하는 거 */
}

function handleColorClick(event){
    /*
    console.log(event.target.style);
    
    event.target은 해당 event가 target하는, 목표하는, 노리는 애들.
    click이 누구를 노리지? Array.from(colors) 안에 있는 각각의 div태그에 대한 object들이잖아!
    클릭한 div태그 오브젝트로 접근하겠다는 뜻인거지!
    이걸 콘솔창에 찍어보면 backgroundColor: "rgb()" 이런 lable로 컬러값을 가지고있는 걸 확인할 수 있다.
    따라서 우리는, style 중에서도 backgroundColor가 필요함.

    항상 이런식으로 우리가 필요한 데이터값을 접근해서 얻으려면 그 데이터가 어디에 있는지,
    데이터에 접근하려면 어떤 lable을 써야하는지는 console창에 찍어보면서 확인하면서 작성해야 함!
    */
    const color = event.target.style.backgroundColor;

    /*
    console.log(color);
    */
    
    ctx.strokeStyle = color; 
    /* 
    기존에 설정한 context안에 있는 모든 선들의 색("2c2c2c")을 click했을 때의 div의 컬러값으로
    override한다.
    나는 어쨋든 ctx의 값이 바뀌는 거니까 ctx를 const->let으로 바꿔야하는건가? 생각했는데
    그냥 const로 해도 strokeStyle값은 바뀌나 봄. 캔버스의 context 속성을 바꿀때는 상관없는거 같음.
    */
    
    ctx.fillStyle = color;
    /* 
    선택한 컬러값을 handleModeClick() 함수의 else 구문에서
    fillRect에 적용할 색깔에도 넣어서 적용하는거!  
    */
}

function handleRangeChange(event){
    /* 
    console.log(event);
    console.log(event)로 찍어보면 찾기 어렵긴 한데 나오기는 함.
    target으로 들어가서 (...) 이 더보기를 클릭해야 거의 맨밑에 value값이 나와있음.
    이렇게 원하는 값을 찾기 어려울경우 (...) 를 클릭해서 숨겨진 속성값들이 없는지 확인해볼 것!

    console.log(event.target.value);
    얘로 콘솔창에 찍어보면 0.1 단위로 값이 변하는 걸 볼 수 있음.
    왜냐? <input step="0.1"> 로 값이 변하는 단위르 0.1로 줬기 때문에!
    */

    const size = event.target.value;
    ctx.lineWidth = size;
    /* handleColorClick() 처럼 값을 override하는 원리는 똑같음. */
}

/* 여기서는 event안에 있는 값을 가져와서 뭘 하는게 아니라서 딱히 event를 argument로 가져올 필요 없음. 신경쓰지 말 것. */
function handleModeClick(){
    if(filling === true){
        filling =  false;
        mode.innerText = "Fill";
    } else {
        /* 
        else구문 안에다가 painting mode -> filling mode로 전환됬을때 실행할 일들을 넣어줘야 됨. 
        기본적으로 버튼안에 텍스트가 바뀔 것이고,
        두번째로는 컬러값이 있는 div 하나를 클릭하고
        캔버스를 클릭했을 때 캔버스 전체가 해당 컬러로 채워지는 게 있어야곘지 
        ->이걸 해주는게 fillRect()임. MDN에서 한번 찾아볼 것.
        (이거는 handleCanvasClick함수에서 해줄것임.)
        */
        filling = true;
        mode.innerText = "Paint";
    }
}

/* 마찬가지로 event는 no신경! event에 접근해서 뭘 가져오거나 하는게 아니니까 */
function handleCanvasClick(){
    /* filling값이 true인 경우에만 즉, filling mode일때에만 캔버스에 fillRect를 할 수 있게 해라! 라는거 */
    if(filling){
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        /* 
        fillRect(x, y, width, height) 이렇게 쓰는거고, 
        앞서 CANVAS_SIZE로 default variable을 만들어놨으니
        (0, 0, CANVAS_SIZE, CANVAS_SIZE) 이렇게 해도 됨. 

        그리고, 저 ctx는 결국 현재 canvas안에서 작동하는 context기 때문에
        position을 0, 0으로 하고, 사이즈를 캔버스랑 똑같이 해버리면,
        뾰족한 모서리의 사각형으로 fillRect() 되긴 하겠지만,
        canvas태그 내에 존재하는 것이므로, 캔버스 자체의 둥근 모서리 모양에
        맞춰서 잘려서 fillRect 처리가 되는거임.
        */
    }
}

function handleCM(event){
    event.preventDefault();
    /* 
    이게 뭐냐면 우클릭 방지 기능을 만든거임. 
    캔버스를 우클릭해서 이미지를 저장하지 못하게 하려고
    contextmenu라는 이벤트를 받으면 그 이벤트를 실행하지 못하게 하는 함수지!

    대신 save버튼을 눌러서 캔버스에 그린 이미지를 저장하게 할거임.
    */
}

function handleSaveClick(){
    /*
    여기서 필요한 기능은 캔버스에 그린것들을 다 넣고
    image안에 이것들을 담아내는 거야. 우리가 원하는 게 그런 image니까
    그리고나서 사용자가 이걸 자동 저장할 수 있게 만드는거
    
    그래서 먼저 우리는 canvas의 데이터를 image처럼 얻어야 함.
    이걸 위해 필요한 메소드가 HTMLCanvasElement.toDataURL();
    얘는 기본적으로 PNG로 지정된 포맷의 이미지 표현을 포함한 data URI를 반환해줌
    이 포맷은 원하면 JPEG로도 바꿔줄 수 있음. MDN 참고

    jpeg로 다운받게 하려면 toDataURL("image/jpeg")하면 되고,
    그냥 비워두면 기본값인 png로 다운로드될거임.
    */
    const image = canvas.toDataURL();

    /*
    console.log(image);
    찍어보면 해당 이미지에 대한 url이 콘솔창에 나옴.
    클릭해보면 해당 이미지가 보이는 새로운 페이지로 연결됨.
    */

    const link = document.createElement("a");
    link.href = image;
    link.download = "잘그렸네유!";
    console.log(link)
    /* 
    html에 가상의 <a> 태그를 만들고, 그걸 link라는 const에 넣어놓은 다음.
    그안의 <a> 태그에 href랑 download라는 attribute(속성)을 넣고,
    각각의 속성값으로 image url, 이미지 파일명을 넣은거임.

    <a href="해당 이미지의 url" download="다운로드하는 이미지파일 이름"> 
    이렇게 된 상황인데, download는 브라우저에게 href=""안의 링크로 가는 대신,
    해당 url을 download=""안의 파일명으로 다운로드하라고 지시하는 속성임. 우리가 원하는거지!
    */

    /* 
    이제 해당 링크를 가상으로 click하는 것만 만들면 됨. 
    HTMLElement.click() 메소드는 엘리먼트에 마우스 클릭을 시뮬레이션함.
    지원하는 엘리먼트(<input> 등)에서 click() 이 사용될 때, 엘리먼트의 클릭 이벤트가 실행됨.
    MDN참고.
    */
    link.click();
}

/* canvas가 존재하면 값이 true임. 그러면 참이 되므로 if구문 실행 */
if(canvas){
    canvas.addEventListener("mousemove", onMouseMove);
    /* 마우스가 캔버스영역 안에서 움직일때만 해당 onMouseMove를 실행함! */

    canvas.addEventListener("mousedown", startPainting);
    /* mousedown은 마우스 클릭했을 때 발생하는 event */

    canvas.addEventListener("mouseup", stopPainting);
    /* 
    mouseup은 마우스 클릭을 뗐을 때 발생하는 event 
    */

    canvas.addEventListener("mouseleave", stopPainting);
    /* 
    mouseleave은 마우스가 canvas에서 나가게 되면 발생하는 event 
    마우스가 canvas 안에 있을때만 painting해야 하니꺄
    */

    canvas.addEventListener("click", handleCanvasClick);
    /* 
    filling mode에서 canvas를 클릭했을때 캔버스 색을 채우기 위한 함수를 호출하려는거지!
    */

    canvas.addEventListener("contextmenu", handleCM);
    /*
    캔버스를 마우스 우클릭 했을때 드롭다운되는 메뉴들
    '다른 이름으로 저장, 복사, 검사' 등등 이런것들. 
    이 이벤트를 contextmenu라고 함.
    */
}

/*
colors는 현재 9개의 색상값들을 가지고있는 div태그들이 들어가있는 object에 불과함.
여기서 우리가 원하는 걸 하려면 array가 필요함.
Array.from() 메소드는 object로부터 array를 만듦.

console.log(Array.from(colors));
*/

/* 
최상단에 DOM으로 접근한 html요소가 담긴 const 변수들은  
항상 if()로 하는게 좋은게 colors는 문제가 없지만, 값이 비어있을 경우를 대비해 확인하는 if구문에 넣어놓는게 좋다. 
*/
if(colors){ 
    Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));
}
/*
Array.forEach(); 
얘는 todolist 만들때 해봤지? array 안에 있는 각각의 object들에 대해서 ()안에 함수를 실행시켜 주는 것.

color
얘는 Array.from(colors) 이 배열안에 있는 각각의 object들이 들어오게 될 argument자리에 임의로 이름붙인 거!
potato라고 이름 붙여서 해도 됨. 왜냐면 임의로 붙여놓은 이름이기 때문에.
그 이름이 뭐가됬든 아무상관 없음. 이름표, 껍데기같은거고, 
남들이 함수를 읽을 때 의미상 대충 어떤 값이 들어가겠구나 를 알 수 있게 
실제로 들어가는 argument를 설명해주는 단어로 이름표를 붙인거임.

color => color.addEventListener("click", changeColor)
얘는 결국
function(color){
    color.addEventListener("click", changeColor)
};
이거를 arrow function 으로 간편하게 한줄로 작성한거임!
*/

if(range){
    range.addEventListener("input", handleRangeChange);
}
/* range가 range input 이라는 event를 받을때까지 기다렸다가, 받으면 반응해서 ()안의 함수를 실행해줘! 라는거지 */

if(mode){
    mode.addEventListener("click", handleModeClick);
}

if(saveBtn){
    saveBtn.addEventListener("click", handleSaveClick);
}