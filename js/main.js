// alert($('body').height());
// alert(window.innerHeight);
document.documentElement.style.setProperty('--vh', window.innerHeight/100+"px");
const ICON_SL = Math.round(window.innerHeight*35/100);//SL:side length
//
const SCALING_RATE_LIM = 4;//limit of scaling rate
//SCALING_RATE_LIM=x,limit= 1/x ~ x
//for example: SCALING_RATE_LIM=4, scaling limit=25%~400%
const mask_names = [
    "chongya_black",
    "chongya_white",
    "icon_frame",
];
const RANDOM_ICON_NAMES = [
    'basketball_court.jpg',
    'dusk.jpg',
    'flying_dream.jpg',
    'high_school_building.jpg',
    'pink_clouds.jpg',
    'satellite_building.jpg',
    'scratch_paper.jpg',
    'setting_sun.jpg',
    'village_view.jpg',
    'west_courtyard.jpg'
];
const OUTPUT_SL = 512;
// const OUTPUT_SLS = [
//     64,
//     128,
//     256,
//     512,
//     1024
// ];


// $('.container').setProperty('-vh',window.innerHeight * 0.01 + 'px');


let chosen_mask_id=0;
let input_img = $("#input_img");
const scaling_slider = $('#scaling_slider');
const scaling_ctx = scaling_slider[0].getContext("2d");
const scaling_rect = scaling_slider[0].getBoundingClientRect();
console.log(scaling_rect);
const cover_canvas = document.getElementById("cover_canvas");
const cover_ctx = cover_canvas.getContext("2d");
let cmX, cmY, new_cmX, new_cmY, cover_pic_X = ICON_SL/2, cover_pic_Y = ICON_SL/2;//cmX=cover_mouse_X
const cRect = cover_canvas.getBoundingClientRect();
const mask_btns_div = $('#mask_btns_div');
//const masks_div = $('#masks_div');
let input_ssr;


// input_img.attr("width",ICON_SL);
// input_img.attr("height",ICON_SL);
$(cover_canvas).attr('width',ICON_SL).attr('height',ICON_SL);

$("#input_input").change(function(){
    input_img.attr("src",URL.createObjectURL($(this)[0].files[0]));
    update_input();
});

function update_input(){
    input_img.ready(function() {
        setTimeout(function(){
            let input_min_side = Math.min(input_img.width(),input_img.height());
            input_ssr = ICON_SL / input_min_side;
            if($('#reset_when_switching_icon').hasClass('active'))
                reset();
            else
                paint();
        },100);
    });
}


//cover_ctx.font = "16px Arial";

let isMouseDown = false;

document.addEventListener("mousedown",function(e){
    isMouseDown = true;
});
document.addEventListener("touchstart",function(e){
    isMouseDown = true;
});

document.addEventListener("mouseup",function(e){
    isMouseDown = false;
    cmX=-1;
    cmY=-1;
    new_cmX=-1;
    new_cmY=-1;
});
document.addEventListener("touchend",function(e){
    isMouseDown = false;
    cmX=-1;
    cmY=-1;
    new_cmX=-1;
    new_cmY=-1;
});

cover_ctx.drawImage(input_img[0],0,0,ICON_SL,ICON_SL);

cover_canvas.addEventListener("touchmove", function(e){
    if(e.touches[0].pageX%1!==0||e.touches[0].pageY%1!==0)
        return;
    cover_move(e.touches[0].pageX,e.touches[0].pageY);
});
cover_canvas.addEventListener("mousemove", function(e){
    cover_move(e.clientX,e.clientY);
});

function cover_move(x,y){
    if(!isMouseDown) {
        cmX=-1;
        cmY=-1;
        new_cmX=-1;
        new_cmY=-1;
        return;
    }
    new_cmX = Math.round(x - cRect.left);
    new_cmY = Math.round(y - cRect.top);
    if(cmX>=0&&new_cmX>=0)//to prevent illegal input
        cover_pic_X += new_cmX - cmX;
    if(cmY>=0&&new_cmY>=0)
        cover_pic_Y += new_cmY - cmY;

    cmX = new_cmX;
    cmY = new_cmY;

    paint();
}


function paint(){
    //alert('paint');
    // console.log(input_img);
    cover_ctx.fillStyle ="white";
    cover_ctx.fillRect(0, 0, cover_canvas.width, cover_canvas.height);
    draw_image(input_img[0],cover_pic_X,cover_pic_Y,input_ssr);
    cover_ctx.drawImage(mask_imgs[chosen_mask_id][0],0,0,ICON_SL,ICON_SL);

    // cover_ctx.fillText("delta_X: "+(new_cmX-cmX)+", delta_Y: "+(new_cmY-cmY), 10, 110);
    // cover_ctx.fillText("X: "+cover_pic_X+", Y: "+cover_pic_Y, 10, 20);
    // cover_ctx.fillText("cmX: "+cmX+", cmY: "+cmY, 10, 50);
    // cover_ctx.fillText("new_cmX: "+new_cmX+", new_cmY: "+new_cmY, 10, 80);

}

function draw_image(img,or_x,or_y,rate){
    //console.log(input_img.width(),input_img.height());
    let w = input_img.width()*rate;
    let h = input_img.height()*rate;
    let x = or_x - w/2;
    let y = or_y - h/2;
    // console.log('final_out:',w,h);
    cover_ctx.drawImage(img,x,y,w,h);
}


scaling_slider[0].addEventListener("mousemove",scaling_mouse);


scaling_slider[0].addEventListener('touchmove',scaling_touch);
scaling_slider[0].addEventListener('touchstart',scaling_touch);

scaling_slider.mousemove();




function scaling_touch(e){
    //console.log(e.touches.length,e.type);
    console.log(e.touches[0].pageX);
    // if(e.touches[0].pageX%1!==0||e.touches[0].pageY%1!==0)
    //     return;
    updateScaling(e.touches[0].pageX);
}

function scaling_mouse(e){
    if(isMouseDown)
        updateScaling(e.clientX);
}

let scaling_value = 50,scaling_rate,or_rate;
let vsw,vsh;
function updateScaling(x){
    vsw = scaling_slider[0].width/100,vsh=scaling_slider[0].height/100;
    scaling_value = (x - scaling_rect.left) *100 / scaling_rect.width;
    // if(scaling_value<10||scaling_value>90)
    //     return;
    console.log(scaling_value,x);
    scaling_ctx.fillStyle="#d7d7d7";
    scaling_ctx.clearRect(0,0, scaling_slider[0].width,scaling_slider[0].height);
    scaling_ctx.beginPath();
    scaling_ctx.arc(10*vsw,50*vsh,100*vsh/6,Math.PI*2,0,true);

    scaling_ctx.closePath();
    scaling_ctx.fill();
    scaling_ctx.fillRect(scaling_slider[0].width*0.1, scaling_slider[0].height/3, scaling_slider[0].width*0.8, scaling_slider[0].height/3);
    scaling_ctx.fillStyle="#41cdfa";
    scaling_ctx.beginPath();
    scaling_ctx.arc(90*vsw,50*vsh,100*vsh/6,Math.PI*2,0,true);
    scaling_ctx.arc(scaling_value*vsw,50*vsh,30*vsh,Math.PI*2,0,true);
    scaling_ctx.closePath();
    scaling_ctx.fill();
    or_rate = Math.pow(SCALING_RATE_LIM,((scaling_value / 50) -1));
    $('#scaling_value').text(Math.round(or_rate*100)+'%');
    paint();
}

scaling_slider.width(window.innerHeight*20/100);
scaling_slider.height(window.innerHeight*3/100);

const mask_imgs = [];
const mask_btns = [];
const mask_ssr = [];
const mask_w = [];
const mask_h = [];

for(let i=0; i<mask_names.length; i++){
    mask_imgs[i]=$("<img alt=\"\">")
        .attr('src','masks/'+mask_names[i]+'.png')
        .attr('alt',mask_names[i]);

    let mask_image = new Image();
    mask_image.src = 'masks/'+mask_names[i]+'.png';
    mask_image.onload =function() {
        mask_w[i] = mask_image.width;
        mask_h[i] = mask_image.height;
        // console.log(mask_w[i],mask_h[i]);
        let mask_max_side = Math.max(mask_image.width, mask_image.height);
        mask_ssr[i] = ICON_SL / mask_max_side;
        if (i === mask_names.length - 1){
            mask_btns[0].click();
            update_input();
        }
    };

    //masks_div.append(mask_imgs[i]);
    mask_btns[i]=$('<button></button>')
        .append(mask_imgs[i])
        .addClass('maskOptions');
    mask_btns_div.append(mask_btns[i]);
    mask_btns[i].click(function(){
        $('.maskOptions').removeClass('chosen');
        mask_btns[i].addClass('chosen');
        chosen_mask_id=i;
        updateScaling();
        if($('#reset_when_switching_masks').hasClass('active'))
            reset();
    });

}




function reset(){
    cover_pic_X = ICON_SL/2;
    cover_pic_Y = ICON_SL/2;
    scaling_slider.val(50);
    updateScaling();
}

$('#reset').click(function(){
    reset();

});



// $('#reset_when_switching_masks').click(function(){
//     $('#reset_when_switching_masks').toggleClass('active');
// });
//
// $('#reset_when_switching_icon').click(function(){
//     $('#reset_when_switching_icon').toggleClass('active');
// });



// let save_btns = [];
// for(let i=0;i<OUTPUT_SLS.length;i++){
//     save_btns[i]=$('<button></button>')
//         .append('保存'+OUTPUT_SLS[i]+'x'+OUTPUT_SLS[i])
//         .click(function(){
//
//             let zoom = OUTPUT_SLS[i] / ICON_SL;
//             //alert(zoom);
//             $(cover_canvas).attr('width',ICON_SL*zoom).attr('height',ICON_SL*zoom);
//             cover_ctx.scale(zoom,zoom);
//             paint();
//
//             let link = document.createElement('a');
//             link.download = 'icon';
//             link.href =  cover_canvas.toDataURL("image/png");
//             link.dataset.downloadurl = ["image/png", link.download, link.href].join(':');
//
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//
//             cover_ctx.scale(1/zoom,1/zoom);
//             $(cover_canvas).attr('width',ICON_SL).attr('height',ICON_SL);
//             paint();
//
//
//
//
//         });
//     $('#save_btns').append(save_btns[i]);
// }

$('#save').click(function(){
    $('.page_edit').css('display','none');
    $('.page_result').css('display','block');
    let image = new Image();
    image.src = cover_canvas.toDataURL("image/png");
    $('#result_div').html(image);
});

$('#one_more_btn').click(function () {
    $('.page_edit').css('display','block');
    $('.page_result').css('display','none');
});

$('#input_btn').click(function () {
    $('#input_input').click();
    random_icon_id=-1;
});

let random_icon_id=-1,random_icon_id_buf;
$('#input_random').click(function(){
    if(random_icon_id===-1) {
        random_icon_id = Math.floor(Math.random() * RANDOM_ICON_NAMES.length);
    }else{
        random_icon_id_buf = Math.floor(Math.random()*(RANDOM_ICON_NAMES.length-1));
        if(random_icon_id_buf >= random_icon_id)
            random_icon_id = random_icon_id_buf+1;
        else
            random_icon_id = random_icon_id_buf;
    }
    console.log(random_icon_id);
    input_img.attr("src",'image/random_icon/'+RANDOM_ICON_NAMES[random_icon_id]);
    input_img.ready(function() {
        input_img[0].onload =function(){
            let input_min_side = Math.min(input_img.width(),input_img.height());
            input_ssr = ICON_SL / input_min_side;
            reset();
        };
    });
});


document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, {passive: false});


