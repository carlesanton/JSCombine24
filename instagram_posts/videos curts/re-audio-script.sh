for f in *.mov; do
  ffmpeg -i "$f" -c:v copy -c:a aac -ac 2 -b:a 192k "./re-audio/$f"
done
