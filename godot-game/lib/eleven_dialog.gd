@tool
extends Node2D

# TODO: we need some sort of IDEMPOTENCY key here
# since the user can spam "Generate audio"
@export var audio_name = ""
@export var voice_id = "Xb7hH8MSUJpSbSDYk0k2"
@export var model_id = "eleven_multilingual_v2"
@export_multiline var dialog = ""
@export_tool_button("Generate Dialog Audio", "Callable") var gen_sfx_action = gen_sfx

# XXX: It should be possible to save this
# data/node somewhere hidden
# but let's do this for now.
@export var do_not_edit_file_path = ""
var pitch_scale = 1:
	set(value):
		pitch_scale = value
		$SFX.pitch_scale = value

var audio_length:
	get():
		return $SFX.stream.get_length()

@export var autoplay = false

enum STATE {IDLE, PENDING}
var state = STATE.IDLE

# XXX: maybe we should have extended audiostreamplayer!
func play():
	$SFX.play()

func stop():
	$SFX.stop()

func _ready():
	if Engine.is_editor_hint():
		$HTTPRequest.request_completed.connect(_on_request_completed)
		
	if not do_not_edit_file_path:
		return
		
	self.pitch_scale = pitch_scale
	$SFX.stream = load(do_not_edit_file_path)
	if autoplay:
		$SFX.play()

func gen_sfx():
	if state == STATE.PENDING:
		push_error("[GodotAI]: GodotAI is busy right now!")
		return
	
	if audio_name.length() <= 3 or dialog.length() <=3:
		push_error("[GodotAI]: Please provide more info for the Dialog Audio!")
		return
	
	state = STATE.PENDING
	
	# godot on mac does not support environment variables
	# https://github.com/godotengine/godot/issues/96409#issuecomment-2323042441
	# we read a gitignored (and godot ignored) file for now.
	# var api_key = OS.get_environment("ELEVEN_LABS_API_KEY")
	var file = FileAccess.open("res://ELEVEN_LABS_API_KEY.txt", FileAccess.READ)
	var api_key = file.get_as_text().split("\n")[0]
	
	var url = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128".format({"voice_id": voice_id})
	var headers = [
		"xi-api-key: {api_key}".format({"api_key": api_key}),
		"Content-Type: application/json"
	]
	
	var data = {
		"text": dialog,
		"model_id": model_id
	}
	var json = JSON.stringify(data)
	
	print("[GodotAI]: Generating audio file")
	$HTTPRequest.request(url, headers, HTTPClient.METHOD_POST, json)

func _on_request_completed(result, response_code, headers, body):
	if response_code != 200:
		push_error("[GodotAI]: Couldn't generate SoundFX!")
		return
	
	var file_path = "res://godotai/dialog/{name}.mp3".format({"name": audio_name})
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	
	if not file:
		push_error("Failed to open file for writing: " + file_path)
		return
		
	file.store_buffer(body)
	file.close()
	state = STATE.IDLE
	do_not_edit_file_path = file_path
	print("[GodotAI]: Dialog Audio successfully generated!")
