const ffmpeg = require('fluent-ffmpeg');

/**
 * 
 * @param {String} inputPath 
 * @returns 
 */
const getVideoInfo = (inputPath) => {
    return new Promise((resolve, reject) => {
      return ffmpeg.ffprobe(inputPath, (error, videoInfo) => {
        if (error) {
          return reject(error);
        }
  
        const { duration, size } = videoInfo.format;
  
        return resolve({
          size,
          durationInSeconds: Math.floor(duration),
        });
      });
    });
  };

  /**
   * 
   * @param {*} inputPath 
   * @param {*} outputPath 
   * @param {*} fragmentDurationInSeconds 
   * @returns 
   */
  const createFragmentPreview = async (
    inputPath,
    outputPath,
    fragmentDurationInSeconds = 4,
  ) => {
    return new Promise(async (resolve, reject) => {
      const { durationInSeconds: videoDurationInSeconds } = await getVideoInfo(
        inputPath,
      );
  
      const startTimeInSeconds = getStartTimeInSeconds(
        videoDurationInSeconds,
        fragmentDurationInSeconds,
      );
  
      /*
        SAMPLE
        ffmpeg -ss 146 -i video.mp4 -y -an -t 4 fragment-preview.mp4

        -ss 146: Start video processing at the 146-second mark of the video (146 is just a placeholder here, our code will randomly generate the number of seconds)
        -i video.mp4: The input file path
        -y: Overwrite any existing files while generating the output
        -an: Remove audio from the generated fragment
        -t 4: The duration of the (fragment in seconds)
        fragment-preview.mp4: The path of the output file
      */

      return ffmpeg()
        .input(inputPath)
        .inputOptions([`-ss ${startTimeInSeconds}`])
        .outputOptions([`-t ${fragmentDurationInSeconds}`])
        .noAudio()
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  };

  /**
   * 
   * @param {*} videoDurationInSeconds 
   * @param {*} fragmentDurationInSeconds 
   * @returns 
   */
  const getStartTimeInSeconds = (
    videoDurationInSeconds,
    fragmentDurationInSeconds,
  ) => {
    // by subtracting the fragment duration we can be sure that the resulting
    // start time + fragment duration will be less than the video duration
    const safeVideoDurationInSeconds =
      videoDurationInSeconds - fragmentDurationInSeconds;
  
    // if the fragment duration is longer than the video duration
    if (safeVideoDurationInSeconds <= 0) {
      return 0;
    }
  
    return getRandomIntegerInRange(
      0.25 * safeVideoDurationInSeconds,
      0.75 * safeVideoDurationInSeconds,
    );
  };

  /**
   * 
   * @param {*} min 
   * @param {*} max 
   * @returns 
   */
  const getRandomIntegerInRange = (min, max) => {
    const minInt = Math.ceil(min);
    const maxInt = Math.floor(max);
  
    return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
  };

  //=============================================================================
  /**
   * 
   * @param {*} inputPath 
   * @param {*} outputPattern 
   * @param {*} numberOfFrames 
   * @returns 
   */
  const createXFramesPreview = (
    inputPath,
    outputPattern,
    numberOfFrames,
  ) => {
    return new Promise(async (resolve, reject) => {
      const { durationInSeconds } = await getVideoInfo(inputPath);
  
      // 1/frameIntervalInSeconds = 1 frame each x seconds
      const frameIntervalInSeconds = Math.floor(
        durationInSeconds / numberOfFrames,
      );
  
      /* 
        SAMPLE
        ffmpeg -i video.mp4 -y -vf fps=1/24 thumb%04d.jpg

        -i video.mp4: The input video file
        -y: Output overwrites any existing files
        -vf fps=1/24: The filter that takes a frame every (in this case) 24 seconds
        thumb%04d.jpg: The output pattern that generates files in the following fashion: thumb0001.jpg, thumb0002.jpg, etc. The %04d part specifies that there should be four decimal numbers
      */
      return ffmpeg()
        .input(inputPath)
        .outputOptions([`-vf fps=1/${frameIntervalInSeconds}`])
        .output(outputPattern)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  };



  /**
   other usefull Command
   
    ffmpeg -framerate 1/0.6 -i thumb%04d.jpg slideshow.mp4

        -framerate 1/0.6: Each frame should be seen for 0.6 seconds
        -i thumb%04d.jpg: The pattern for the images to be included in the slideshow
        slideshow.mp4: The output video file name

    //converting a video to the gif format could be done with one command:
        ffmpeg -i video.mp4 -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" converted-video.gif
   */

module.exports = { getVideoInfo, createFragmentPreview, createXFramesPreview }