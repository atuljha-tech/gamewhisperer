@tool
class_name AiAnalyze
extends CanvasLayer

var ElevenSFX = load("res://lib/eleven_sfx.tscn")
var ElevenDialog = load("res://lib/eleven_dialog.tscn")

var screenshot_url = "https://i.imgur.com/5HsVLmg.png"

@export var do_not_edit_file_path = ""
var pitch_scale = 1:
	set(value):
		pitch_scale = value
		$SFX.pitch_scale = value

var audio_length:
	get():
		return $SFX.stream.get_length()

@export var autoplay = false

var sfx_array = null
var dialog_array = []

enum STATE {IDLE, PENDING}
var state = STATE.IDLE

func play():
	$SFX.play()

func stop():
	$SFX.stop()

func _ready():
	$HTTPRequest.request_completed.connect(_on_request_completed)

	if not do_not_edit_file_path:
		return

	self.pitch_scale = pitch_scale
	$SFX.stream = load(do_not_edit_file_path)
	if autoplay:
		$SFX.play()

func get_key():
	# Godot on Mac does not support environment variables
	# https://github.com/godotengine/godot/issues/96409
	var file = FileAccess.open("res://FAL_API_KEY.txt", FileAccess.READ)
	return file.get_as_text().strip_edges()

func analyze_with_ai():
	if state != STATE.IDLE:
		push_error("[GodotAI]: GodotAI is busy right now!")
		return

	state = STATE.PENDING

	var api_key = get_key()
	var url = "https://api.groq.com/openai/v1/chat/completions"
	var headers = [
		"Authorization: Bearer {api_key}".format({"api_key": api_key}),
		"Content-Type: application/json"
	]

	var prompt = """this is a game. give me a list of possible sound effects for this game.
for each sound effect, give me a unique audio "name", "description" for how it should sound like, and "why" you think its necessary.
respond with a json object that has a key "fx" that contains this list/array.
do not output markdown and only output plain text."""

	var json = JSON.stringify({
		"model": "meta-llama/llama-4-scout-17b-16e-instruct",
		"messages": [
			{
				"role": "user",
				"content": [
					{"type": "text", "text": prompt},
					{"type": "image_url", "image_url": {"url": screenshot_url}}
				]
			}
		],
		"max_tokens": 2048,
		"temperature": 0.7
	})

	print("[GodotAI]: Analyzing game with AI... Please wait!")
	$HTTPRequest.request(url, headers, HTTPClient.METHOD_POST, json)

func _on_request_completed(result, response_code, headers, body):
	if response_code != 200:
		push_error("[GodotAI]: Couldn't analyze image! Code: " + str(response_code))
		state = STATE.IDLE
		return

	var json = JSON.parse_string(body.get_string_from_utf8())
	if not json:
		push_error("[GodotAI]: Failed to parse response!")
		state = STATE.IDLE
		return

	var content = json["choices"][0]["message"]["content"]

	# Strip accidental markdown fences
	content = content.replace("```json", "").replace("```", "").strip_edges()

	var out_json = JSON.new()
	var error = out_json.parse(content)
	if error != OK:
		push_error("[GodotAI]: Couldn't parse sound effect list!")
		state = STATE.IDLE
		return

	%LoadingLabel.visible = false
	sfx_array = out_json.data.fx

	for fx in out_json.data.fx:
		var cont = VBoxContainer.new()
		cont.custom_minimum_size.x = 900
		cont.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var l_name = Label.new()
		l_name.text = JSON.stringify(fx.name)
		l_name.autowrap_mode = TextServer.AUTOWRAP_WORD
		l_name.custom_minimum_size.x = 900

		var l_desc = Label.new()
		l_desc.text = JSON.stringify(fx.description)
		l_desc.autowrap_mode = TextServer.AUTOWRAP_WORD
		l_desc.custom_minimum_size.x = 900

		var l_why = Label.new()
		l_why.text = JSON.stringify(fx.why)
		l_why.autowrap_mode = TextServer.AUTOWRAP_WORD
		l_why.custom_minimum_size.x = 900

		cont.add_child(l_name)
		cont.add_child(l_desc)
		cont.add_child(l_why)
		%ImportList.add_child(cont)

	state = STATE.IDLE
	_process_dialog()

func _process_dialog():
	dialog_array = []
	var dialog_nodes = get_all_dialog_nodes(owner.get_node("CanvasLayer"))
	for dialog in dialog_nodes:
		var dialog_name = dialog.name
		var text = dialog.text

		var cont = VBoxContainer.new()
		cont.custom_minimum_size.x = 900
		cont.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var l_name = Label.new()
		l_name.text = dialog_name
		l_name.autowrap_mode = TextServer.AUTOWRAP_WORD
		l_name.custom_minimum_size.x = 900

		var l_desc = Label.new()
		l_desc.text = text
		l_desc.autowrap_mode = TextServer.AUTOWRAP_WORD
		l_desc.custom_minimum_size.x = 900

		dialog_array.append({ "name": dialog_name, "dialog": dialog.text })

		cont.add_child(l_name)
		cont.add_child(l_desc)
		%ImportList.add_child(cont)

func _on_button_pressed() -> void:
	$CenterContainer.visible = true
	analyze_with_ai()

func _on_import_pressed() -> void:
	save_to_packed_scene(sfx_array)

func save_to_packed_scene(sfx_array):
	var root = Node2D.new()
	root.name = "SoundEffects"

	var owner_path = owner.get_scene_file_path()
	var folder_path = owner_path.get_base_dir()
	var basename = owner_path.get_file().get_basename()

	var save_to_path = "{folder_path}{file_name}".format({
		"folder_path": folder_path,
		"file_name": basename + "_audio.tscn"
	})

	for fx in sfx_array:
		var sfx = ElevenSFX.instantiate()
		root.add_child(sfx)
		sfx.owner = root
		sfx.name = fx.name
		sfx.audio_name = fx.name
		sfx.description = fx.description

	for dx in dialog_array:
		var sfx = ElevenDialog.instantiate()
		root.add_child(sfx)
		sfx.owner = root
		sfx.voice_id = "INDKfphIpZiLCUiXae4o"
		sfx.name = dx.name
		sfx.audio_name = dx.name
		sfx.dialog = dx.dialog

	var scene = PackedScene.new()
	var res = scene.pack(root)
	if res == OK:
		var err = ResourceSaver.save(scene, save_to_path)
		if err != OK:
			push_error("[GodotAI]: SFX scene could not be saved to disk!")
		%Done.visible = true

func get_all_dialog_nodes(node: Node) -> Array:
	var labels = []
	if node is RichTextLabel:
		labels.append(node)
	for child in node.get_children():
		labels.append_array(get_all_dialog_nodes(child))
	return labels
