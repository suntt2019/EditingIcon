const ICON_SL = Math.round($('body').height()*35/100);//SL:side length
//
const SCALING_RATE_LIM = 4;//limit of scaling rate
//SCALING_RATE_LIM=x,limit= 1/x ~ x
//for example: SCALING_RATE_LIM=4, scaling limit=25%~400%
const RANDOM_ICON_CNT = 4;
const mask_names = [
    "chongya_black",
    "chongya_white",
    "icon_frame",
];
const OUTPUT_SL = 512;
// const OUTPUT_SLS = [
//     64,
//     128,
//     256,
//     512,
//     1024
// ];

let chosen_mask_id=0;
let input_img = $("#input_img");
const scaling_slider = $('#scaling_slider');
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
    draw_image(input_img[0],cover_pic_X,cover_pic_Y,input_ssr * or_rate);
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


scaling_slider.mousemove(updateScaling);
scaling_slider[0].addEventListener('touchmove',function(e){
    updateScaling();
});
scaling_slider.mousemove(updateScaling);
scaling_slider.mouseup(updateScaling);

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


let scaling_value = 50,scaling_rate,or_rate;


function updateScaling(){
    scaling_value = scaling_slider.val();
    or_rate = Math.pow(SCALING_RATE_LIM,((scaling_value / 50) -1));
    $('#scaling_value').text(Math.round(or_rate*100)+'%');
    paint();
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
    let image = new Image();
    image.src = cover_canvas.toDataURL("image/png");
    $('#result_div').html(image);
});

$('#input_btn').click(function () {
    $('#input_input').click();
    random_icon_id=-1;
});

let random_icon_id=-1,random_icon_id_buf;
$('#input_random').click(function(){
    if(random_icon_id===-1) {
        random_icon_id = Math.floor(Math.random() * RANDOM_ICON_CNT);
    }else{
        random_icon_id_buf = Math.floor(Math.random()*(RANDOM_ICON_CNT-1));
        if(random_icon_id_buf >= random_icon_id)
            random_icon_id = random_icon_id_buf+1;
        else
            random_icon_id = random_icon_id_buf;
    }
    console.log(random_icon_id);
});


document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, {passive: false});
