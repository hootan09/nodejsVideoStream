const {createFragmentPreview,createXFramesPreview,getVideoInfo} = require('./utils/ffmpeg');

const videoPath = "./public/uploads/clara_2018/Clara_2018_HD480.mp4";

//get vide info
const getInfo = async () => {
    try {
        videoInfo = await getVideoInfo(videoPath);
        console.log(videoInfo);
    } catch (err) {
        console.log(err);
    }
}
// getInfo();
// $ node test_ffmpeg.js
// { size: 382405014, durationInSeconds: 6027 }

const createPreview = async() =>{
    try {
        await createFragmentPreview(videoPath, './public/uploads/clara_2018/fragment-preview.mp4', 10);
    } catch (err) {
        console.log(err);
    }
}
// createPreview();

//Note: runs Slowly used Massive Cpu Time
const createXFramePic = async ()=>{
    try {
        await createXFramesPreview(videoPath, './public/uploads/clara_2018/thumb%04d.jpg' , 5);
    } catch (err) {
        console.log(err);
    }
}
createXFramePic();