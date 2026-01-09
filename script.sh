#!/bin/bash

# --- Configuration ---
# WARNING: Your API key is a secret! Do not share it.
# It's safer to set this as an environment variable.
API_KEY="8f228f234df9023dc58925b95eb7d9cc008d6ab050c201cc804d4e6f8cf468fa"

# Default voice ID (used as fallback if a mood-specific voice ID is not set)
VOICE_ID="Qggl4b0xRMiqOwhPtVWT"
MODEL_ID="eleven_multilingual_v2"
# Allow override from environment; default to my_audio_files
: "${OUTPUT_DIR:=my_audio_files}"

# --- Optional controls (can be overridden via environment) ---
# Set FILTER_MOOD to limit to one mood (Good|Okay|Bad|Awful), empty means all
: "${FILTER_MOOD:=Awful}"
# Set FILTER_CONTEXT to limit to one context (Still|Move|Focused), empty means all
: "${FILTER_CONTEXT:=Focused}"
# Generate only prompts with index >= START_INDEX (1-based)
: "${START_INDEX:=1}"
# If >0, stop after END_INDEX (inclusive)
: "${END_INDEX:=0}"
# If true, only (re)generate when file is missing or too small
: "${REGENERATE_MISSING_ONLY:=true}"
# Bytes threshold below which a file is considered invalid/incomplete
: "${MIN_VALID_BYTES:=2048}"

# --- Per-mood voice IDs (override these if you have specific voices) ---
# Good mood  - Clara relaxing
VOICE_ID_GOOD="Qggl4b0xRMiqOwhPtVWT"
# Okay mood  - Cal Deep and Calming
VOICE_ID_OKAY="Fxt4GZnlXkUGMtWSYIcm"
# Bad mood   - Clara relaxing
VOICE_ID_BAD="Qggl4b0xRMiqOwhPtVWT"
# Awful mood - Cal Deep and Calming
VOICE_ID_AWFUL="Fxt4GZnlXkUGMtWSYIcm"

# --- Prompts grouped by Mood and Context ---

# Mood: Good | Context: Still
GOOD_STILL=(
    "Visualize and do a mindful body scan for 2 minutes"
    "Write down three things you're grateful for  and reflect on them for 1 minute each"
    "Recite a positive affirmation aloud and repeat it slowly 10 times"
    "Visualize your ideal day for a full 2 minutes"
    "Repeat the phrase 'Today, I am at peace with everything and everyone' and repeat 10 times"
    "Stretch your arms slowly and smile. Then repeat 10  times"
    "Sit with eyes closed and breathe deeply like this with a with a 4 - 2 - 4 pattern breathing in through your nose for 4 seconds, hold for 2 seconds and out through your moputh for 4 seconds  and repeat his cycle  for 2 minutes"
    "Say the phrase 'I chose clam over chaos' slowly and and repeat it 12 times."
    "Draw a doodle of how you feel afor 3 minutes"
    "Imagine yourself floating on calm water for a full 2 minutes"
    "Say the phrase 'Joy flows through me' and and slowly repeat 12 times"
    "Light a candle and focus on the flame for 3 minutes"
    "Visualise a place you love for 2 minutes"
    "Recite the phrase 'I am rooted and grounded' and slowly repeat it 10 times"
    "Do a 4-7-8 breathing pattern. Through your mouth, Inhale for 4 seconds, Hold for 7 seconds, and Exhale for 8 seconds and  repeat the cycle for 2 minutes"
)

# Mood: Good | Context: Move
GOOD_MOVE=(
    "Walk while noticing five things around you and reflect on each one for 30 seconds "
    "Say the phrase 'Every step energises me' and repeat for 1 minute"
    "Visualise your feet touching lightly with each walking step for 2 minutes"
    "Stretch out one arm at a time while walking and repeat 5 times on each side"
    "Recite your favourite quote as you walk and repeat it slowly 5 times"
    "Swing arms loosely and smile and repeat the action 10 times"
    "Breath in rhythm of your foot steps. Inhale through your mouth for 4 seconds, hold for 2 seconds, and exhale through your  nose for 4 seconds and repeat 10 times"
    "Picture yourself on a mountain path and reflect on that for 2 minutes"
    "Recite the phrase 'Step by step,  I move forward' and slowly repeat it for 1 minute"
    "Tap fingers to the beat of your walk for a full minute"
    "Imagine a bubble of light around you and concentrate on that for 2 minutes"
    "Recite the phrase ' I am grounded and moving forward' and slowly repeat 10 times"
    "Bounce lightly on your toes for a full minute"
    "Picture your body as fluid and strong, and keep that thought for 2 minutes"
    "Recire 'Movement is joy' and and slowly repeat 12 times"
)

# Mood: Good | Context: Focused
GOOD_FOCUSED=(
    "NEED TO ADD THIS"
    "Repeat the phrase 'I am alert and clear' 10 times"
    "Visualise a beam of light guiding your focus and tune into that for 2 minutes"
    "Recite a short poem from memory and repeat it slowly 3 more times"
    "Listen to this 2 minute motivational quote recording "
    "Visualise a calm ocean while breathing in a 4-2-6 patter. inhale through your nose for 4 seconds, hold 2 seconds, and exhale through your mouth for 6 seconds)  and repeat the cyele 5 times"
    "Recite the phrase 'Clarity is my strength' and slowly repeat it 10 times"
    "Listen to the following nature sounds with your eyes open"
    "Imagine your thoughts as clouds passing by, and keep that thought for 2 minutes"
    "Recite the phrase ' Each moment matters' and slowly repeat for 1 minute"
    "Focus on one sound in your environment and think on that sound for 2 minutes"
    "Visualise your brain lighting up and reflect on that calmly for 2 minutes"
    "Recite the phrase ' I am present and attentive' and repeat it slowly 10 times"
    "Listen to the following biaural beats"
    "Picture a tunnel narrowing towards one goal, and stay in that thought for 2 minutes"
)

# Mood: Okay | Context: Still
OKAY_STILL=(
    "Try this box breathing for 2 minutes: Inhale 4 seconds, hold 4 seconds, and  exhale  4 seconds, "
    "Recite the phrase  'I can handle this, one thing at a time' and repeat it for 1 minute"
    "Do this 5–4–3–2–1 sensing exercise: name 5 items you see,  4 items you can touch,  3 sounds you hear, 2 odours you can smell, and  1 item you taste "
    "Do the following Even-count breathing: Inhale 5 seconds and exhale 5 seconds for 2 minutes"
    "Recite the phrase  'Steady and present' on every exhale and repeat 12 times"
    "Do a slow Shoulder roll and neck release on each side and repeat 10 times on each side"
    "Quietly Count 20 slow breaths, reset if you lose track "
    "Write down 5  small wins and 5  next step "
    "Recir the phrase 'Calm attention grows with practice' and repeat for 1 minute"
    "Try this 4–6 breathing for 2 minutes : Inhale 4 seconds, exhale 6 seconds"
    "Do this Hands-on-belly breathing:Feek the rise and fall ofr slow breaths for 2 minutes"
    "Visualise a quiet room; where you sit cmnfortably and breathing evenly for 2 minutes"
    "Recite the phrase 'Just this task, just this moment' and repeat slowly for  2 minutes"
    "Scan your head and shoulders for tension; Soften and relax  your jaw, neck and shoulders on each exhale for 2 minutes"
    "Write down  3-item you have to do, think on each for 30 seconds and then circle only one as the priority"
)

# Mood: Okay | Context: Move
OKAY_MOVE=(
    "Try this  breathing exercise for 2 minutes: Inhale for 3 secondss, hold for 4 seconds, and exhale for 6 seconds "
    "Repeat gently while walking: 'Steady pace, steady mind' for 2 minutes"
    "Try this awareness walk: Notice your feet, left and right feet in ralternation for 60 steps "
    "Do a Head-up scan: widen your peripheral vision for 1 minute"
    "Inhale and exhale through your nose at a natural pace and continue for a full minute."
    "Recite the phrase 'I move with ease,I move with grace, and I move with care' while at a gentle pace and repeat for 2 minutes"
    "Reflect on 3 colours you see and 3 sounds you hear for 2 minutes"
    "Try this Posture check: lengthen the spine, then soften and rotate shoulders every 30 sec and repeat 6 times"
    "Try this focused Step count focus: Do 100  steps calmly without glancing at youyr phone "
    "Do this Triangle breathing while walking: Inhale 4 seconds, hold 4 seconds, and exhale 4 seconds for 2 full minutes"
    "Recite the phrase 'I am safe and aware' as you walk at a gentle pace and repeat 12 times"
    "As you walk,notice ground contact of your heel to toe sequence for 25 steps "
    "Try this Breath cue: inhale when left foot lands, and exhale when right foot lands for 2 minutes"
    "Do the following Gaze the horizon check: look far ahead for 10 sec, and return to near view for 10 seconds for 2 minutes"
    "Recite the phrase 'Calm carries me forward, sure  and steady' walking at a gentle pace for 2 minutes"
)

# Mood: Okay | Context: Focused
OKAY_FOCUSED=(
    "Try this attentional breathing: Inhale 4 seconds, hold 4 seconds, and exhale 4 seconds for 2 minutes"
    "Recite quetly: 'One task now, and fully focused' every 10 seconds and repeat 10 times"
    "Listen to this calm musical segment "
    "Try this exercdise for your eyes : relax the eyebrow, and widen your view for 1 minute"
    "Do this 4-7-8 breathing exercise t: Inhale 4 seconds, hold 7 seconds, and exhale 8 seconds and repeat the cycle for 2 minutes "
    "Recire the phrase 'Attention returns when I breathe calmly' and repeat for 2 minutes"
    "Repeat 'I am focused, I can do this' for a full minute"
    "Slowly count back by 5 from 60 to engage working memory "
    "Do even breaths through your nose only for 20 breaths"
    "Repeat: 'I am calm, composed,  and precise'  for 1 minute"
    "Inhale 4 seconds and blowing up your cheeks exhale slowlythrough your mouth  for 6 seconds. Then repeat every 20 seconds for 2 minutes"
    "Name 3 concrete details out aloud about the task you are performing"
"Do this paced breathing exercise : Inhale through your nose over 4 seconds, and exhale through your mouth over 6 seconds and repeat for 2 minutes"
"Repeat: 'Present. Patient. Precise.' 20 times"
"For 2 minutes Think about how good you will feel when you have completed the task in hand. Imagine someone congratulating you."
)

# Mood: Bad | Context: Still
BAD_STILL=(
    "Try this Rescue Breathing exercise: Inhale 3 seconds, hold 2 seconds, and exhale slowly over 6 seconds. Repeat for 2 minutes"
    "Repeat this phrase slowly Ten times 'It's Ok to pause and reflect'"
    "Do this weighted exhale breathing by counting 1 to 5 on the out-breath, and repeat for 12 times"
    "Relax your fists on the inhale, and tense them on the exhale, and continue for 2 minutes"
    "Say the phrase 'I don't have to solve anything right now' and repeat 10 times"
    "Place your hands on your chest and feel your inhale for 4 seconds, and exhale for 6 seconds, then repeat for 2 minutes"
    "Name one safe object in your surounding and describe it out loud for 30 seconds"
    "Relax your vagal tone by humming softly on each exhale for 1 minute"
    "Repeat the phrase 'This wave of feeling bad will pass' and repeat 12 times"
    "Do this 4-4-6 breathing by inhaling for 4 seconds, holding for 4 seconds, and exhaling for 6 seconds. Then repeat for 2 minutes"
    "Try this calming wrap by crossing arms and holding your shoulders, and slowly taking deep breaths 12 times"
    "Try this Grounding exercise by pressing your feet into the floor, then scrunching up your toes for 5 seconds, and then repeat for 1 minute"
    "Repeat the phrase 'I may feel bad, but I am safe enough to rest' and repeat for a minute"
    "Visualise and think of a safe place while you take slow breaths for 2 miutes"
    "Try this Rescue Count by counting 20 slow breaths, and reset if your mind wanders."
) 

# Mood: Bad | Context: Move
BAD_MOVE=(
    "Try this Soothe-walk exercise by taking 3 steps on the inhale, and 5 steps on the exhale. Then repest for 2 minutes."
    "Repeat 'gentle pace, gentle mind' every 5 steps and repeat 10 times"
    "Do a peripheral vision check by turning your eyes to the left and expanding your side vision for 30 seconds. Then repeat on the right  side."
    "Scan your movinf posture by unlocking your knees and relaxing your jaw every 20 steps"
    "Only breathe through your nose slowly for 20 breaths"
    "Repeat 'I can move through this turbulence' every 5 steps and repeat 12 times"
    "Counts 30 even steps, and reset if distracted."
    "Do a sigh release by taking a deep sigh every 20 seconds and repeat 6 times"
    "Try a low-gaze walk by looking 10 meters ahead as you walk safely for 1 minute."
    "Do a 4-2-6 breathing as you walk with inhalation for 4 seconds, hold for 2 seconds, and exhsale for 6 seconds, then repeat for 2 minutes."
    "Repeat 'calm will return to me, step by step' for 2 minutes"
    "Notice 3 stable surfaces that you pass and reflect on each for 30 seconds."
    "Match your breat to your footstep for a full 1 minute."
    "Make a mental note of 2 neutral objects and a calming sound as you walk."
    "drop and rotate your shoulders to release tension on each exhale for 1 minute."
)

# Mood: Bad | Context: Focused
BAD_FOCUSED=(
    "Do this paced breathing exercie by inhaling for 4 seconds and exhaling for 6 seconds for 2 miutes"
    "Repeat 'One thing only, one thing at a time' 12 times"
    "Check on your safe anchor by being aware of your feet for 2 minutes"
    "Slowly repeat out loud 5 facts about the your focused task"
    "Listen to this music audio for 2 minutes"
    "Repeat this phrase 10  times 'I am safe, grounded, and moving forward'"
    "Listen to this steady heartbeat for 2 minutes"
    "Concentrate on your neck and imagine it to be relaxed for 2 minutes"
    "Slowly breath in and out through you rnose for 20 breaths"
    "Repeat 'Slow and Steady, I feel safe' and repeat 10 times"
    "Listen to this calming biaural audio for 2 minutes"
    "Set your timer for 2 minutes and think of the passing time for 2 minutes"
    "Listen to the following audio of ocean waves for 2 minutes"
    "Repeat the phrase 'Present and careful, I am fully focused' 10 times"
    "inhale 3 seconds, hold 3 seconds, and exhale for 6 seconds. Then repeat 10 times."
)

# Mood: Awful | Context: Still
AWFUL_STILL=(
    "Inhale 3 seconds, and exhale 4 seconds then say 'feeling safer now'. Then repeat 12 times"
    "Name out aloud 3 objests that you feel are safe, then describe them for 30 seconds each"
    "Place one hand on your chest and repeat 'I am conquering this awful feeling'  12 times"
    "Slowly count down from 10 to 1 timed to each breath and repeat for 2 minutes"
    "Imagine a safe room with soft lightening ande mentally furnish it over 2 minutes"
    "Breathe in for 4 seconds and breathe out for 6 seconds, then repeat  for 2 minutes"
    "Recite the phrase 'this calming breathing makes me feel right' "
    "Take a sip of cool water and notice its temperature as it travels from you rmouth, to your stomach  as you swallow"
    "Grip a cushion, and release it slowly  on every exhale for 2 minute."
    "gently humm on each exhale for 1 minute"
    "Repeat the phrase 'I am safe to pause and reflect' 12 times"
    "Do this square breathing exercise by inhaling for 4 seconds, holding for 4 seconds, exhale for 4 seconds      and repeat for 2 minutes"
    "Notice 2 smells and 2 sounds and reflect on them for 30 seconds each"
    "Visualise a Guardian presence standing by you and reflect in that support for 2 minutes"
    "Repeat this phrase 12 times  'I can get through this moment and the next, I have strength'"
)

# Mood: Awful | Context: Move
AWFUL_MOVE=(
    "Try this safeety walk by breathing in for 3 steps and breathing out for 5 steps and repeat for 2 minutes"
    "Repeat 'I am aware of myself, my surrounding, and feel safe' every 10 steps for 2 minutes"
    "Scan ahead as you move and make  deliberate actions to avoid 5 obstacles you see"
    "Name 5 landmarks passively and without judgment as you move"
    "As you walk, breathe in through your nose for 3 seconds and breathe out for 5 seconds. Repeat for 2 minutes."
    "Repeat 'I am grounded and feel safe to keep moving forward' 12 times"
    "Count each step to 20 and restart if distracted"
    "Do a  10 second horizon check every 10 steps  for 2 minutes to and  tunnel vision"
    "Feel your shoes contact the ground and note the heel-to-toe sequence for 2 minutes."
    "Inhale through your nose for 3 seconds and exhale through your mouth for 5 seconds for 2 minutes"
    "Repeat the phrase 'Forward and onward, safe and steady' 12 times"
    "Name and stand for 10 seconds each on any safe 3 stable surfaces you can see "
    "Match your breating to your steps inhaling for 3 steps and exhaling for 6 steps. Repeat 12 times"
    "Roll and relax your shoulders  once every 10 steps for 2 minutes as you walk"
    "Repeat 12 times  'I am enjoying this movement, it is giving me strength'"
)

# Mood: Awful | Context: Focused
AWFUL_FOCUSED=(
    "Focusing on your task, breathe in for 3 seconds and breathe out for 6 seconds for 2 minutes"
    "Repeat for 12 times  'Every movement of my task is a safe step and moves me onward'"
    "Listen to this biaural audio for 2 minutes"
    "Name out loud 5 important steps or facts about your current task"
    "Stay focused while breathing in for 4 seconds, hold for 2 seconds, and breathing out for 5 seconds. Repeat for 2 minutes"
    "Repeat 'I am in tune with this task, safe and focused' 12 times"
    "Talk out aloud 3 important safety requirements in your current task"
    "Listen to the ocean waves lapping the schore (2 Min)"
    "For 2 minutes, visualise your mentor or teacher standing and watching over you"
    "Repeat 10 times 'I was made for this task, I can do it'"
    "Do a safety and comfort check by checking your feet and adjusting your seat or stance"
    "Deeply inhale for 4 seconds and gently humm as you exhale for 6 seconds. Repeat for 2 minutes"
    "Listen to this music for 2 minutes"
    "Repeat 10 times 'If I can do one small thing, I can do bigger things'"
    "Describe over 30 seconds how you will feel and what you will do  after your task is complete"
)

# --- Helpers ---
get_voice_id() {
    case "$1" in
        Good)  echo "$VOICE_ID_GOOD" ;;
        Okay)  echo "$VOICE_ID_OKAY" ;;
        Bad)   echo "$VOICE_ID_BAD"  ;;
        Awful) echo "$VOICE_ID_AWFUL";;
        *)     echo "$VOICE_ID" ;;
    esac
}

# Cross-platform file size (macOS/Linux)
get_file_size_bytes() {
    local file_path="$1"
    if [ ! -f "$file_path" ]; then
        echo 0
        return
    fi
    local size
    size=$(stat -f%z "$file_path" 2>/dev/null) || size=$(stat -c%s "$file_path" 2>/dev/null || echo 0)
    echo "$size"
}

# Perform TTS request with retries and validation
perform_tts_request() {
    local text="$1"
    local voice_id="$2"
    local output_file="$3"
    local model_id="$4"
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        local tmp_out
        local tmp_hdr
        tmp_out=$(mktemp -t ttsXXXX.mp3)
        tmp_hdr=$(mktemp -t hdrXXXX.txt)

        local json_payload
        json_payload=$(printf '{"text": "%s", "model_id": "%s"}' "$text" "$model_id")

        local http_code
        http_code=$(curl -sS \
            -o "$tmp_out" \
            -D "$tmp_hdr" \
            -w "%{http_code}" \
            --request POST \
            --url "https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128" \
            --header "content-type: application/json" \
            --header "xi-api-key: $API_KEY" \
            --data "$json_payload")

        local content_type
        content_type=$(grep -i '^content-type:' "$tmp_hdr" | head -n1 | cut -d: -f2- | tr -d '\r' | xargs)
        local size_bytes
        size_bytes=$(get_file_size_bytes "$tmp_out")
        local mime_out
        mime_out=$(file -b --mime-type "$tmp_out" 2>/dev/null || echo "")
        local is_audio=0
        if echo "$content_type" | grep -qi "audio" || echo "$mime_out" | grep -qi '^audio/'; then
            is_audio=1
        fi

        # Success when HTTP 200, audio detected by header or file mime-type, and file size >= threshold
        if [ "$http_code" = "200" ] && [ $is_audio -eq 1 ] && [ "$size_bytes" -ge "$MIN_VALID_BYTES" ]; then
            mv -f "$tmp_out" "$output_file"
            rm -f "$tmp_hdr"
            echo "Saved: $output_file ($size_bytes bytes)"
            return 0
        fi

        # Save error details for inspection
        mv -f "$tmp_out" "${output_file}.error_body"
        mv -f "$tmp_hdr" "${output_file}.error_headers"
        echo "Error (attempt $attempt/$max_attempts): HTTP=$http_code, CT=${content_type:-unknown}, MIME=${mime_out:-unknown}, Size=${size_bytes} -> $output_file" >&2

        # Backoff before retry (2s, 4s)
        sleep $((attempt * 2))
        attempt=$((attempt + 1))
    done

    echo "Failed after $max_attempts attempts: $output_file" >&2
    return 1
}

# --- Main Script Logic ---

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

moods=(Good Okay Bad Awful)
contexts=(Still Move Focused)

for mood in "${moods[@]}"; do
    voice_id=$(get_voice_id "$mood")
    for context in "${contexts[@]}"; do
        # Apply optional filters
        if [ -n "$FILTER_MOOD" ] && [ "$mood" != "$FILTER_MOOD" ]; then
            continue
        fi
        if [ -n "$FILTER_CONTEXT" ] && [ "$context" != "$FILTER_CONTEXT" ]; then
            continue
        fi
        counter=1

        # Build the UPPERCASE var name like GOOD_STILL / OKAY_MOVE / BAD_FOCUSED / AWFUL_STILL
        varname=$(printf "%s_%s" "$mood" "$context" | tr '[:lower:]' '[:upper:]')

        # Copy the referenced array into a local array "arr"
        eval "arr=(\"\${${varname}[@]}\")"

        # Skip if no prompts defined
        if [ ${#arr[@]} -eq 0 ]; then
            continue
        fi

        for text in "${arr[@]}"; do
            formatted_counter=$(printf "%02d" $counter)
            output_file="$OUTPUT_DIR/Mood_${mood}_Content_${context}_Audio_${formatted_counter}.mp3"

            # Index range controls
            if [ $counter -lt $START_INDEX ]; then
                ((counter++))
                continue
            fi
            if [ $END_INDEX -gt 0 ] && [ $counter -gt $END_INDEX ]; then
                break
            fi

            # Skip valid existing files when requested
            if [ "$REGENERATE_MISSING_ONLY" = "true" ]; then
                size_bytes=$(get_file_size_bytes "$output_file")
                if [ "$size_bytes" -ge "$MIN_VALID_BYTES" ]; then
                    echo "Skipping existing valid file: $output_file ($size_bytes bytes)"
                    ((counter++))
                    continue
                fi
            fi

            echo "Generating audio for: $output_file"
            perform_tts_request "$text" "$voice_id" "$output_file" "$MODEL_ID"

            # Gentle pacing to avoid rate limiting
            sleep 0.5

            ((counter++))
        done
    done
done

echo ""
echo "✅ All audio files have been generated in the '$OUTPUT_DIR' folder."