<script>
	let { value = $bindable(''), placeholder = 'Enter content...' } = $props();
	
	let editorRef;
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	
	// Sync editor content when value changes externally
	$effect(() => {
		if (editorRef && editorRef.innerHTML !== value) {
			editorRef.innerHTML = value || '';
		}
	});
	
	function execCommand(command, value = null) {
		document.execCommand(command, false, value);
		editorRef?.focus();
		updateToolbarState();
		updateValue();
	}
	
	function updateToolbarState() {
		isBold = document.queryCommandState('bold');
		isItalic = document.queryCommandState('italic');
		isUnderline = document.queryCommandState('underline');
	}
	
	function updateValue() {
		if (editorRef) {
			value = editorRef.innerHTML;
		}
	}
	
	function handleInput() {
		updateValue();
	}
	
	function handlePaste(e) {
		e.preventDefault();
		const text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
		updateValue();
	}
	
	function createLink() {
		const url = prompt('Enter URL:');
		if (url) {
			execCommand('createLink', url);
		}
	}
	
</script>

<div class="border-border bg-card rounded-xl border">
	<!-- Toolbar -->
	<div class="border-border flex flex-wrap items-center gap-2 border-b p-3">
		<button
			type="button"
			onclick={() => execCommand('bold')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm font-bold transition-colors {isBold ? 'bg-primary/10 text-primary' : ''}"
			title="Bold"
		>
			B
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('italic')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm italic transition-colors {isItalic ? 'bg-primary/10 text-primary' : ''}"
			title="Italic"
		>
			I
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('underline')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm underline transition-colors {isUnderline ? 'bg-primary/10 text-primary' : ''}"
			title="Underline"
		>
			U
		</button>
		
		<div class="border-border h-6 w-px border-l"></div>
		
		<button
			type="button"
			onclick={createLink}
			class="hover:bg-secondary rounded-lg p-2 transition-colors"
			title="Insert Link"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		</button>
	</div>
	
	<!-- Editor -->
	<div
		bind:this={editorRef}
		contenteditable="true"
		oninput={handleInput}
		onpaste={handlePaste}
		onmouseup={updateToolbarState}
		onkeyup={updateToolbarState}
		class="text-foreground h-[25vh] min-h-[75px] w-full resize-none rounded-b-xl bg-background p-4 focus:outline-none overflow-y-auto"
		style="white-space: pre-wrap;"
		data-placeholder={placeholder}
	>
		{@html value}
	</div>
</div>

<style>
	[contenteditable='true']:empty:before {
		content: attr(data-placeholder);
		color: var(--color-muted-foreground);
	}
	
	[contenteditable='true']:focus {
		outline: none;
	}
	
	[contenteditable='true'] a {
		color: var(--color-primary);
		text-decoration: underline;
	}
</style>
