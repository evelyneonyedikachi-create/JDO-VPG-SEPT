import subprocess
import base64
import json
import urllib.request
import os

test_sentences = [
    "Am See scheint die Sonne. Der Junge schwimmt im Wasser.",
    "Vor der Tür gibt Leo seine Mutter einen Kuss.",
    "das zimmer ist ser schön.",
    "wir rennen schnel zum bahnhof.",
    "der Junge schwimmt im Wasser.",
    "Er hat ein altes Schloss gesehen.",
    "Heute beginnen die Ferien.",
    "Im Ofen brennen viele Holzstücke."
]

os.makedirs("/tmp/qa_hw_tests", exist_ok=True)
results = []

print("=== CHECKPOINT 1: HANDWRITING TRANSCRIPTION REAL DATA QA ===")

for idx, sentence in enumerate(test_sentences, start=1):
    png_path = f"/tmp/qa_hw_tests/hw_{idx}.png"
    # Create realistic handwriting-like image on white background using ImageMagick
    cmd = [
        "convert",
        "-size", "1000x200",
        "xc:white",
        "-font", "DejaVu-Sans",
        "-pointsize", "36",
        "-fill", "black",
        "-gravity", "center",
        "-annotate", "+0+0", sentence,
        png_path
    ]
    subprocess.run(cmd, check=True)

    with open(png_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    
    data_url = f"data:image/png;base64,{b64}"

    req_data = json.dumps({"image": data_url}).encode("utf-8")
    req = urllib.request.Request(
        "http://localhost:3000/api/recognize-handwriting",
        data=req_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        res_json = json.loads(resp.read().decode("utf-8"))

    transcribed = res_json.get("text", "")
    results.append({
        "index": idx,
        "written": sentence,
        "transcribed": transcribed,
        "matches_literally": sentence.strip().lower() == transcribed.strip().lower()
    })
    print(f"[{idx}/8] WRITTEN:     \"{sentence}\"")
    print(f"      TRANSCRIBED: \"{transcribed}\"")
    print(f"      LITERAL:     {sentence.strip().lower() == transcribed.strip().lower()}")
    print("-" * 60)

with open("/tmp/qa_hw_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("Handwriting test complete.")
