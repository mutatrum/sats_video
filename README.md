# sats_video

Code to create sats_per_dollar - 8 years video.

https://www.youtube.com/watch?v=-KSmUEv5PAQ

# requirements

node.js
ffmpeg

Close to 1GB of diskspace.

Install dependencies with

`npm install`

Create output folder

`mkdir output`

Get price data

`wget hodl.camp/api/bitcoin/prices -O data.json`

Run code to generate video frames, this takes a while and needs ~200MB of diskplace.

`node sats_video.js`

When the frames are deemed ok, the video is created in 3 segments: intro, middle, outro.

The middle is the biggest part, and takes a while to generate:

`ffmpeg -r 25 -pattern_type glob -i 'output/*.png' -c:v libx264  -pix_fmt yuv420p middle.mp4`

The intro and outro are quick:

`ffmpeg -i intro.txt -c:a copy -vf fps=25 -vsync vfr -pix_fmt yuv420p intro.mp4`
`ffmpeg -i outro.txt -c:a copy -vf fps=25 -vsync vfr -pix_fmt yuv420p outro.mp4`

Then, to merge all of them:

`ffmpeg -f concat -safe 0 -i concat.txt -c copy merged.mp4`

For the published video, I added the music in the YouTube video editor. It's also possible to merge your own music, if you have a mp3:

`ffmpeg -i merged.mp4 -i music.mp3 -c copy -map 0:v:0 -map 1:a:0 -shortest result.mp4`

For encoding to twitter potato resolution, I used:

`ffmpeg -i "result.mp4" -vf scale=1280:720 -c:v libx264 -crf 18 -c:a copy "twitter-scaled.mp4"`

# licence

MIT